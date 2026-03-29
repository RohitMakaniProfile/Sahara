import OpenAI from 'openai';
import { openaiApiKey, openaiModelName } from '../config.js';
import aiRepository from '../db/repository/ai.repository.js';

// ---------------------------------------------------------------------------
// OpenAI client (optional — rule-based engine works without it)
// ---------------------------------------------------------------------------
const openai = openaiApiKey
    ? new OpenAI({ apiKey: openaiApiKey })
    : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function isWeekend(date: Date = new Date()): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
}

type SkillScore = {
    name: string;
    categoryId: number;
    normalizedScore: number;
    trend: 'improving' | 'stable' | 'needs_focus';
};

function computeSkillScores(child: NonNullable<Awaited<ReturnType<typeof aiRepository.getChildWithContext>>>): SkillScore[] {
    if (!child.autismBehaviourForms || child.autismBehaviourForms.length === 0)
        return [];

    const latestForm = child.autismBehaviourForms[0]!;
    const previousForm = child.autismBehaviourForms[1];

    return latestForm.categoryOutputs.map((output) => {
        const prevOutput = previousForm?.categoryOutputs.find(
            (p) => p.categoryId === output.categoryId,
        );

        let trend: SkillScore['trend'] = 'stable';
        if (prevOutput) {
            const diff = output.normalizedScore - prevOutput.normalizedScore;
            if (diff >= 5) trend = 'improving';
            else if (diff <= -5) trend = 'needs_focus';
        }

        return {
            name: output.category.name,
            categoryId: output.categoryId,
            normalizedScore: output.normalizedScore,
            trend,
        };
    });
}

type CheckIn = Awaited<ReturnType<typeof aiRepository.getRecentCheckIns>>[number];

function computeCheckInStats(checkIns: CheckIn[]) {
    const byDay = new Map<string, { done: number; total: number }>();
    const byTag = new Map<string, { done: number; total: number }>();

    for (const ci of checkIns) {
        const dateKey = ci.date.toISOString().slice(0, 10);
        const dayStats = byDay.get(dateKey) ?? { done: 0, total: 0 };
        dayStats.total++;
        if (ci.status === 'DONE') dayStats.done++;
        else if (ci.status === 'PARTIAL') dayStats.done += 0.5;
        byDay.set(dateKey, dayStats);

        for (const tag of ci.item?.activity?.tags ?? []) {
            const tagStats = byTag.get(tag) ?? { done: 0, total: 0 };
            tagStats.total++;
            if (ci.status === 'DONE') tagStats.done++;
            else if (ci.status === 'PARTIAL') tagStats.done += 0.5;
            byTag.set(tag, tagStats);
        }
    }

    const recentDays = Array.from(byDay.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, 7)
        .map(([date, stats]) => ({
            date,
            rate: stats.total > 0 ? stats.done / stats.total : 0,
        }));

    const consecutiveGoodDays = (() => {
        let count = 0;
        for (const { rate } of recentDays) {
            if (rate >= 0.8) count++;
            else break;
        }
        return count;
    })();

    return { byDay, byTag, recentDays, consecutiveGoodDays };
}

function matchActivitiesToSkill(
    activities: Awaited<ReturnType<typeof aiRepository.getAllActivities>>,
    skillName: string,
) {
    const keywords = skillName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((k) => k.length > 2);

    return activities.filter((a) =>
        a.tags.some((tag) =>
            keywords.some((kw) => tag.toLowerCase().includes(kw)),
        ),
    );
}

function pickActivity<T extends { id: number }>(pool: T[], exclude: number[]): T | undefined {
    const filtered = pool.filter((a) => !exclude.includes(a.id));
    if (filtered.length === 0) return pool[0];
    // Slight randomness so each day isn't identical
    return filtered[Math.floor(Math.random() * Math.min(3, filtered.length))];
}

