'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SparklesProps {
    color?: string;
    count?: number;
    minSize?: number;
    maxSize?: number;
    overflow?: boolean;
}

interface Sparkle {
    id: string;
    style: {
        top: string;
        left: string;
        width: string;
        height: string;
        backgroundColor: string;
    };
}

export function Sparkles({
    color = '#FFD700',
    count = 5,
    minSize = 2,
    maxSize = 6,
    overflow = false
}: SparklesProps) {
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    useEffect(() => {
        // Generate static sparkles
        const newSparkles = Array.from({ length: count }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            style: {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * (maxSize - minSize) + minSize}px`,
                height: `${Math.random() * (maxSize - minSize) + minSize}px`,
                backgroundColor: color,
            },
        }));
        setSparkles(newSparkles);
    }, [count, color, minSize, maxSize]);

    return (
        <div className={`absolute inset-0 pointer-events-none ${overflow ? '' : 'overflow-hidden'}`}>
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    className="absolute rounded-full shadow-[0_0_5px_currentColor] mix-blend-screen"
                    style={sparkle.style}
                    animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 90, 180],
                    }}
                    transition={{
                        duration: 1.5 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
