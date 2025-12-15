
import React, { useState } from 'react';
import { MiniGame as MiniGameType } from '../types';

interface MiniGameProps {
  game: MiniGameType;
  onComplete: () => void;
}

export const MiniGame: React.FC<MiniGameProps> = ({ game, onComplete }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    
    // Simple sound effects
    if (index === game.correctAnswerIndex) {
      new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/rpg/coin.ogg').play();
    } else {
      new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/rpg/turn.ogg').play();
    }
  };

  const isCorrect = selected === game.correctAnswerIndex;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2a0a55] to-[#4c1d95] text-white animate-fade-in relative overflow-hidden">
      
      {/* Background Particles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-bounce">⭐</div>
        <div className="absolute bottom-20 right-20 text-8xl animate-pulse">❓</div>
        <div className="absolute top-1/2 left-1/4 text-4xl animate-spin-slow">➕</div>
      </div>

      <div className="max-w-3xl w-full z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-4 border-[#8b5cf6] shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#a78bfa] mb-2 uppercase tracking-widest">
              {game.type === 'math_challenge' ? 'Math Challenge!' : 'Quiz Time!'}
            </h2>
            <p className="text-3xl md:text-4xl font-bold leading-tight">
              {game.question}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {game.options.map((option, idx) => {
              let btnClass = "bg-white text-[#4c1d95] hover:bg-[#f3e8ff]";
              
              if (showResult) {
                if (idx === game.correctAnswerIndex) {
                  btnClass = "bg-green-500 text-white ring-4 ring-green-300";
                } else if (idx === selected) {
                  btnClass = "bg-red-500 text-white ring-4 ring-red-300";
                } else {
                  btnClass = "bg-gray-300 text-gray-500 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`p-6 rounded-2xl text-xl font-bold shadow-lg transform transition-all active:scale-95 ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="text-center animate-fade-in-up">
              <div className={`text-2xl font-black mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? "🎉 Amazing! That's correct!" : "😅 Oops! Nice try."}
              </div>
              <p className="text-lg text-gray-200 mb-6 bg-black/20 p-4 rounded-xl">
                💡 {game.explanation}
              </p>
              <button
                onClick={onComplete}
                className="bg-[#facc15] hover:bg-[#eab308] text-[#713f12] text-xl font-black px-10 py-4 rounded-full shadow-[0_6px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 transition-all"
              >
                Finish Adventure 🏆
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