// ---------------------------------------------------------------------------
// Priority 1 — Adaptive Daily Routine Engine
// ---------------------------------------------------------------------------
export async function runAdaptiveEngine(
    childId: number,
    parentId: number,
    opts: { lowEnergy?: boolean; timezone?: string } = {},
) {
    const [child, checkIns, activities] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getRecentCheckIns(childId, 7),
        aiRepository.getAllActivities(),
    ]);

    if (!child) return null;

    const childName = child.name;
    const age = calculateAge(child.dob);
    const today = new Date();
    const isWeekendDay = isWeekend(today);

    const skillScores = computeSkillScores(child);
    const { byTag, consecutiveGoodDays } = computeCheckInStats(checkIns);

    // ── Weekend / Low-energy mode ─────────────────────────────────────────
    if (isWeekendDay || opts.lowEnergy) {
        const calmingKeywords = ['sensory', 'calm', 'breathing', 'relaxation'];
        const calmingPool = activities.filter((a) =>
            a.tags.some((t) =>
                calmingKeywords.some((kw) => t.toLowerCase().includes(kw)),
            ),
        );
        const selected = calmingPool.length >= 2
            ? calmingPool.slice(0, 2)
            : activities.slice(0, 2);

        return {
            profile: 'calming' as const,
            focusArea: 'Sensory Regulation',
            childName,
            age,
            date: today.toISOString().slice(0, 10),
            explanation: `Today is a ${isWeekendDay ? 'weekend' : 'low-energy'} day. We picked gentle, calming activities to help ${childName} feel comfortable and regulated.`,
            skillScores: [],
            items: selected.map((a, i) => ({
                title: a.title,
                activityId: a.id,
                order: i + 1,
                why: `A low-demand sensory activity chosen to support ${childName}'s wellbeing today.`,
            })),
        };
    }

    // ── No assessment data yet ────────────────────────────────────────────
    if (skillScores.length === 0) {
        const selected = activities.slice(0, 3);
        return {
            profile: 'default' as const,
            focusArea: 'General Development',
            childName,
            age,
            date: today.toISOString().slice(0, 10),
            explanation: `Complete the 24Q assessment to unlock ${childName}'s personalised adaptive plan.`,
            skillScores: [],
            items: selected.map((a, i) => ({
                title: a.title,
                activityId: a.id,
                order: i + 1,
                why: 'A well-rounded activity for general development.',
            })),
        };
    }

    // ── Adaptive mode ─────────────────────────────────────────────────────
    const sorted = [...skillScores].sort(
        (a, b) => a.normalizedScore - b.normalizedScore,
    );
    const weakest = sorted[0];
    const secondary = sorted[1];

    if (!weakest) {
        // Should not happen since skillScores.length > 0 was checked, but guard anyway
        return null;
    }

    // Detect if child is stuck (doing activities but score in mediocre range)
    const weakestTag = weakest.name.toLowerCase().replace(/\s+/g, '_');
    const tagData = byTag.get(weakestTag);
    const isStuck =
        tagData && tagData.total >= 3
            ? tagData.done / tagData.total >= 0.3 &&
              tagData.done / tagData.total <= 0.65
            : false;

    const usedIds: number[] = [];
    const items: {
        title: string;
        activityId: number;
        order: number;
        why: string;
    }[] = [];

    // Primary: weakest skill activity
    const primaryPool = matchActivitiesToSkill(activities, weakest.name);
    const primaryActivity = pickActivity(
        primaryPool.length > 0 ? primaryPool : activities,
        usedIds,
    );
    if (primaryActivity) {
        usedIds.push(primaryActivity.id);
        items.push({
            title: primaryActivity.title,
            activityId: primaryActivity.id,
            order: 1,
            why: isStuck
                ? `${childName} has been building ${weakest.name} — we've picked a fresh activity to help break through the current level.`
                : `${weakest.name} is ${childName}'s focus area (score: ${Math.round(weakest.normalizedScore)}%). This activity targets it directly.`,
        });
    }

    // Secondary: add new skill area if 2+ consecutive good days
    if (consecutiveGoodDays >= 2 && secondary) {
        const secondaryPool = matchActivitiesToSkill(activities, secondary.name);
        const secondaryActivity = pickActivity(
            secondaryPool.length > 0 ? secondaryPool : activities,
            usedIds,
        );
        if (secondaryActivity) {
            usedIds.push(secondaryActivity.id);
            items.push({
                title: secondaryActivity.title,
                activityId: secondaryActivity.id,
                order: 2,
                why: `${childName} has had ${consecutiveGoodDays} great days in a row! We're introducing ${secondary.name} as a new growth area.`,
            });
        }
    }

    // Always end with a calming/sensory transition activity
    const calmingActivity = activities.find(
        (a) =>
            a.tags.some((t) =>
                ['sensory', 'calm', 'breathing'].some((kw) =>
                    t.toLowerCase().includes(kw),
                ),
            ) && !usedIds.includes(a.id),
    );
    if (calmingActivity) {
        items.push({
            title: calmingActivity.title,
            activityId: calmingActivity.id,
            order: items.length + 1,
            why: `A calming wind-down to help ${childName} transition and regulate between tasks.`,
        });
    }

    const focusLabel = isStuck
        ? `${weakest.name} (new approach)`
        : weakest.name;

    const explanation = [
        `Based on ${childName}'s last 7 days, today's focus is ${weakest.name} (score: ${Math.round(weakest.normalizedScore)}%).`,
        isStuck ? ` We've switched to a new activity to help ${childName} progress past the current level.` : '',
        consecutiveGoodDays >= 2
            ? ` ${childName} has been doing brilliantly — we're also introducing ${secondary?.name ?? 'a new skill'} today.`
            : '',
    ]
        .join('')
        .trim();

    return {
        profile: 'adaptive' as const,
        focusArea: focusLabel,
        childName,
        age,
        date: today.toISOString().slice(0, 10),
        explanation,
        skillScores: skillScores.map((s) => ({
            category: s.name,
            score: Math.round(s.normalizedScore),
            trend: s.trend,
        })),
        items,
    };
}

