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
