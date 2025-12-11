// prisma/seed/seedQuestions.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type Q = {
    question: string;
    categoryName: string;
    weight: number;
    order: number;
};

const questions: Q[] = [
    // Social Interaction
    {
        question: 'Makes eye contact?',
        categoryName: 'Social Interaction',
        weight: 3,
        order: 1,
    },
    {
        question: 'Enjoys playing with other children?',
        categoryName: 'Social Interaction',
        weight: 3,
        order: 2,
    },
    {
        question: "Understands other people's feelings?",
        categoryName: 'Social Interaction',
        weight: 3,
        order: 3,
    },

    // Speech & Communication
    {
        question: 'Speaks in full sentences?',
        categoryName: 'Communication',
        weight: 3,
        order: 1,
    },
    {
        question: 'Repeats words or phrases?',
        categoryName: 'Communication',
        weight: 2,
        order: 2,
    },
    {
        question: 'Difficulty answering questions?',
        categoryName: 'Communication',
        weight: 3,
        order: 3,
    },

    // Play Skills
    {
        question: 'Engages in pretend play?',
        categoryName: 'Play Skills',
        weight: 2,
        order: 1,
    },
    {
        question: 'Prefers to play alone?',
        categoryName: 'Play Skills',
        weight: 2,
        order: 2,
    },

    // Repetitive Behaviors
    {
        question: 'Repeats body movements?',
        categoryName: 'Repetitive Behaviors',
        weight: 3,
        order: 1,
    },
    {
        question: 'Gets upset by changes in routine?',
        categoryName: 'Repetitive Behaviors',
        weight: 3,
        order: 2,
    },

    // Sensory Processing
    {
        question: 'Sensitive to sounds or textures?',
        categoryName: 'Sensory Processing',
        weight: 3,
        order: 1,
    },
    {
        question: 'Seeks certain sensations?',
        categoryName: 'Sensory Processing',
        weight: 2,
        order: 2,
    },

    // Emotional Regulation
    {
        question: 'Frequent meltdowns when frustrated?',
        categoryName: 'Emotional Regulation',
        weight: 3,
        order: 1,
    },
    {
        question: 'Trouble calming down once upset?',
        categoryName: 'Emotional Regulation',
        weight: 3,
        order: 2,
    },

    // Motor Skills
    {
        question: 'Trouble with fine motor tasks?',
        categoryName: 'Motor Skills',
        weight: 2,
        order: 1,
    },
    {
        question: 'Walks on tiptoes often?',
        categoryName: 'Motor Skills',
        weight: 2,
        order: 2,
    },

    // Cognitive Style
    {
        question: 'Excellent memory but trouble with problem-solving?',
        categoryName: 'Cognitive Style',
        weight: 2,
        order: 1,
    },
    {
        question: 'Takes things literally?',
        categoryName: 'Cognitive Style',
        weight: 2,
        order: 2,
    },

    // Attention & Executive Function
    {
        question: 'Trouble focusing on tasks?',
        categoryName: 'Attention & Executive Function',
        weight: 3,
        order: 1,
    },
    {
        question: 'Easily distracted?',
        categoryName: 'Attention & Executive Function',
        weight: 3,
        order: 2,
    },

    // Behavior & Self-Control
    {
        question: 'Acts impulsively?',
        categoryName: 'Behavior & Self-Control',
        weight: 3,
        order: 1,
    },
    {
        question: 'Shows aggression when upset?',
        categoryName: 'Behavior & Self-Control',
        weight: 3,
        order: 2,
    },

    // Daily Living & Self-Care
    {
        question: 'Difficulties with toilet training?',
        categoryName: 'Daily Living & Self-Care',
        weight: 2,
        order: 1,
    },
    {
        question: 'Resists bathing, brushing teeth, or dressing?',
        categoryName: 'Daily Living & Self-Care',
        weight: 3,
        order: 2,
    },

    // Learning & Attention (new)
    {
        question: 'Has difficulty following multi-step instructions?',
        categoryName: 'Learning & Attention',
        weight: 3,
        order: 1,
    },
    {
        question: 'Needs frequent reminders to stay on task?',
        categoryName: 'Learning & Attention',
        weight: 2,
        order: 2,
    },

    // Behavioral Patterns (new)
    {
        question: 'Insists on doing things a specific way?',
        categoryName: 'Behavioral Patterns',
        weight: 3,
        order: 1,
    },
    {
        question: 'Gets fixated on specific interests or activities?',
        categoryName: 'Behavioral Patterns',
        weight: 2,
        order: 2,
    },
];

async function main() {
    console.log(`Seeding ${questions.length} questions...`);

    // build a map from category name -> id
    const categoryNames = Array.from(
        new Set(questions.map((q) => q.categoryName)),
    );
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