// ---------------------------------------------------------------------------
// Priority 2 — AI Parent Coach Chat
// ---------------------------------------------------------------------------
function buildChildContextString(
    child: NonNullable<Awaited<ReturnType<typeof aiRepository.getChildWithContext>>>,
    recentCheckIns: CheckIn[],
    topAACSymbols: Awaited<ReturnType<typeof aiRepository.getTopAACSymbols>>,
): string {
    const age = calculateAge(child.dob);
    const latestForm = child.autismBehaviourForms?.[0];

    const categoryScores =
        latestForm?.categoryOutputs
            .map((o) => `${o.category.name}: ${Math.round(o.normalizedScore)}%`)
            .join(', ') ?? 'No assessment completed yet';

    const recentActivities = recentCheckIns
        .slice(0, 10)
        .map((ci) => {
            const name =
                ci.item?.activity?.title ?? ci.item?.title ?? 'activity';
            const statusLabel =
                ci.status === 'DONE'
                    ? 'completed'
                    : ci.status === 'PARTIAL'
                      ? 'partially done'
                      : 'skipped';
            return `${name} (${statusLabel})`;
        })
        .join(', ');

    const aacWords = topAACSymbols.map((s) => s.title).join(', ');

    return `Child: ${childName_from(child)}, Age: ${age}, Developmental stage: ${child.developmentalStage ?? 'not specified'}
Skill scores (0–100, lower = needs more support): ${categoryScores}
Recent activities (last 10 check-ins): ${recentActivities || 'none recorded yet'}
Most-used AAC words (last 7 days): ${aacWords || 'none recorded yet'}`;
}

// tiny helper to avoid repetition
function childName_from(child: { name: string }) {
    return child.name;
}

