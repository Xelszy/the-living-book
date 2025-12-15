
import React from 'react';
import { Story } from '../types';

interface LibraryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onBack: () => void;
}

export const Library: React.FC<LibraryProps> = ({ stories, onSelectStory, onBack }) => {
  return (
    <div className="w-full h-full bg-[#3b0764] flex flex-col relative overflow-hidden font-[Fredoka]">
      
       {/* Background */}
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6d28d9 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      <div className="p-6 flex items-center justify-between z-10">
        <button onClick={onBack} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl backdrop-blur-sm transition-colors">
            <span className="font-bold">⬅️ Back</span>
        </button>
        <h2 className="text-3xl font-black text-white drop-shadow-md">My Bookshelf</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 z-10">
        {stories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/50">
                <div className="text-8xl mb-4 grayscale opacity-50">🏰</div>
                <p className="text-2xl font-bold">Empty!</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stories.map(story => (
                    <button 
                        key={story.id} 
                        onClick={() => onSelectStory(story)}
                        className="group relative aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-2xl transition-transform hover:-translate-y-2 hover:rotate-1 border-4 border-white"
                    >
                        {story.pages[0]?.imageData ? (
                             <img src={story.pages[0].imageData} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">📖</div>
                        )}
                        
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-12">
                            <h3 className="text-white font-bold text-lg text-left leading-tight line-clamp-2">{story.title}</h3>
                            <div className="flex gap-2 mt-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded text-white ${story.language === 'id' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                    {story.language}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/30 text-white backdrop-blur-md">
                                    {story.subject}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
