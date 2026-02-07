
import React, { useState } from 'react';
import { AppTab, ChatMessage, AIConfig } from './types';
import { INITIAL_SYSTEM_INSTRUCTION } from './constants';
import Sidebar from './components/Sidebar';
import LearnSection from './components/LearnSection';
import Playground from './components/Playground';
import TemplatesGrid from './components/TemplatesGrid';
import CodeViewer from './components/CodeViewer';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PLAYGROUND);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [config, setConfig] = useState<AIConfig>({
    systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
    temperature: 0.7,
    model: 'gemini-3-flash-preview',
  });

  const handleNewChat = () => {
    setMessages([]);
    setActiveTab(AppTab.PLAYGROUND);
  };

  const handleApplyTemplate = (instruction: string) => {
    setConfig(prev => ({ ...prev, systemInstruction: instruction }));
    setMessages([{
      role: 'ai',
      content: `Saya telah beralih ke mode baru berdasarkan pilihan Anda! Bagaimana saya bisa membantu Anda dalam mode ini?`,
      timestamp: new Date()
    }]);
    setActiveTab(AppTab.PLAYGROUND);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-indigo-500/30">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onNewChat={handleNewChat} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 flex flex-col items-center">
        <div className={`w-full h-full ${activeTab === AppTab.PLAYGROUND ? '' : 'max-w-6xl px-6 py-8'}`}>
          {activeTab === AppTab.LEARN && <LearnSection />}
          
          {activeTab === AppTab.PLAYGROUND && (
            <Playground 
              messages={messages} 
              setMessages={setMessages} 
              config={config}
              setConfig={setConfig}
            />
          )}

          {activeTab === AppTab.TEMPLATES && (
            <TemplatesGrid onApply={handleApplyTemplate} />
          )}

          {activeTab === AppTab.CODE && (
            <CodeViewer config={config} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
