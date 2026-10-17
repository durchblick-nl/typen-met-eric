import { coursePageMetadata } from '@/lib/pageMetadata';

export const metadata = coursePageMetadata('/kaart', 'Wereldkaart');

export default function PageLayout({ children }: { children: React.ReactNode }) { return children; }
