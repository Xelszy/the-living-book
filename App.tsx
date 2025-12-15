
import React, { useState, useEffect } from 'react';
import { TabletWrapper } from './components/TabletWrapper';
import { DreamStarter } from './components/DreamStarter';
import { StoryReader } from './components/StoryReader';
import { Library } from './components/Library';
import { Story, AppView, StoryParams, GenerationStatus } from './types';
import { generateStoryContent, generatePageImage, generateSpeech } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [loadingMessage, setLoadingMessage] = useState('Starting magic...');

  useEffect(() => {
    const saved = localStorage.getItem('living_book_library_v2');
    if (saved) {
      try {
        setStories(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveLibrary = (newStories: Story[]) => {
    setStories(newStories);
    localStorage.setItem('living_book_library_v2', JSON.stringify(newStories));
  };

  const handleCreateStory = async (params: StoryParams) => {
    setStatus('writing');
    
    // Step 1: Planning & Writing
    setLoadingMessage(params.language === 'id' ? '🤖 Merencanakan petualangan...' : '🤖 Planning adventure...');
    
    const tempId = Date.now().toString();
    
    try {
      // Orchestrator Call
      const storyContent = await generateStoryContent(params);
      
      const newStory: Story = {
        id: tempId,
        createdAt: Date.now(),
        ...storyContent
      };

      setCurrentStory(newStory);
      setView(AppView.READING);
      
      // Step 2: Illustrating & Narrating
      setStatus('illustrating');
      const storyWithMedia = { ...newStory, pages: [...newStory.pages] };
      
      // Process pages sequentially
      for (let i = 0; i < storyWithMedia.pages.length; i++) {
        setLoadingMessage(params.language === 'id' ? `🎨 Menggambar halaman ${i+1}...` : `🎨 Painting page ${i+1}...`);
        
        // Parallel: Image + TTS
        const [imageUrl, audioData] = await Promise.all([
            generatePageImage(storyWithMedia.pages[i].imagePrompt),
            generateSpeech(storyWithMedia.pages[i].text, params.language)
        ]);
        
        storyWithMedia.pages[i] = {
            ...storyWithMedia.pages[i],
            imageData: imageUrl,
            audioData: audioData,
            isLoadingImage: false
        };

        // Update active story immediately so user sees progress
        setCurrentStory({ ...storyWithMedia });
        
        if (i === storyWithMedia.pages.length - 1) {
             setStatus('ready');
             saveLibrary([storyWithMedia, ...stories]);
        }
      }

    } catch (error) {
      console.error(error);
      setStatus('error');
      alert("Oops! The magic sprites got confused. Please try again.");
      setView(AppView.HOME);
    }
  };

  const renderContent = () => {
    // Custom Loading Screen
    if (status !== 'idle' && status !== 'ready' && view === AppView.READING && currentStory?.pages[0].isLoadingImage) {
         return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#581c87] text-white p-8 text-center font-[Fredoka]">
                <div className="relative mb-8">
                     <div className="w-40 h-40 rounded-full border-8 border-[#c026d3] animate-spin border-t-transparent shadow-[0_0_50px_#c026d3]"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-6xl animate-pulse">🚀</div>
                </div>
                <h2 className="text-4xl font-black animate-pulse mb-4 text-[#facc15] drop-shadow-md">{loadingMessage}</h2>
                <p className="text-white/60 text-xl font-bold">The AI Agents are working together...</p>
            </div>
         );
    }

    switch (view) {
      case AppView.HOME:
        return <DreamStarter onCreate={handleCreateStory} onViewLibrary={() => setView(AppView.LIBRARY)} />;
      case AppView.LIBRARY:
        return <Library stories={stories} onSelectStory={(s) => { setCurrentStory(s); setView(AppView.READING); }} onBack={() => setView(AppView.HOME)} />;
      case AppView.READING:
        return currentStory ? <StoryReader story={currentStory} onExit={() => { setView(AppView.HOME); setCurrentStory(null); }} /> : null;
      default:
        return null;
    }
  };

  return (
    <TabletWrapper>
      {renderContent()}
    </TabletWrapper>
  );
};

export default App;
