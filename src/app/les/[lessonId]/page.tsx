import { coursePageMetadata } from '@/lib/pageMetadata';
import { REGIONS } from '@/lib/data/regions';
import { LessonClient } from './LessonClient';

export function generateStaticParams() {
  const lessonIds: { lessonId: string }[] = [];
  REGIONS.forEach((region) => {
    region.lessons.forEach((lesson) => {
      lessonIds.push({ lessonId: lesson.id.toString() });
    });
  });
  return lessonIds;
}

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  return <LessonClient lessonId={parseInt(lessonId, 10)} />;
}

export async function generateMetadata({params}: {params:Promise<{lessonId:string}>}) {
 const {lessonId}=await params;
 const item=REGIONS.flatMap(r=>r.lessons).find(l=>l.id===Number(lessonId));
 return coursePageMetadata(`/les/${lessonId}`, item?.title || 'Lettoria');
}
