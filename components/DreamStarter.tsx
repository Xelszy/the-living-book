
import React, { useState } from 'react';
import { StoryParams, Language, Subject } from '../types';

interface DreamStarterProps {
  onCreate: (params: StoryParams) => void;
  onViewLibrary: () => void;
}

type Step = 'setup' | 'hero' | 'world' | 'prompt';

export const DreamStarter: React.FC<DreamStarterProps> = ({ onCreate, onViewLibrary }) => {
  const [step, setStep] = useState<Step>('setup');
  const [language, setLanguage] = useState<Language>('id');
  const [subject, setSubject] = useState<Subject>('story');
  
  const [character, setCharacter] = useState('');
  const [setting, setSetting] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  // --- Data ---
  const subjects = [
    { id: 'story', name: 'Story', nameId: 'Cerita', icon: '📖', color: 'bg-pink-500 border-pink-700' },
    { id: 'math', name: 'Math', nameId: 'Matematika', icon: '➗', color: 'bg-blue-500 border-blue-700' },
    { id: 'history', name: 'History', nameId: 'Sejarah', icon: '🏛️', color: 'bg-amber-500 border-amber-700' },
    { id: 'science', name: 'Science', nameId: 'Sains', icon: '🧪', color: 'bg-green-500 border-green-700' },
  ];

  const characters = [
    { name: 'Robot', icon: '🤖', bg: 'bg-slate-100' },
    { name: 'Dragon', icon: '🐲', bg: 'bg-green-100' },
    { name: 'Kitty', icon: '🐱', bg: 'bg-purple-100' },
    { name: 'Alien', icon: '👽', bg: 'bg-indigo-100' },
    { name: 'Hero', icon: '🦸', bg: 'bg-red-100' },
    { name: 'Dino', icon: '🦖', bg: 'bg-emerald-100' },
  ];

  const settings = [
    { name: 'Candy Land', icon: '🍭', bg: 'bg-pink-50' },
    { name: 'Space', icon: '🚀', bg: 'bg-slate-800 text-white' },
    { name: 'Jungle', icon: '🌴', bg: 'bg-green-50' },
    { name: 'Underwater', icon: '🐙', bg: 'bg-blue-50' },
    { name: 'Castle', icon: '🏰', bg: 'bg-gray-100' },
    { name: 'School', icon: '🏫', bg: 'bg-yellow-50' },
  ];

  // --- Handlers ---

  const handleCreate = () => {
    onCreate({ 
      character: character || 'Friend', 
      setting: setting || 'Fun Place', 
      theme: 'Adventure', 
      language, 
      subject: subject as Subject,
      customPrompt: customPrompt.length > 0 ? customPrompt : undefined
    });
  };

  // --- Renders ---

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#581c87] font-[Fredoka]">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#7c3aed] rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#c026d3] rounded-full blur-3xl opacity-40 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        
        {/* Top Bar */}
        <div className="p-4 flex justify-between items-center max-w-5xl mx-auto w-full">
          <div className="flex gap-3">
            <button 
              onClick={() => setLanguage('id')} 
              className={`px-5 py-2 rounded-2xl font-black border-b-4 transition-all ${language === 'id' ? 'bg-[#facc15] border-[#a16207] text-[#422006] translate-y-1 border-b-0' : 'bg-white border-gray-300 text-gray-400'}`}
            >
              🇮🇩 ID
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={`px-5 py-2 rounded-2xl font-black border-b-4 transition-all ${language === 'en' ? 'bg-[#facc15] border-[#a16207] text-[#422006] translate-y-1 border-b-0' : 'bg-white border-gray-300 text-gray-400'}`}
            >
              🇺🇸 EN
            </button>
          </div>
          <button 
            onClick={onViewLibrary}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-2xl font-bold border-2 border-white/30 flex items-center gap-2 backdrop-blur-sm"
          >
             🏰 Library
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          
          <div className="bg-white rounded-[3rem] p-6 md:p-10 w-full max-w-5xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] min-h-[500px] flex flex-col relative border-[10px] border-[#fde047]">
            
            {/* Mascot Helper */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full border-[8px] border-[#facc15] flex items-center justify-center shadow-lg z-20">
               <span className="text-7xl md:text-8xl animate-bounce-subtle">👾</span>
            </div>

            <div className="mt-12 flex-1 flex flex-col">
              
              {step === 'setup' && (
                <div className="animate-fade-in text-center flex-1 flex flex-col justify-center">
                  <div className="mb-4">
                    <p className="text-[#c026d3] font-bold text-sm md:text-base uppercase tracking-widest mb-1 opacity-70">
                      Development of AI-Based Learning Media
                    </p>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                       Utilization of LLM & Diffusion Models for Children
                    </p>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black text-[#581c87] mb-2 tracking-tight">
                    {language === 'id' ? 'Pilih Petualangan!' : 'Choose Adventure!'}
                  </h2>
                  <p className="text-gray-400 font-bold text-xl mb-10">What do you want to learn today?</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {subjects.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSubject(s.id as Subject); setStep('hero'); }}
                        className={`${s.color} text-white p-6 rounded-[2rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3 border-b-8 active:border-b-0 active:translate-y-2`}
                      >
                        <span className="text-5xl drop-shadow-md">{s.icon}</span>
                        <span className="font-black text-xl tracking-wide">
                          {language === 'id' ? s.nameId : s.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-10 pt-6 border-t-2 border-gray-100">
                    <button 
                      onClick={() => setStep('prompt')}
                      className="text-[#c026d3] font-bold text-xl hover:scale-105 transition-transform"
                    >
                      ✨ {language === 'id' ? 'Saya punya ide sendiri...' : 'I have my own idea...'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'hero' && (
                <div className="animate-fade-in text-center flex-1">
                   <h2 className="text-4xl font-black text-[#581c87] mb-8">
                    {language === 'id' ? 'Pilih Pahlawanmu!' : 'Pick Your Hero!'}
                  </h2>
                  <div className="grid grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                    {characters.map(c => (
                      <button
                         key={c.name}
                         onClick={() => { setCharacter(c.name); setStep('world'); }}
                         className={`${c.bg} aspect-square rounded-[2rem] border-b-8 border-gray-200/50 hover:border-[#c026d3] transition-all hover:scale-105 flex items-center justify-center active:border-b-0 active:translate-y-2`}
                      >
                        <div className="text-6xl md:text-7xl">{c.icon}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep('setup')} className="text-gray-400 font-bold text-lg hover:text-gray-600">⬅️ Back</button>
                </div>
              )}

              {step === 'world' && (
                <div className="animate-fade-in text-center flex-1">
                   <h2 className="text-4xl font-black text-[#581c87] mb-8">
                    {language === 'id' ? 'Kemana mereka pergi?' : 'Where do they go?'}
                  </h2>
                  <div className="grid grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                    {settings.map(s => (
                      <button
                         key={s.name}
                         onClick={() => { setSetting(s.name); handleCreate(); }}
                         className={`${s.bg} aspect-square rounded-[2rem] border-b-8 border-gray-200/50 hover:border-[#c026d3] transition-all hover:scale-105 flex flex-col items-center justify-center p-2 active:border-b-0 active:translate-y-2`}
                      >
                        <div className="text-5xl md:text-6xl mb-2">{s.icon}</div>
                        <div className="font-black text-sm md:text-base leading-tight">{s.name}</div>
                      </button>
                    ))}
                  </div>
                   <button onClick={() => setStep('hero')} className="text-gray-400 font-bold text-lg hover:text-gray-600">⬅️ Back</button>
                </div>
              )}

              {step === 'prompt' && (
                <div className="animate-fade-in text-center flex-1 flex flex-col">
                   <h2 className="text-4xl font-black text-[#581c87] mb-6">
                    {language === 'id' ? 'Cerita Spesial' : 'Custom Story'}
                  </h2>
                   <textarea
                    className="flex-1 bg-gray-50 border-4 border-gray-200 rounded-3xl p-6 text-2xl font-bold text-gray-700 focus:border-[#c026d3] outline-none resize-none mb-6 shadow-inner"
                    placeholder={language === 'id' ? "Misal: Dinosaurus makan pizza di bulan..." : "E.g., A dinosaur eating pizza on the moon..."}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                   />
                   <div className="flex gap-4 justify-center">
                     <button onClick={() => setStep('setup')} className="px-8 py-4 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 text-xl">Cancel</button>
                     <button 
                        onClick={handleCreate}
                        disabled={!customPrompt}
                        className="px-10 py-4 rounded-full font-black text-white bg-[#c026d3] hover:bg-[#a21caf] disabled:opacity-50 shadow-[0_6px_0_rgb(162,28,175)] active:shadow-none active:translate-y-2 text-xl transition-all"
                     >
                       Go! 🚀
                     </button>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