export async function parentCoachChat(
    parentId: number,
    childId: number,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<{ reply: string } | null> {
    if (!openai) {
        return {
            reply: 'AI chat is not available yet. Add OPENAI_API_KEY to your environment to enable it.',
        };
    }

    const [child, recentCheckIns, topSymbols] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getRecentCheckIns(childId, 7),
        aiRepository.getTopAACSymbols(childId, 7, 6),
    ]);

    if (!child) return null;

    const childContext = buildChildContextString(
        child,
        recentCheckIns,
        topSymbols,
    );

    const systemPrompt = `You are Sahara's AI parent coach — warm, knowledgeable, and deeply supportive. Here is the child's current profile:

${childContext}

Strict rules:
- Answer using ONLY the data above. Never say "I don't have enough information."
- NEVER use diagnostic labels: no "autism", "ASD", "ADHD", "disorder", "impairment", "deficit".
- Frame everything in terms of skills, growth, and development — never deficits.
- Keep responses to 2–4 sentences. Warm, clear, and encouraging.
- If asked what an activity does, explain the specific skill it builds and why it matters.
- If asked about a score, explain it as a current skill level, not a test result.`;

    const response = await openai.chat.completions.create({
        model: openaiModelName,
        max_tokens: 400,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
        ],
    });

    const reply = response.choices[0]?.message?.content ?? '';
    return { reply };
}

// ---------------------------------------------------------------------------
// Priority 4 — Therapist Progress Report
// ---------------------------------------------------------------------------
export async function generateTherapistReport(
    childId: number,
    parentId: number,
) {
    const [child, assessmentHistory, recentCheckIns] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getAssessmentHistory(childId, 2),
        aiRepository.getRecentCheckIns(childId, 28),
    ]);

    if (!child) return null;

    const age = calculateAge(child.dob);
    const latestForm = assessmentHistory[0];
    const previousForm = assessmentHistory[1];

    const skillAreas = (latestForm?.categoryOutputs ?? []).map((o) => {
        const prev = previousForm?.categoryOutputs.find(
            (p) => p.categoryId === o.categoryId,
        );
        let trend: 'improving' | 'stable' | 'needs_focus' = 'stable';
        if (prev) {
            const diff = o.normalizedScore - prev.normalizedScore;
            if (diff >= 5) trend = 'improving';
            else if (diff <= -5) trend = 'needs_focus';
        }
        return {
            name: o.category.name,
            score: Math.round(o.normalizedScore),
            trend,
        };
    });

    const { byDay } = computeCheckInStats(recentCheckIns);
    let totalDone = 0,
        totalScheduled = 0;
    for (const stats of byDay.values()) {
        totalDone += stats.done;
        totalScheduled += stats.total;
    }
    const completionRate =
        totalScheduled > 0
            ? Math.round((totalDone / totalScheduled) * 100)
            : 0;

    const improvingAreas = skillAreas
        .filter((s) => s.trend === 'improving')
        .map((s) => s.name);
    const needsFocusAreas = skillAreas
        .filter((s) => s.trend === 'needs_focus' || s.score < 50)
        .map((s) => s.name);
    const strongAreas = skillAreas
        .filter((s) => s.score >= 60)
        .map((s) => s.name);

    let strengths: string[] = [];
    let developingAreas: string[] = [];
    let recommendedFocus: string[] = [];

    // Try OpenAI for richer narrative
    if (openai && skillAreas.length > 0) {
        try {
            const prompt = `Write a brief therapist-style progress summary for ${child.name} (age ${age}).

Skill scores: ${skillAreas.map((s) => `${s.name}: ${s.score}% (${s.trend})`).join(', ')}
Activity completion rate over 4 weeks: ${completionRate}%

Return ONLY valid JSON (no extra text):
{
  "strengths": ["<2-3 sentences about progress, skill-framed, positive>"],
  "developingAreas": ["<2-3 sentences, frame as emerging/developing — never deficit>"],
  "recommendedFocus": ["<2-3 specific next steps or activity suggestions>"]
}

Rules: Never use diagnostic labels. Professional but accessible language.`;

            const aiResponse = await openai.chat.completions.create({
                model: openaiModelName,
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }],
            });

            const text = aiResponse.choices[0]?.message?.content ?? '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                strengths = parsed.strengths ?? [];
                developingAreas = parsed.developingAreas ?? [];
                recommendedFocus = parsed.recommendedFocus ?? [];
            }
        } catch {
            // fall through to rule-based fallback
        }
    }

    // Rule-based fallback
    if (strengths.length === 0) {
        strengths =
            improvingAreas.length > 0
                ? improvingAreas.map(
                      (a) =>
                          `${a} is showing consistent improvement across recent sessions.`,
                  )
                : strongAreas.map(
                      (a) => `${a} is a developing strength for ${child.name}.`,
                  );
        if (strengths.length === 0)
            strengths = [`${child.name} is engaged and making consistent effort.`];
    }

    if (developingAreas.length === 0) {
        developingAreas =
            needsFocusAreas.length > 0
                ? needsFocusAreas.map(
                      (a) =>
                          `${a} is an emerging area with significant room to grow through structured practice.`,
                  )
                : [`All skill areas are showing steady development.`];
    }

    if (recommendedFocus.length === 0) {
        recommendedFocus = [
            ...needsFocusAreas
                .slice(0, 2)
                .map((a) => `Continue structured activities targeting ${a}`),
        ];
        if (completionRate < 70)
            recommendedFocus.push(
                'Increase routine consistency — daily activity completion is key to building skills.',
            );
        if (recommendedFocus.length === 0)
            recommendedFocus.push(
                `Maintain current routine and introduce new activities in ${improvingAreas[0] ?? 'the strongest skill area'}.`,
            );
    }

    const from = new Date();
    from.setDate(from.getDate() - 28);

    return {
        child: {
            name: child.name,
            age,
            developmentalStage: child.developmentalStage ?? 'Not specified',
        },
        reportPeriod: {
            from: from.toISOString().slice(0, 10),
            to: new Date().toISOString().slice(0, 10),
        },
        skillAreas,
        activityCompletion: {
            completionRate,
            activeDays: byDay.size,
        },
        strengths,
        developingAreas,
        recommendedFocus,
        generatedAt: new Date().toISOString(),
    };
}

