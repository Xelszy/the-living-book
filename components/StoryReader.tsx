
import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../types';
import { MiniGame } from './MiniGame';
import { playAudioData } from '../services/audioUtils';

interface StoryReaderProps {
  story: Story;
  onExit: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({ story, onExit }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for audio management
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const totalPages = story.pages.length;
  const isGamePage = pageIndex === totalPages;
  const currentPage = !isGamePage ? story.pages[pageIndex] : null;

  useEffect(() => {
    // Init Audio Context on mount
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      stopAudio();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    // Stop any previous audio immediately when page changes
    stopAudio();

    // Auto-play new page audio after a short delay for smooth transition
    if (currentPage?.audioData && audioContextRef.current) {
      const timer = setTimeout(() => {
        if (currentPage.audioData) playAudio(currentPage.audioData);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pageIndex, currentPage]);

  const stopAudio = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
        currentSourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async (data: ArrayBuffer) => {
    if (!audioContextRef.current) return;
    
    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    // Stop currently playing audio before starting new one
    stopAudio();
    
    setIsPlaying(true);
    const source = await playAudioData(data, audioContextRef.current);
    
    if (source) {
      currentSourceRef.current = source;
      source.onended = () => {
        setIsPlaying(false);
        currentSourceRef.current = null;
      };
    } else {
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    stopAudio();
    if (pageIndex < totalPages) setPageIndex(p => p + 1);
  };

  const handlePrev = () => {
    stopAudio();
    if (pageIndex > 0) setPageIndex(p => p - 1);
  };

  // --- Render ---

  if (isGamePage) {
    return <MiniGame game={story.game} onComplete={onExit} />;
  }

  if (!currentPage) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#8fb3ff] font-[Fredoka] p-4 md:p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-300 to-blue-500 -z-10"></div>

      {/* Top Bar: Progress & Exit */}
      <div className="flex items-center justify-between mb-4 z-20 max-w-6xl mx-auto w-full">
        <button 
          onClick={onExit} 
          className="bg-white text-red-500 px-4 py-2 rounded-2xl border-b-4 border-gray-200 hover:border-b-0 hover:translate-y-1 transition-all font-bold shadow-lg"
        >
           ⬅️ Library
        </button>

        {/* Custom Progress Bar */}
        <div className="flex-1 mx-6 h-6 bg-black/20 rounded-full p-1 relative max-w-md">
            <div 
              className="h-full bg-[#fbbf24] rounded-full transition-all duration-500 relative"
              style={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }}
            >
               <div className="absolute -right-2 -top-1 w-6 h-6 bg-white rounded-full text-xs flex items-center justify-center shadow-sm">⭐</div>
            </div>
        </div>

        <div className="bg-white/20 text-white px-4 py-2 rounded-2xl font-bold backdrop-blur-sm">
           Pg {pageIndex + 1} of {totalPages}
        </div>
      </div>

      {/* THE BOOK CONTAINER */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex relative perspective-1000 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[30px] overflow-hidden bg-[#fdf6e3]">
        
        {/* Book Spine (Decorative) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 z-10 hidden md:block -translate-x-1/2 shadow-inner opacity-50"></div>

        {/* Left Page (Image) */}
        <div className="w-full md:w-1/2 h-full bg-white relative p-4 md:p-6 flex flex-col items-center justify-center border-r border-gray-200">
           
           {/* Image Frame */}
           <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-inner border-8 border-white ring-1 ring-gray-200 transform rotate-1">
             {currentPage.isLoadingImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f0f9ff] text-blue-400">
                  <div className="text-6xl animate-bounce mb-2">🎨</div>
                  <span className="font-bold text-xl animate-pulse">Painting magic...</span>
                </div>
             ) : (
               <img 
                 src={currentPage.imageData} 
                 className="w-full h-full object-cover animate-fade-in" 
                 alt="Story illustration"
               />
             )}
           </div>

           {/* Audio Control (Mobile) */}
           <div className="md:hidden absolute bottom-6 right-6 z-20">
              <button 
                onClick={() => currentPage.audioData && playAudio(currentPage.audioData)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${isPlaying ? 'bg-red-400 text-white animate-pulse' : 'bg-[#facc15] text-black'}`}
              >
                 {isPlaying ? <span className="text-3xl">⏹</span> : <span className="text-3xl">🔊</span>}
              </button>
           </div>
        </div>

        {/* Right Page (Text) */}
        <div className="hidden md:flex w-1/2 h-full bg-[#fffbf0] p-8 lg:p-12 flex-col items-center justify-center relative">
          
          {/* Page Texture */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply pointer-events-none"></div>

          <div className="relative z-10 w-full">
            <p className="text-3xl lg:text-4xl text-[#4a4a4a] leading-[1.6] font-bold text-center font-['Nunito'] drop-shadow-sm animate-fade-in">
              {currentPage.text}
            </p>

            {/* Audio Button Desktop */}
            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => currentPage.audioData && playAudio(currentPage.audioData)}
                disabled={!currentPage.audioData}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg
                  ${isPlaying 
                    ? 'bg-red-100 text-red-500 ring-4 ring-red-200' 
                    : 'bg-[#ffedd5] text-[#9a3412] ring-4 ring-[#ffcba4] hover:bg-[#fed7aa]'
                  }
                `}
              >
                {isPlaying ? (
                  <><span>⏹</span> Stop Voice</>
                ) : (
                  <><span>🗣️</span> Read to Me</>
                )}
              </button>
            </div>
          </div>

          {/* Page Number Corner */}
          <div className="absolute bottom-6 right-8 text-gray-300 font-bold text-2xl font-[Fredoka]">
            {pageIndex + 1}
          </div>
        </div>

        {/* Mobile Text Overlay (Only shows if screen is small) */}
        <div className="md:hidden absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md rounded-t-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300">
           <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
           <p className="text-xl text-gray-800 font-bold leading-relaxed text-center font-['Nunito']">
             {currentPage.text}
           </p>
        </div>

      </div>

      {/* Giant Navigation Buttons */}
      <div className="flex justify-between w-full max-w-6xl mx-auto mt-4 px-4 z-30">
        <button 
           onClick={handlePrev} 
           disabled={pageIndex === 0}
           className="bg-white text-[#581c87] px-6 py-3 md:px-8 md:py-4 rounded-full shadow-xl disabled:opacity-0 hover:scale-110 transition-all font-black text-lg md:text-xl border-b-8 border-gray-200 active:border-b-0 active:translate-y-2 flex items-center gap-2"
        >
          ⬅️ Prev
        </button>
        
        <button 
           onClick={handleNext} 
           className="bg-[#facc15] text-[#713f12] px-8 py-3 md:px-10 md:py-4 rounded-full shadow-xl hover:scale-110 transition-all font-black text-xl md:text-2xl border-b-8 border-[#ca8a04] active:border-b-0 active:translate-y-2 flex items-center gap-2 animate-bounce-subtle"
        >
          Next ➡️
        </button>
      </div>

    </div>
  );
};
