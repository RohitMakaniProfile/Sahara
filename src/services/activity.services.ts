import { prisma } from '../db/prisma.js';

type TaggableResponse = {
    parentResponse: number;
    question: {
        weight: number;
        tags: string[];
    };
};

const extractPriorityTags = (responses: TaggableResponse[]) => {
    const tagScoreMap: Record<string, number> = {};

    for (const r of responses) {
        const severity = r.parentResponse * r.question.weight;

        if (severity === 0) continue;

        for (const tag of r.question.tags) {
            tagScoreMap[tag] = (tagScoreMap[tag] || 0) + severity;
        }
    }

    return tagScoreMap;
};

const getRankedActivities = async (tagScoreMap: Record<string, number>) => {
    const tags = Object.keys(tagScoreMap);

    const activities = await prisma.activity.findMany({
        where: {
            tags: {
                hasSome: tags,
            },
        },
    });

    return activities
        .map((activity) => {
            let score = 0;

            for (const tag of activity.tags) {
                if (tagScoreMap[tag]) {
                    score += tagScoreMap[tag];
                }
            }

            return { ...activity, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};

export default {
    extractPriorityTags,
    getRankedActivities,
};
