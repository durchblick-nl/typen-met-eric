'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crystal } from './Crystal';
import { Eric } from '@/components/eric/Eric';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import { Sparkles } from '@/components/ui/Sparkles';

interface CrystalData {
  id: string;
  letter: string;
  x: number;
  duration: number;
  colorIndex: number;
}

interface CrystalGameProps {
  availableLetters: string[];
  onComplete: () => void;
  targetCount?: number;
}

export function CrystalGame({
  availableLetters,
  onComplete,
  targetCount = 30
}: CrystalGameProps) {
  const [crystals, setCrystals] = useState<CrystalData[]>([]);
  const [collected, setCollected] = useState(0);
  const [ericMood, setEricMood] = useState<'happy' | 'encouraging' | 'celebrating'>('happy');
  const [ericMessage, setEricMessage] = useState('Vang de kristallen!');
  const [isComplete, setIsComplete] = useState(false);
  const crystalIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate difficulty based on progress
  const getMaxCrystals = useCallback(() => {
    if (collected >= 20) return 3;
    if (collected >= 10) return 2;
    return 1;
  }, [collected]);

  const getSpawnInterval = useCallback(() => {
    if (collected >= 20) return 1500;
    if (collected >= 10) return 2000;
    return 2500;
  }, [collected]);

  const getFallDuration = useCallback(() => {
    if (collected >= 20) return 4;
    if (collected >= 10) return 5;
    return 6;
  }, [collected]);

  // Spawn a new crystal
  const spawnCrystal = useCallback(() => {
    if (isComplete) return;

    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    const x = 10 + Math.random() * 80; // 10-90% to avoid edges
    const id = `crystal-${crystalIdRef.current++}`;
    const colorIndex = Math.floor(Math.random() * 7);
    const duration = getFallDuration();

    const newCrystal: CrystalData = { id, letter, x, duration, colorIndex };

    setCrystals(prev => {
      if (prev.length >= getMaxCrystals()) return prev;
      return [...prev, newCrystal];
    });
  }, [availableLetters, isComplete, getMaxCrystals, getFallDuration]);

  // Handle crystal collection
  const handleCollect = useCallback((id: string) => {
    setCrystals(prev => prev.filter(c => c.id !== id));
    setCollected(prev => {
      const newCount = prev + 1;

      // Update Eric's mood and message
      if (newCount >= targetCount) {
        setIsComplete(true);
        setEricMood('celebrating');
        setEricMessage('Geweldig! Alle kristallen!');
        setTimeout(onComplete, 2000);
      } else if (newCount % 10 === 0) {
        setEricMood('celebrating');
        setEricMessage(`Fantastisch! Al ${newCount} kristallen!`);
        setTimeout(() => setEricMood('encouraging'), 1500);
      } else if (newCount % 5 === 0) {
        setEricMood('encouraging');
        setEricMessage('Goed bezig!');
      } else {
        // Quick encouraging messages
        const messages = ['Mooi!', 'Ja!', 'Super!', 'Top!', 'Yes!'];
        setEricMessage(messages[Math.floor(Math.random() * messages.length)]);
      }

      return newCount;
    });
  }, [targetCount, onComplete]);

  // Handle missed crystal
  const handleMiss = useCallback((id: string) => {
    setCrystals(prev => prev.filter(c => c.id !== id));
  }, []);

  // Keyboard handler - find and collect matching crystal
  const handleKeyPress = useCallback((key: string) => {
    if (isComplete) return;

    const lowerKey = key.toLowerCase();
    setCrystals(prev => {
      // Find the first crystal with matching letter (lowest on screen = oldest)
      const matchingCrystal = prev.find(c => c.letter.toLowerCase() === lowerKey);
      if (matchingCrystal) {
        // Trigger collection
        setTimeout(() => handleCollect(matchingCrystal.id), 0);
      }
      return prev;
    });
  }, [isComplete, handleCollect]);

  useKeyboard({
    onKeyPress: handleKeyPress,
    enabled: !isComplete,
    allowedKeys: availableLetters.map(l => l.toLowerCase())
  });

  // Spawn crystals periodically
  useEffect(() => {
    if (isComplete) {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
      return;
    }

    // Initial spawn
    spawnCrystal();

    spawnIntervalRef.current = setInterval(() => {
      spawnCrystal();
    }, getSpawnInterval());

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [spawnCrystal, getSpawnInterval, isComplete]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950">
      {/* Starry background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Game stats */}
      <div className="absolute top-4 right-4 z-20">
        <motion.div
          className="bg-white/90 backdrop-blur rounded-xl px-6 py-3 shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              <span className="text-purple-600 font-bold">{collected}</span>
              <span className="text-gray-400">/{targetCount}</span>
            </div>
            <div className="text-2xl">
              {collected >= targetCount ? (
                <Sparkles color="#FFD700" count={5} />
              ) : null}
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">Kristallen</div>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-4 left-4 right-32 z-20">
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${(collected / targetCount) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Crystals */}
      <AnimatePresence>
        {crystals.map(crystal => (
          <Crystal
            key={crystal.id}
            {...crystal}
            onCollect={handleCollect}
            onMiss={handleMiss}
          />
        ))}
      </AnimatePresence>

      {/* Eric */}
      <motion.div
        className="absolute bottom-4 left-4 z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Eric
          mood={ericMood}
          message={ericMessage}
          size="medium"
        />
      </motion.div>

      {/* Completion overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <div className="text-6xl mb-4">
                <Sparkles color="#FFD700" count={12} />
              </div>
              <h2 className="text-3xl font-bold text-purple-600 mb-2">
                Geweldig!
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Je hebt alle {targetCount} kristallen verzameld!
              </p>
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-4xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
