'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/lib/stores/progressStore';
import { Eric } from '@/components/eric/Eric';
import { DiplomaPreview } from '@/components/diploma/DiplomaPreview';
import { Footer } from '@/components/Footer';
import { Sparkles } from '@/components/ui/Sparkles';

const TOTAL_LESSONS = 26;
const MAX_STARS = 78;

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function DiplomaPage() {
  const [name, setName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { completedLessons, lessonStars, totalStars } = useProgressStore();

  // Ensure client-side rendering for localStorage access
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate completion status
  const threeStarLessons = useMemo(() => {
    return Object.entries(lessonStars).filter(([, stars]) => stars >= 3).length;
  }, [lessonStars]);

  const canGetDiploma = totalStars >= MAX_STARS || threeStarLessons >= TOTAL_LESSONS;
  const completionPercentage = Math.round((threeStarLessons / TOTAL_LESSONS) * 100);

  const todayFormatted = formatDate(new Date());

  // Check if name is valid
  const hasValidName = name.trim().length > 0;

  // Generate and download PDF manually
  const handleDownload = useCallback(async () => {
    if (!hasValidName) {
      return;
    }
    setIsGenerating(true);
    try {
      // Dynamically import pdf and the document
      const { pdf } = await import('@react-pdf/renderer');
      const { DiplomaDocument } = await import('@/components/diploma/DiplomaDocument');
      const fileSaver = await import('file-saver');
      const saveAs = fileSaver.default || fileSaver.saveAs;

      const blob = await pdf(<DiplomaDocument name={name} date={todayFormatted} />).toBlob();
      const fileName = `lettoria-diploma-${name.trim().toLowerCase().replace(/\s+/g, '-')}.pdf`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er ging iets mis bij het maken van de PDF. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  }, [name, todayFormatted, hasValidName]);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <main className="min-h-screen bg-perkament flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-eric-green border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-perkament">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/kaart" className="text-eric-green hover:text-eric-green/80 transition-colors">
            &larr; Terug naar kaart
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {canGetDiploma ? (
          // DIPLOMA FORM - User has completed all lessons with 3 stars
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Celebration header */}
            <div className="text-center relative">
              <div className="absolute inset-0 pointer-events-none">
                <Sparkles color="#FFD700" count={12} overflow />
              </div>

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <Eric mood="celebrating" size="large" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-eric-green mt-6 mb-2"
              >
                Gefeliciteerd!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-6"
              >
                Je hebt alle 26 lessen met 3 sterren voltooid! Je bent nu een echte Typmeester!
              </motion.p>
            </div>

            {/* Name input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <label htmlFor="name" className="block text-lg font-bold text-gray-800 mb-2">
                Jouw naam op het diploma
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Vul je voornaam in om je persoonlijke diploma te maken.
              </p>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Voornaam"
                className="w-full text-2xl font-bold text-center py-4 px-6 border-2 border-gray-200 rounded-xl focus:border-eric-green focus:outline-none transition-colors"
                maxLength={30}
              />
            </motion.div>

            {/* Diploma preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Voorbeeld van je diploma</h2>
              <DiplomaPreview name={name} date={todayFormatted} />
            </motion.div>

            {/* Download button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <button
                onClick={handleDownload}
                disabled={isGenerating || !hasValidName}
                className="inline-block bg-eric-green hover:bg-eric-green/90 text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    PDF wordt gemaakt...
                  </span>
                ) : (
                  '📄 Download je diploma als PDF'
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                {hasValidName
                  ? 'Je diploma wordt direct gedownload. Bewaar het of print het uit!'
                  : 'Vul eerst je naam in om het diploma te downloaden.'}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // PROGRESS VIEW - User hasn't completed all lessons yet
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header with Eric */}
            <div className="text-center">
              <Eric
                mood="encouraging"
                message="Je kunt hier je diploma ophalen zodra je alle 26 lessen met 3 sterren hebt voltooid!"
              />
            </div>

            {/* Progress section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                Je voortgang naar het diploma
              </h1>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Lessen met 3 sterren</span>
                  <span className="font-bold">{threeStarLessons} van {TOTAL_LESSONS}</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-eric-green rounded-full"
                  />
                </div>
                <p className="text-right text-sm text-gray-500 mt-1">
                  {completionPercentage}% voltooid
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-perkament rounded-xl p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-eric-green">
                    {completedLessons.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Lessen voltooid</div>
                </div>
                <div className="bg-perkament rounded-xl p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-eric-gold">
                    {threeStarLessons}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Met 3 sterren</div>
                </div>
                <div className="bg-perkament rounded-xl p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-accent">
                    {totalStars}/{MAX_STARS}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Totaal sterren</div>
                </div>
              </div>

              {/* What's needed */}
              <div className="bg-eric-green/10 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-eric-green mb-2">Wat moet je nog doen?</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {threeStarLessons < TOTAL_LESSONS && (
                    <li>
                      • Voltooi nog {TOTAL_LESSONS - threeStarLessons} les(sen) met 3 sterren (95%+ nauwkeurigheid)
                    </li>
                  )}
                  {completedLessons.length < TOTAL_LESSONS && (
                    <li>
                      • Maak nog {TOTAL_LESSONS - completedLessons.length} nieuwe les(sen) af
                    </li>
                  )}
                </ul>
              </div>

              {/* CTA */}
              <Link
                href="/kaart"
                className="block w-full bg-eric-green hover:bg-eric-green/90 text-white font-bold py-4 rounded-xl text-center text-lg transition-all hover:scale-[1.02]"
              >
                Ga verder met oefenen
              </Link>
            </div>

            {/* Teaser */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Dit wordt jouw diploma!
              </h2>
              <div className="opacity-50">
                <DiplomaPreview name="???" date={todayFormatted} />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Voltooi alle lessen om je gepersonaliseerde diploma te krijgen!
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}
