import { PrismaClient, type AACCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding AAC data...');

    // -------- CLEAR OLD DATA --------
    await prisma.aACSymbol.deleteMany();
    await prisma.aACCategory.deleteMany();

    // -------- CREATE CATEGORIES --------

    const categoriesData = [
        { title: 'Quick Chat', orderIndex: 1 },
        { title: 'Time', orderIndex: 2 },
        { title: 'Food', orderIndex: 3 },
        { title: 'Drinks', orderIndex: 4 },
        { title: 'Snacks', orderIndex: 5 },
        { title: 'Activities', orderIndex: 6 },
        { title: 'Emotions', orderIndex: 7 },
        { title: 'Body', orderIndex: 8 },
        { title: 'Clothing', orderIndex: 9 },
        { title: 'People', orderIndex: 10 },
        { title: 'Kitchen', orderIndex: 11 },
        { title: 'School', orderIndex: 12 },
        { title: 'Animals', orderIndex: 13 },
        { title: 'Technology', orderIndex: 14 },
        { title: 'Weather', orderIndex: 15 },
        { title: 'Plants', orderIndex: 16 },
        { title: 'Sports', orderIndex: 17 },
        { title: 'Transport', orderIndex: 18 },
        { title: 'Places', orderIndex: 19 },
        { title: 'Position', orderIndex: 20 },
        { title: 'Toys', orderIndex: 21 },
        { title: 'Actions', orderIndex: 22 },
        { title: 'Questions', orderIndex: 23 },
        { title: 'Furniture', orderIndex: 24 },
        { title: 'Hygiene', orderIndex: 25 },
        { title: 'Numbers', orderIndex: 26 },
    ];

    const createdCategories: Array<Pick<AACCategory, 'id' | 'title'>> = [];

    for (const cat of categoriesData) {
        const category = await prisma.aACCategory.create({
            data: {
                title: cat.title,
                iconUrl: null,
                orderIndex: cat.orderIndex,
                isActive: true,
            },
        });
        createdCategories.push(category);
    }

    // Helper to find category by title
    const getCategoryId = (title: string) =>
        createdCategories.find((c) => c.title === title)?.id;

    // -------- QUICK SYMBOLS (Always First) --------

    await prisma.aACSymbol.createMany({
        data: [
            {
                title: 'Yes',
                ttsText: 'Yes',
                iconUrl: null,
                orderIndex: 1,
                isGlobalQuick: true,
            },
            {
                title: 'No',
                ttsText: 'No',
                iconUrl: null,
                orderIndex: 2,
                isGlobalQuick: true,
            },
        ],
    });

    // -------- CATEGORY SYMBOLS --------

    const symbolsData = [
        // Quick Chat
        {
            category: 'Quick Chat',
            words: ['Hello', 'Goodbye', 'Thank you', 'Please'],
        },

        // Time
        {
            category: 'Time',
            words: ['Yesterday', 'Today', 'Tomorrow', 'Morning', 'Night'],
        },

        // Food
        { category: 'Food', words: ['Vegetables', 'Fruits', 'Bread', 'Pie'] },

        // Drinks
        {
            category: 'Drinks',
            words: ['Water', 'Milk', 'Tea', 'Orange Juice', 'Milkshake'],
        },

        // Snacks
        {
            category: 'Snacks',
            words: ['Ice Cream', 'Chocolate', 'Biscuits', 'Nuts'],
        },

        // Activities
        {
            category: 'Activities',
            words: ['Play', 'Bath', 'Cook', 'Exercise', 'Celebrate'],
        },

        // Emotions
        {
            category: 'Emotions',
            words: ['Happy', 'Sad', 'Angry', 'Confused', 'Afraid', 'Excited'],
        },

        // Body
        {
            category: 'Body',
            words: [
                'Head',
                'Neck',
                'Shoulder',
                'Right Hand',
                'Left Hand',
                'Stomach',
            ],
        },

        // Animals
        { category: 'Animals', words: ['Cat', 'Dog', 'Rabbit', 'Horse'] },

        // Toys
        { category: 'Toys', words: ['Teddy Bear', 'Kite', 'Doll', 'Ball'] },

        // Actions
        {
            category: 'Actions',
            words: ['Jump', 'Sit', 'Stand', 'Crawl', 'Climb'],
        },

        // Questions
        {
            category: 'Questions',
            words: ['What', 'Why', 'How', 'When', 'Where', 'Which'],
        },

        // Numbers
        {
            category: 'Numbers',
            words: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        },
    ];

    for (const group of symbolsData) {
        const categoryId = getCategoryId(group.category);

        if (!categoryId) continue;

        let index = 1;

        for (const word of group.words) {
            await prisma.aACSymbol.create({
                data: {
                    title: word,
                    ttsText: word,
                    iconUrl: null,
                    orderIndex: index++,
                    categoryId: categoryId,
                    isGlobalQuick: false,
                    isActive: true,
                },
            });
        }
    }

    console.log('✅ AAC Seeding Complete');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
