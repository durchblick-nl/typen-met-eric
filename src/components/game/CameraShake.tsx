'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CameraShakeProps {
  children: ReactNode;
  shakeIntensity: number; // 0 = no shake, 8 = bomb shake
  zoomPulse: boolean;
  isFeverMode: boolean;
  continuousShake: boolean; // high combo continuous shake
  lane: number;
  speedMultiplier: number;
  playerState: 'running' | 'jumping' | 'dashing' | 'hit' | 'sprinting';
}

export function CameraShake({
  children,
  shakeIntensity,
  zoomPulse,
  isFeverMode,
  continuousShake,
  lane,
  speedMultiplier,
  playerState,
}: CameraShakeProps) {
  // Determine scale for zoom pulse
  const baseScale = zoomPulse ? 1.02 : 1;

  // Fever mode narrows perspective for speed feel
  const perspectiveScale = isFeverMode ? 0.98 : 1;
  const laneBank = lane === 0 ? -1.3 : lane === 2 ? 1.3 : 0;
  const speedDrift = speedMultiplier > 1.2 ? -3 : speedMultiplier < 0.9 ? 2 : 0;
  const hitBlur = playerState === 'hit' ? 0.7 : 0;

  return (
    <motion.div
      className="absolute inset-0"
      animate={
        shakeIntensity > 0
          ? {
              x: [0, -shakeIntensity, shakeIntensity, -shakeIntensity * 0.6, shakeIntensity * 0.6, 0],
              y: [speedDrift, shakeIntensity * 0.5, -shakeIntensity * 0.5, shakeIntensity * 0.3, -shakeIntensity * 0.3, speedDrift],
              scale: baseScale * perspectiveScale,
              rotateZ: laneBank,
              filter: `blur(${hitBlur}px)`,
            }
          : continuousShake
            ? {
                x: [0, -1.5, 1.5, -1, 1, 0],
                y: [speedDrift, 0.8 + speedDrift, -0.8 + speedDrift, 1 + speedDrift, -1 + speedDrift, speedDrift],
                scale: baseScale * perspectiveScale,
                rotateZ: laneBank,
                filter: `blur(${hitBlur}px)`,
              }
            : {
                x: 0,
                y: speedDrift,
                scale: baseScale * perspectiveScale,
                rotateZ: laneBank,
                filter: `blur(${hitBlur}px)`,
              }
      }
      transition={
        shakeIntensity > 0
          ? { duration: 0.3, ease: 'easeOut' }
          : continuousShake
            ? { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3, type: 'spring', stiffness: 200 }
      }
    >
      {children}
    </motion.div>
  );
}
