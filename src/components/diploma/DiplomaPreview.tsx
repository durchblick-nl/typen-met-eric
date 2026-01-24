'use client';

import Image from 'next/image';

interface DiplomaPreviewProps {
  name: string;
  date: string;
}

export function DiplomaPreview({ name, date }: DiplomaPreviewProps) {
  const displayName = name.trim() || 'Jouw naam hier';

  return (
    <div className="w-full aspect-[1.414/1] bg-perkament rounded-lg shadow-lg overflow-hidden relative">
      {/* Outer border */}
      <div className="absolute inset-4 border-4 border-eric-green rounded-lg" />
      {/* Inner gold border */}
      <div className="absolute inset-6 border-2 border-eric-gold rounded" />

      {/* Content */}
      <div className="absolute inset-8 flex flex-col items-center justify-center text-center">
        {/* Stars */}
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-eric-gold text-lg md:text-2xl">★</span>
          ))}
        </div>

        {/* Eric */}
        <div className="relative w-12 h-12 md:w-20 md:h-20 mb-2">
          <Image
            src="/images/eric/eric-celebrating.png"
            alt="Eric"
            fill
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-4xl font-bold text-eric-green tracking-widest mb-1">
          DIPLOMA
        </h2>
        <p className="text-[10px] md:text-xs text-gray-500 mb-3">
          Lettoria Typmeester
        </p>

        {/* Name */}
        <div className="border-b-2 border-eric-green px-4 md:px-8 py-1 mb-2">
          <p className={`text-lg md:text-2xl font-bold ${name.trim() ? 'text-gray-800' : 'text-gray-400'}`}>
            {displayName}
          </p>
        </div>

        {/* Achievement */}
        <p className="text-[9px] md:text-xs text-gray-600 mb-2 leading-relaxed max-w-[80%]">
          heeft alle 26 lessen van Lettoria succesvol voltooid
          <br />
          en is nu een officiële Typmeester!
        </p>

        {/* Stats */}
        <div className="flex gap-4 md:gap-8 mb-2">
          <div className="text-center">
            <div className="text-base md:text-xl font-bold text-eric-green">26</div>
            <div className="text-[8px] md:text-[10px] text-gray-500">Lessen</div>
          </div>
          <div className="text-center">
            <div className="text-base md:text-xl font-bold text-eric-green">78</div>
            <div className="text-[8px] md:text-[10px] text-gray-500">Sterren</div>
          </div>
          <div className="text-center">
            <div className="text-base md:text-xl font-bold text-eric-green">7</div>
            <div className="text-[8px] md:text-[10px] text-gray-500">Regio&apos;s</div>
          </div>
        </div>

        {/* Region icons */}
        <div className="flex gap-1 md:gap-2 mb-1">
          <span className="text-sm md:text-lg">🐉</span>
          <span className="text-sm md:text-lg">🏠</span>
          <span className="text-sm md:text-lg">🌾</span>
          <span className="text-sm md:text-lg">🌲</span>
          <span className="text-sm md:text-lg">⛰️</span>
          <span className="text-sm md:text-lg">🌊</span>
          <span className="text-sm md:text-lg">🏰</span>
        </div>

        {/* Website */}
        <p className="text-[8px] md:text-[10px] text-eric-green mb-2">www.lettoria.nl</p>

        {/* Footer */}
        <div className="w-full flex items-end justify-between px-2 md:px-4 mt-auto">
          {/* Date */}
          <div className="text-left">
            <p className="text-[7px] md:text-[9px] text-gray-400">Uitgereikt op</p>
            <p className="text-[8px] md:text-[10px] text-gray-600">{date}</p>
          </div>

          {/* Eric signature */}
          <div className="text-center">
            <div className="relative w-8 h-8 md:w-12 md:h-12 mx-auto mb-0.5">
              <Image
                src="/images/eric/eric-happy.png"
                alt="Eric"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-[8px] md:text-[10px] font-bold text-eric-green">Eric de Draak</p>
            <p className="text-[6px] md:text-[8px] text-gray-400">Beschermer van Lettoria</p>
          </div>

          {/* Seal */}
          <div className="relative w-12 h-12 md:w-20 md:h-20 mb-1">
            <Image
              src="/images/diploma/lettoria_seal.png"
              alt="Lettoria Siegel"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