// ---------------------------------------------------------------------------
// Priority 5 — Reassessment Intelligence
// ---------------------------------------------------------------------------
export async function checkReassessmentNeeded(
    childId: number,
    parentId: number,
) {
    const [child, recentCheckIns] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getRecentCheckIns(childId, 7),
    ]);

    if (!child) return null;

    const latestForm = child.autismBehaviourForms[0];
    if (!latestForm) {
        return {
            needed: true,
            reason: `${child.name} hasn't completed an assessment yet. Start the 24Q to unlock a personalised plan.`,
            urgency: 'high' as const,
        };
    }

    const { consecutiveGoodDays, recentDays } =
        computeCheckInStats(recentCheckIns);
    const avgRate =
        recentDays.reduce((sum, d) => sum + d.rate, 0) /
        Math.max(recentDays.length, 1);
    const highScoreCategories = latestForm.categoryOutputs.filter(
        (o) => o.normalizedScore >= 80,
    ).length;
    const totalCategories = latestForm.categoryOutputs.length;
    const daysSinceLast = Math.floor(
        (Date.now() - new Date(latestForm.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
    );

    if (consecutiveGoodDays >= 6 && avgRate >= 0.8) {
        return {
            needed: true,
            reason: `${child.name} has been completing over 80% of activities for ${consecutiveGoodDays} days in a row. It might be time to reassess and unlock new skill areas.`,
            urgency: 'high' as const,
            consecutiveGoodDays,
            completionRate: Math.round(avgRate * 100),
        };
    }

    if (
        totalCategories > 0 &&
        highScoreCategories >= Math.floor(totalCategories * 0.7) &&
        daysSinceLast >= 14
    ) {
        return {
            needed: true,
            reason: `${child.name} is scoring above 80% in ${highScoreCategories} of ${totalCategories} skill areas. A reassessment will reveal new growth opportunities.`,
            urgency: 'medium' as const,
            highScoreCategories,
            totalCategories,
        };
    }

    if (daysSinceLast >= 30) {
        return {
            needed: true,
            reason: `It's been ${daysSinceLast} days since ${child.name}'s last assessment. Regular reassessments help track progress accurately.`,
            urgency: 'low' as const,
            daysSinceLastAssessment: daysSinceLast,
        };
    }

    return {
        needed: false,
        reason: `${child.name} is on track. Continue the current plan.`,
        urgency: null as null,
        daysSinceLastAssessment: daysSinceLast,
    };
}

// ---------------------------------------------------------------------------
// "Why this routine item?" — one-sentence AI explanation
// ---------------------------------------------------------------------------
export async function explainRoutineItem(
    childId: number,
    parentId: number,
    itemId: number,
) {
    const [child, item, recentCheckIns] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getRoutineItemById(itemId),
        aiRepository.getRecentCheckIns(childId, 7),
    ]);

    if (!child || !item) return null;
    // Verify this item belongs to this child's routine
    if (item.routine.childId !== childId) return null;

    // Rule-based fallback (no API key required)
    const activityTags = item.activity?.tags ?? [];
    const latestForm = child.autismBehaviourForms[0];
    const weakestCategory = latestForm?.categoryOutputs[0];

    const ruleBasedWhy = weakestCategory
        ? `We chose "${item.activity?.title ?? item.title}" today because it targets ${weakestCategory.category.name} — ${child.name}'s current focus area.`
        : `"${item.activity?.title ?? item.title}" supports ${child.name}'s overall skill development.`;

    if (!openai) {
        return { explanation: ruleBasedWhy };
    }

    // Recent performance on this item
    const recentPerformance = recentCheckIns
        .filter((ci) => ci.itemId === itemId)
        .slice(0, 3)
        .map((ci) => ci.status)
        .join(', ');

    const skillScores =
        latestForm?.categoryOutputs
            .map(
                (o) =>
                    `${o.category.name}: ${Math.round(o.normalizedScore)}%`,
            )
            .join(', ') ?? 'not assessed';

    const prompt = `In ONE sentence (max 20 words), explain why this activity was chosen for ${child.name} today.

Activity: "${item.activity?.title ?? item.title}"
${item.activity?.description ? `What it does: ${item.activity.description}` : ''}
${activityTags.length > 0 ? `Skill tags: ${activityTags.join(', ')}` : ''}
${child.name}'s skill scores: ${skillScores}
Recent history for this activity: ${recentPerformance || 'first time trying this'}

Write only the one-sentence explanation. Warm tone. No diagnostic labels.`;

    try {
        const response = await openai.chat.completions.create({
            model: openaiModelName,
            max_tokens: 80,
            messages: [{ role: 'user', content: prompt }],
        });

        const explanation =
            response.choices[0]?.message?.content?.trim() ?? ruleBasedWhy;

        return { explanation };
    } catch {
        return { explanation: ruleBasedWhy };
    }
}

