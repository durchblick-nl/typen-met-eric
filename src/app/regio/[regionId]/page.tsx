import { coursePageMetadata } from '@/lib/pageMetadata';
import { REGIONS } from '@/lib/data/regions';
import { RegioClient } from './RegioClient';

export function generateStaticParams() {
  return REGIONS.map((region) => ({
    regionId: region.id,
  }));
}

interface RegioPageProps {
  params: Promise<{ regionId: string }>;
}

export default async function RegioPage({ params }: RegioPageProps) {
  const { regionId } = await params;
  return <RegioClient regionId={regionId} />;
}

export async function generateMetadata({params}: {params:Promise<{regionId:string}>}) {
 const {regionId}=await params;
 const item=REGIONS.find(r=>r.id===regionId);
 return coursePageMetadata(`/regio/${regionId}`, item?.name || 'Lettoria');
}
