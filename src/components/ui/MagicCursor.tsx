'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    rotation: number;
}

export function MagicCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [particles, setParticles] = useState<Particle[]>([]);
    const lastParticleTime = useRef(0);

    // Colors for the fairy dust
    const colors = ['#FFD700', '#2D7D46', '#A8D5A2', '#FF6B35', '#FFFFFF'];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            // Add trail particles
            const now = Date.now();
            if (now - lastParticleTime.current > 20) { // Limit particle creation rate
                const id = now;
                const newParticle: Particle = {
                    id,
                    x: e.clientX,
                    y: e.clientY,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                };

                setParticles((prev) => [...prev.slice(-20), newParticle]); // Keep max 20 trail particles
                lastParticleTime.current = now;

                // Cleanup after animation duration
                setTimeout(() => {
                    setParticles((prev) => prev.filter((p) => p.id !== id));
                }, 1000);
            }
        };

        const handleClick = (e: MouseEvent) => {
            // Burst effect
            const burstCount = 12;
            const newParticles: Particle[] = [];
            const now = Date.now();

            for (let i = 0; i < burstCount; i++) {
                const id = now + i;
                const angle = (i / burstCount) * 2 * Math.PI;
                const radius = Math.random() * 30; // initial spread

                newParticles.push({
                    id,
                    x: e.clientX + Math.cos(angle) * radius,
                    y: e.clientY + Math.sin(angle) * radius,
                    size: Math.random() * 10 + 6,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 360,
                });

                // Cleanup
                setTimeout(() => {
                    setParticles((prev) => prev.filter((p) => p.id !== id));
                }, 1000);
            }

            setParticles((prev) => [...prev, ...newParticles]);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{
                            opacity: 1,
                            scale: 0.5,
                            x: particle.x - particle.size / 2,
                            y: particle.y - particle.size / 2,
                            rotate: particle.rotation
                        }}
                        animate={{
                            opacity: 0,
                            scale: 0,
                            y: particle.y + 50, // Fall down slightly
                            x: particle.x + (Math.random() - 0.5) * 50 // Drift
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            position: 'absolute',
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            borderRadius: '50%',
                            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                            filter: 'blur(1px)',
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Custom Cursor Dot */}
            <motion.div
                className="fixed w-4 h-4 rounded-full bg-eric-gold/80 mix-blend-screen shadow-[0_0_10px_#FFD700]"
                animate={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            />
        </div>
    );
}
