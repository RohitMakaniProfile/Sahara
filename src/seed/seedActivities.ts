import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const activities = [
    {
        title: 'Calm Down Cloud',
        description: 'Breathing activity to reduce meltdowns',
        tags: ['calming_strategies', 'self_soothing'],
    },
    {
        title: 'Magic Texture Garden',
        description: 'Touch and explore different textures',
        tags: ['tactile_processing'],
    },
    {
        title: 'Follow the Light',
        description: 'Improve focus and attention',
        tags: ['attention_concentration'],
    },
    {
        title: 'Toe Walking Balance Game',
        description: 'Improve walking control',
        tags: ['toe_walking', 'balance'],
    },
    {
        title: 'Impulse Control Robot',
        description: 'Wait and follow commands game',
        tags: ['impulse_control', 'command_following'],
    },
];

async function main() {
    await prisma.activity.createMany({
        data: activities,
        skipDuplicates: true,
    });

    console.log('Activities seeded');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
