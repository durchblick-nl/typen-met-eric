'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface ArcadeBackgroundProps {
  isFeverMode?: boolean;
  intensity?: number; // 0-1, affects parallax speed and effects
}

export function ArcadeBackground({
  isFeverMode = false,
  intensity = 0
}: ArcadeBackgroundProps) {
  // Calculate animation duration based on intensity (faster = shorter duration)
  const layer2Duration = Math.max(30, 60 - intensity * 30); // 60s normal, 30s at max intensity
  const layer3Duration = Math.max(20, 40 - intensity * 20); // 40s normal, 20s at max intensity

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* CSS Keyframes for infinite scroll */}
      <style jsx>{`
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-layer-2 {
          animation: scrollLeft ${layer2Duration}s linear infinite;
        }
        .scroll-layer-3 {
          animation: scrollLeft ${layer3Duration}s linear infinite;
        }
        .fever-pulse {
          animation: feverPulse 0.5s ease-in-out infinite alternate;
        }
        @keyframes feverPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.03); }
        }
      `}</style>

      {/* Layer 1: Far background (static or pulsing in fever) */}
      <div className={`absolute inset-0 ${isFeverMode ? 'fever-pulse' : ''}`}>
        <Image
          src={isFeverMode ? '/images/game/cave-bg-fever.png' : '/images/game/cave-bg-layer-1-far.png'}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Layer 2: Mid stalactites (slow scroll) */}
      <div className="absolute top-0 left-0 h-52 overflow-hidden w-full">
        <div className="scroll-layer-2 flex items-start" style={{ width: '200%' }}>
          <div className="w-1/2 flex-shrink-0 h-52">
            <Image
              src="/images/game/cave-bg-layer-2-mid.png"
              alt=""
              width={1920}
              height={600}
              className="w-full h-52 object-cover object-top"
            />
          </div>
          <div className="w-1/2 flex-shrink-0 h-52">
            <Image
              src="/images/game/cave-bg-layer-2-mid.png"
              alt=""
              width={1920}
              height={600}
              className="w-full h-52 object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Layer 3: Bottom rocks (faster scroll) - cropped to 200px */}
      <div className="absolute bottom-0 left-0 h-24 overflow-hidden w-full pointer-events-none z-10">
        <div className="scroll-layer-3 flex" style={{ width: '200%' }}>
          <div className="w-1/2 flex-shrink-0 h-24">
            <Image
              src="/images/game/cave-bg-layer-3-front.png"
              alt=""
              width={1920}
              height={200}
              className="w-full h-24 object-cover object-top"
            />
          </div>
          <div className="w-1/2 flex-shrink-0 h-24">
            <Image
              src="/images/game/cave-bg-layer-3-front.png"
              alt=""
              width={1920}
              height={200}
              className="w-full h-24 object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Fever mode overlay effects */}
      {isFeverMode && (
        <>
          {/* Pulsing vignette */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'radial-gradient(circle at center, transparent 30%, rgba(147, 51, 234, 0.4) 100%)',
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
            }}
          />

          {/* Rotating light rays */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(236, 72, 153, 0.15) 10deg, transparent 20deg, rgba(236, 72, 153, 0.15) 30deg, transparent 40deg, rgba(168, 85, 247, 0.15) 50deg, transparent 60deg)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Floating fever particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`fever-particle-${i}`}
              className="absolute rounded-full pointer-events-none z-20"
              style={{
                left: `${Math.random() * 100}%`,
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 8,
                background: i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#a855f7' : '#fbbf24',
                filter: 'blur(1px)',
              }}
              animate={{
                y: ['110vh', '-10vh'],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
            />
          ))}
        </>
      )}

      {/* Ambient floating crystals (always visible) */}
      {[...Array(isFeverMode ? 20 : 12)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${5 + Math.random() * 90}%`,
            width: 3 + Math.random() * 5,
            height: 3 + Math.random() * 5,
            background: i % 2 === 0 ? '#67e8f9' : '#c084fc',
            boxShadow: `0 0 ${8 + intensity * 10}px currentColor`,
          }}
          animate={{
            y: ['100vh', '-5vh'],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
      />
    </div>
  );
}
