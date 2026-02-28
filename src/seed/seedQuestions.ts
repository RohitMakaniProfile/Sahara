// prisma/seed/seedQuestions.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type Q = {
    question: string;
    categoryName: string;
    weight: number;
    order: number;
    tags: string[];
};

const questions: Q[] = [
    // Social Interaction
    {
        question: 'Makes eye contact?',
        categoryName: 'Social Interaction',
        weight: 3,
        order: 1,
        tags: ['social_engagement', 'greetings'],
    },
    {
        question: 'Enjoys playing with other children?',
        categoryName: 'Social Interaction',
        weight: 3,
        order: 2,
        tags: ['social_play', 'turn_taking'],
    },
    {
        question: "Understands other people's feelings?",
        categoryName: 'Social Interaction',
        weight: 3,
        order: 3,
        tags: ['empathy', 'emotional_recognition'],
    },

    // Speech & Communication
    {
        question: 'Speaks in full sentences?',
        categoryName: 'Communication',
        weight: 3,
        order: 1,
        tags: ['verbal_fluency', 'communication_gaps'],
    },
    {
        question: 'Repeats words or phrases?',
        categoryName: 'Communication',
        weight: 2,
        order: 2,
        tags: ['echolalia', 'communication_flexibility'],
    },
    {
        question: 'Difficulty answering questions?',
        categoryName: 'Communication',
        weight: 3,
        order: 3,
        tags: ['communication_gaps', 'problem_solving'],
    },

    // Play Skills
    {
        question: 'Engages in pretend play?',
        categoryName: 'Play Skills',
        weight: 2,
        order: 1,
        tags: ['imagination', 'cognitive_play'],
    },
    {
        question: 'Prefers to play alone?',
        categoryName: 'Play Skills',
        weight: 2,
        order: 2,
        tags: ['social_isolation', 'joint_attention'],
    },

    // Repetitive Behaviors
    {
        question: 'Repeats body movements?',
        categoryName: 'Repetitive Behaviors',
        weight: 3,
        order: 1,
        tags: ['stimming', 'body_awareness', 'energy_release'],
    },
    {
        question: 'Gets upset by changes in routine?',
        categoryName: 'Repetitive Behaviors',
        weight: 3,
        order: 2,
        tags: ['frustration_tolerance', 'flexibility'],
    },

    // Sensory Processing
    {
        question: 'Sensitive to sounds or textures?',
        categoryName: 'Sensory Processing',
        weight: 3,
        order: 1,
        tags: [
            'tactile_processing',
            'auditory_processing',
            'calming_strategies',
        ],
    },
    {
        question: 'Seeks certain sensations?',
        categoryName: 'Sensory Processing',
        weight: 2,
        order: 2,
        tags: ['sensory_seeking', 'proprioception', 'heavy_work'],
    },

    // Emotional Regulation
    {
        question: 'Frequent meltdowns when frustrated?',
        categoryName: 'Emotional Regulation',
        weight: 3,
        order: 1,
        tags: [
            'calming_strategies',
            'frustration_tolerance',
            'emotional_regulation',
        ],
    },
    {
        question: 'Trouble calming down once upset?',
        categoryName: 'Emotional Regulation',
        weight: 3,
        order: 2,
        tags: ['calming_strategies', 'self_soothing'],
    },

    // Motor Skills
    {
        question: 'Trouble with fine motor tasks?',
        categoryName: 'Motor Skills',
        weight: 2,
        order: 1,
        tags: [
            'grip_strength',
            'finger_control',
            'hand_eye_coordination',
            'pre_writing',
        ],
    },
    {
        question: 'Walks on tiptoes often?',
        categoryName: 'Motor Skills',
        weight: 2,
        order: 2,
        tags: ['toe_walking', 'walking_control', 'balance', 'gross_motor'],
    },

    // Cognitive Style
    {
        question: 'Excellent memory but trouble with problem-solving?',
        categoryName: 'Cognitive Style',
        weight: 2,
        order: 1,
        tags: ['problem_solving', 'cognitive_flexibility'],
    },
    {
        question: 'Takes things literally?',
        categoryName: 'Cognitive Style',
        weight: 2,
        order: 2,
        tags: ['abstract_thinking', 'pragmatics'],
    },

    // Attention & Executive Function
    {
        question: 'Trouble focusing on tasks?',
        categoryName: 'Attention & Executive Function',
        weight: 3,
        order: 1,
        tags: ['attention_concentration', 'task_completion'],
    },
    {
        question: 'Easily distracted?',
        categoryName: 'Attention & Executive Function',
        weight: 3,
        order: 2,
        tags: ['attention_concentration', 'focus'],
    },

    // Behavior & Self-Control
    {
        question: 'Acts impulsively?',
        categoryName: 'Behavior & Self-Control',
        weight: 3,
        order: 1,
        tags: ['impulse_control', 'waiting', 'command_following'],
    },
    {
        question: 'Shows aggression when upset?',
        categoryName: 'Behavior & Self-Control',
        weight: 3,
        order: 2,
        tags: ['emotional_regulation', 'calming_strategies'],
    },

    // Daily Living & Self-Care
    {
        question: 'Difficulties with toilet training?',
        categoryName: 'Daily Living & Self-Care',
        weight: 2,
        order: 1,
        tags: ['toileting', 'body_awareness'],
    },
    {
        question: 'Resists bathing, brushing teeth, or dressing?',
        categoryName: 'Daily Living & Self-Care',
        weight: 3,
        order: 2,
        tags: ['tactile_processing', 'oral_sensory_input', 'self_care'],
    },
];

async function main() {
    console.log(`Seeding ${questions.length} questions...`);

    // build a map from category name -> id
    const categoryNames = Array.from(
        new Set(questions.map((q) => q.categoryName)),
    );

    // Ensure required categories exist (safe to re-run)
    await prisma.autismCategory.createMany({
        data: categoryNames.map((name) => ({ name })),
        skipDuplicates: true,
    });

    const categories = await prisma.autismCategory.findMany({
        where: { name: { in: categoryNames } },
    });

    const catByName = new Map(categories.map((c) => [c.name, c.id]));

    // verify all categories exist
    const missing = categoryNames.filter((n) => !catByName.has(n));
    if (missing.length) {
        throw new Error(
            `Missing categories in DB: ${missing.join(
                ', ',
            )}. Please run the category seed first or create them in Studio.`,
        );
    }

    // prepare data for createMany
    const data = questions.map((q) => ({
        question: q.question,
        categoryId: catByName.get(q.categoryName)!,
        weight: q.weight,
        order: q.order,
        tags: q.tags,
    }));

    // use createMany with skipDuplicates if desired
    const res = await prisma.autismBehaviourQuestionnaire.createMany({
        data,
        skipDuplicates: true,
    });

    console.log(`Inserted ${res.count} questions (skipDuplicates=true).`);
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
