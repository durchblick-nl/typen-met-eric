import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diploma | Lettoria',
  description:
    'Download je persoonlijke Lettoria diploma nadat je alle 26 lessen met 3 sterren hebt voltooid. Bewijs dat je een echte Typmeester bent!',
};

export default function DiplomaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