// ---------------------------------------------------------------------------
// Priority 3 — AAC Personalized symbols (frequent + suggested)
// ---------------------------------------------------------------------------
export async function getPersonalizedAAC(childId: number, parentId: number) {
    const [child, recentCheckIns, topSymbols] = await Promise.all([
        aiRepository.getChildWithContext(childId, parentId),
        aiRepository.getRecentCheckIns(childId, 7),
        aiRepository.getTopAACSymbols(childId, 7, 6),
    ]);

    if (!child) return null;

    // Collect tags from recent DONE activities → suggest matching AAC categories
    const recentTags = [
        ...new Set(
            recentCheckIns
                .filter((ci) => ci.status === 'DONE')
                .flatMap((ci) => ci.item?.activity?.tags ?? []),
        ),
    ];

    const suggestedCategories =
        await aiRepository.getAACCategoriesByTags(recentTags);
    const suggestedCategoryIds = suggestedCategories.map((c) => c.id);

    // Exclude symbols already in the "recent" list
    const recentSymbolIds = new Set(topSymbols.map((s) => s.id));
    const suggestedRaw = await aiRepository.getSymbolsByCategories(
        suggestedCategoryIds,
        12,
    );
    const suggested = suggestedRaw.filter((s) => !recentSymbolIds.has(s.id));

    return {
        childId,
        childName: child.name,
        recent: topSymbols, // top 6 most used in last 7 days
        suggested: suggested.slice(0, 6), // up to 6 AI-suggested
        suggestedBecause:
            recentTags.length > 0
                ? `Based on ${child.name}'s recent activities (${recentTags.slice(0, 3).join(', ')})`
                : null,
    };
}
