import { coursePageMetadata } from '@/lib/pageMetadata';
import { t } from '@/lib/i18n';
import { Metadata } from 'next';

export const metadata: Metadata = {
  ...coursePageMetadata('/diploma','Diploma'),
  title: t("Diploma"),
  description:
    t("Download je persoonlijke Lettoria diploma nadat je alle 26 lessen met 3 sterren hebt voltooid. Bewijs dat je een echte Typmeester bent!"),
};

export default function DiplomaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
