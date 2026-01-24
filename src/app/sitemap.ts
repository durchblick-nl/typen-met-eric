import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// All 7 regions in Lettoria
const regions = ['grot', 'dorp', 'velden', 'woud', 'toppen', 'zee', 'kasteel'];

// All 26 lessons (0-25)
const lessons = Array.from({ length: 26 }, (_, i) => i);

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://lettoria.nl';
    const lastModified = new Date();

    // Main pages
    const mainPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/kaart`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/over`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/oefenen`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/diploma`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Region pages
    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
        url: `${baseUrl}/regio/${region}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Lesson pages
    const lessonPages: MetadataRoute.Sitemap = lessons.map((lesson) => ({
        url: `${baseUrl}/les/${lesson}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...mainPages, ...regionPages, ...lessonPages];
}
