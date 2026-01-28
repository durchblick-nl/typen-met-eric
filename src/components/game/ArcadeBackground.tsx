'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ArcadeBackgroundProps {
  isFeverMode?: boolean;
  intensity?: number; // 0-1, affects parallax speed and effects
}

export function ArcadeBackground({
  isFeverMode = false,
  intensity = 0
}: ArcadeBackgroundProps) {
  const [offset, setOffset] = useState(0);

  // Continuous slow animation for parallax
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // Base speed + intensity boost
      const speed = 0.01 + (intensity * 0.02);
      setOffset((prev) => (prev + delta * speed) % 1000);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [intensity]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer 1: Far background (slowest) */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: isFeverMode ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: isFeverMode ? Infinity : 0,
          repeatType: 'reverse',
        }}
      >
        <Image
          src={isFeverMode ? '/images/game/cave-bg-fever.png' : '/images/game/cave-bg-layer-1-far.png'}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Layer 2: Mid stalactites (medium speed) */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: `translateX(${-offset * 0.05}px)`,
        }}
      >
        <div className="absolute inset-0 flex">
          <Image
            src="/images/game/cave-bg-layer-2-mid.png"
            alt=""
            width={1920}
            height={600}
            className="object-cover h-auto w-auto min-w-full"
          />
          <Image
            src="/images/game/cave-bg-layer-2-mid.png"
            alt=""
            width={1920}
            height={600}
            className="object-cover h-auto w-auto min-w-full"
          />
        </div>
      </motion.div>

      {/* Layer 3: Front rocks (fastest, frames the game area) */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          transform: `translateX(${-offset * 0.1}px)`,
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 flex">
          <Image
            src="/images/game/cave-bg-layer-3-front.png"
            alt=""
            width={1920}
            height={400}
            className="object-cover h-auto w-auto min-w-full"
          />
          <Image
            src="/images/game/cave-bg-layer-3-front.png"
            alt=""
            width={1920}
            height={400}
            className="object-cover h-auto w-auto min-w-full"
          />
        </div>
      </motion.div>

      {/* Fever mode overlay effects */}
      {isFeverMode && (
        <>
          {/* Pulsing vignette */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(147, 51, 234, 0.3) 100%)',
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          />

          {/* Light rays */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(236, 72, 153, 0.1) 10deg, transparent 20deg, rgba(236, 72, 153, 0.1) 30deg, transparent 40deg)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-pink-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </>
      )}

      {/* Ambient floating crystals (always visible, more during fever) */}
      {[...Array(isFeverMode ? 15 : 8)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            background: i % 2 === 0 ? '#67e8f9' : '#c084fc',
            boxShadow: `0 0 ${4 + intensity * 4}px currentColor`,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
