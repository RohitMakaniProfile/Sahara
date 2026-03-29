export type Video = {
    id: number;
    title: string;
    url: string;
    category: string;
    audience: 'parent' | 'child';
    tags: string[];
};

const videos: Video[] = [
    // ── Parent Guidance ──────────────────────────────────────────
    {
        id: 1,
        title: 'What is Autism?',
        url: 'https://youtu.be/P5M-VPjRCgE?si=CjKsKay_1ZQSSAj2',
        category: 'Introduction',
        audience: 'parent',
        tags: ['autism', 'introduction', 'basics'],
    },
    {
        id: 2,
        title: 'Autism Signs',
        url: 'https://youtu.be/20VohL99fT8?si=vIN9cr65E6rSZbPo',
        category: 'Introduction',
        audience: 'parent',
        tags: ['autism', 'signs', 'symptoms'],
    },
    {
        id: 3,
        title: 'Autism and Fine Motor Skills',
        url: 'https://youtu.be/huAnXQ2rWq8?si=rFhAMVR94GoLRikK',
        category: 'Motor Skills',
        audience: 'parent',
        tags: ['fine-motor', 'skills', 'development'],
    },
    {
        id: 4,
        title: 'Autism and Gross Motor Skills',
        url: 'https://youtu.be/-twXLk_z-kk?si=p28-aZ4CODvh7UTk',
        category: 'Motor Skills',
        audience: 'parent',
        tags: ['gross-motor', 'skills', 'movement'],
    },
    {
        id: 5,
        title: 'Autism and Communication Skills',
        url: 'https://youtu.be/NzKj17r3Yw0?si=QAem0LkFVz6z4rL7',
        category: 'Communication',
        audience: 'parent',
        tags: ['communication', 'speech', 'language'],
    },
    {
        id: 6,
        title: 'Autism and Social Skills',
        url: 'https://youtu.be/1n3Vm-jUzrU?si=T65fJnmxhic5GnpU',
        category: 'Social Skills',
        audience: 'parent',
        tags: ['social', 'interaction', 'peers'],
    },
    {
        id: 7,
        title: 'Autism and Cognitive Skills',
        url: 'https://youtu.be/p78v0wdol4U?si=vIxg4pBPWuPm_ZKT',
        category: 'Cognitive',
        audience: 'parent',
        tags: ['cognitive', 'thinking', 'learning'],
    },
    {
        id: 8,
        title: 'Autism and Sensory Processing',
        url: 'https://youtu.be/HJ6XzbrCsHM?si=FTQp1IAoNy0ijhAC',
        category: 'Sensory Processing',
        audience: 'parent',
        tags: ['sensory', 'processing', 'stimulation'],
    },

    // ── Children Videos — ABC / Learning ─────────────────────────
    {
        id: 9,
        title: 'ABC Song for Kids',
        url: 'https://youtu.be/QvmZwQIsj3k?si=a4sFxHRtiSQOrHu5',
        category: 'Learning',
        audience: 'child',
        tags: ['abc', 'alphabet', 'learning', 'song'],
    },
    {
        id: 10,
        title: 'ABC and Nursery Rhymes',
        url: 'https://youtu.be/_UR-l3QI2nE?si=3h1BQbXRW-mSb9KV',
        category: 'Learning',
        audience: 'child',
        tags: ['abc', 'nursery', 'rhymes', 'kids'],
    },
    {
        id: 11,
        title: 'Fun Learning for Kids',
        url: 'https://youtu.be/d2mlWUzA0B4?si=U6ZbBdvyrCRlXk7I',
        category: 'Learning',
        audience: 'child',
        tags: ['learning', 'fun', 'kids', 'educational'],
    },
    {
        id: 12,
        title: 'Kids Learning Songs',
        url: 'https://youtu.be/wc3A5nlIjYM?si=tRt16MFBBMMej2HO',
        category: 'Learning',
        audience: 'child',
        tags: ['songs', 'learning', 'kids'],
    },

    // ── Children Videos — Animal Dance ───────────────────────────
    {
        id: 13,
        title: 'Animal Dance for Kids',
        url: 'https://youtu.be/-1-s8GBpFeQ?si=EtgBizr9nE1lIAQF',
        category: 'Animal Dance',
        audience: 'child',
        tags: ['dance', 'animals', 'movement', 'fun'],
    },
    {
        id: 14,
        title: 'Animal Movement Dance',
        url: 'https://youtu.be/3gt_G1BjTD4?si=3CcS7nWRu1rE0x8L',
        category: 'Animal Dance',
        audience: 'child',
        tags: ['dance', 'animals', 'exercise', 'kids'],
    },

    // ── Children Videos — Stretching & Exercise ──────────────────
    {
        id: 15,
        title: 'Stretching Exercises for Kids',
        url: 'https://youtu.be/v6rD5JUnwX8?si=Tl1CNjD2Q6pHBZ29',
        category: 'Stretching & Exercise',
        audience: 'child',
        tags: ['stretching', 'exercise', 'movement', 'kids'],
    },
    {
        id: 16,
        title: 'Kids Exercise Routine',
        url: 'https://youtu.be/BIJ9uWc5Nu0?si=PYJ6h5WTN4gHDZmU',
        category: 'Stretching & Exercise',
        audience: 'child',
        tags: ['exercise', 'routine', 'movement', 'fitness'],
    },

    // ── Children Videos — Calming Sensory ────────────────────────
    {
        id: 17,
        title: 'Calming Sensory Video',
        url: 'https://youtu.be/8jmK6C3Q6ys?si=AzcKE4iy9Y7qwmqX',
        category: 'Calming Sensory',
        audience: 'child',
        tags: ['calming', 'sensory', 'relaxation', 'soothing'],
    },

    // ── Children Videos — Occupational Therapy ───────────────────
    {
        id: 18,
        title: 'Occupational Therapy for Kids',
        url: 'https://youtu.be/JqRKXWLaJLU?si=AFhPZ4SYhqByuwEY',
        category: 'Occupational Therapy',
        audience: 'child',
        tags: ['occupational-therapy', 'ot', 'therapy', 'skills'],
    },

    // ── Children Videos — Breathing Exercise ─────────────────────
    {
        id: 19,
        title: 'Breathing Exercises for Kids',
        url: 'https://youtu.be/PHQ7YZYRAms?si=Dq22noeNn6Dk8YfJ',
        category: 'Breathing Exercise',
        audience: 'child',
        tags: ['breathing', 'calm', 'exercise', 'relaxation'],
    },
    {
        id: 20,
        title: 'Deep Breathing for Children',
        url: 'https://youtu.be/O1hKRtDclXI?si=upJ7Oj3XAQtBqzXN',
        category: 'Breathing Exercise',
        audience: 'child',
        tags: ['breathing', 'deep-breath', 'calm', 'kids'],
    },

    // ── Children Videos — Social Skills ──────────────────────────
    {
        id: 21,
        title: 'Social Skills for Kids',
        url: 'https://youtu.be/SaAxYkhyLKs?si=lbu99kRtrYRKltnO',
        category: 'Social Skills',
        audience: 'child',
        tags: ['social-skills', 'friends', 'interaction', 'kids'],
    },

    // ── Children Videos — Oral Motor Skills ──────────────────────
    {
        id: 22,
        title: 'Oral Motor Skills for Kids',
        url: 'https://youtu.be/JYn5dGsMRL8?si=N-2co-fc68EWrNEz',
        category: 'Oral Motor Skills',
        audience: 'child',
        tags: ['oral-motor', 'speech', 'mouth', 'therapy'],
    },
];

export default videos;
