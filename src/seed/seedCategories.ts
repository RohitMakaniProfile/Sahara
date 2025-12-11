// prisma/seedCategories.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    { name: 'Communication' },
    { name: 'Social Interaction' },
    { name: 'Sensory Processing' },
    { name: 'Behavioral Patterns' },
    { name: 'Learning & Attention' },
    { name: 'Play Skills' },
    { name: 'Repetitive Behaviors' },
    { name: 'Emotional Regulation' },
    { name: 'Motor Skills' },
    { name: 'Cognitive Style' },
    { name: 'Attention & Executive Function' },
    { name: 'Behavior & Self-Control' },
    { name: 'Daily Living & Self-Care' },
];

async function main() {
    console.log(`Seeding ${categories.length} autism categories...`);

    // createMany is fast; skipDuplicates ensures safe re-run
    const result = await prisma.autismCategory.createMany({
        data: categories,
        skipDuplicates: true, // won't error if run multiple times
    });

    console.log(
        `Inserted ${result.count} new categories (skipDuplicates=true).`,
    );
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
