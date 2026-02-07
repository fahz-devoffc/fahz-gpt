
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIConfig, Attachment } from '../types';
import { geminiService } from '../services/geminiService';

interface PlaygroundProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  config: AIConfig;
  setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
}

const Playground: React.FC<PlaygroundProps> = ({ messages, setMessages, config, setConfig }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const attachment: Attachment = {
          mimeType: file.type,
          data: base64,
          url: URL.createObjectURL(file)
        };
        setPendingAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async (type: 'chat' | 'image' | 'video') => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    const currentInput = input;
    const currentAttachments = [...pendingAttachments];
    
    setMessages(prev => [...prev, { role: 'user', content: currentInput, timestamp: new Date(), attachments: currentAttachments }]);
    setInput('');
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      if (type === 'image') {
        const imageUrl = await geminiService.generateImage(currentInput);
        setMessages(prev => [...prev, { role: 'ai', content: `Gambar untuk: "${currentInput}"`, generatedImage: imageUrl, timestamp: new Date() }]);
      } else if (type === 'video') {
        const videoUrl = await geminiService.generateVideo(currentInput);
        setMessages(prev => [...prev, { role: 'ai', content: `Video untuk: "${currentInput}"`, generatedVideo: videoUrl, timestamp: new Date() }]);
      } else {
        const response = await geminiService.generateResponse(currentInput, config, currentAttachments);
        setMessages(prev => [...prev, { role: 'ai', content: response, timestamp: new Date() }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `❌ Gagal: ${error.message}\n\nTips: Jika Anda menggunakan akun gratis, pastikan model yang dipilih adalah "Fahz Lite" di menu pengaturan atas.`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between p-3 sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold hover:bg-slate-800 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {config.model === 'gemini-flash-lite-latest' ? 'Fahz Lite (Gratis)' : config.model.includes('pro') ? 'Fahz Pro' : 'Fahz Flash'}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>

      {showSettings && (
        <div className="absolute top-14 left-4 z-40 w-72 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Pilih Model AI</label>
          <div className="space-y-2">
            {[
              { id: 'gemini-flash-lite-latest', name: 'Fahz Lite', desc: 'Sangat stabil untuk akun gratis.' },
              { id: 'gemini-3-flash-preview', name: 'Fahz Flash', desc: 'Lebih pintar, butuh akses preview.' },
              { id: 'gemini-3-pro-preview', name: 'Fahz Pro', desc: 'Expert, butuh billing aktif.' }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => { setConfig({...config, model: m.id}); setShowSettings(false); }}
                className={`w-full px-4 py-3 rounded-xl text-left border transition-all ${config.model === m.id ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
              >
                <div className="font-bold text-xs">{m.name}</div>
                <div className="text-[9px] opacity-60">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-8 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl"><span className="text-4xl font-black text-slate-950">F</span></div>
            <h2 className="text-3xl font-bold text-white">Selamat Datang!</h2>
            <p className="text-slate-400 text-sm max-w-md">Pastikan API Key sudah diset di Vercel. Saya menggunakan model Lite agar lebih stabil.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.map((msg, i) => (
              <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'user' ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-950'}`}>
                  {msg.role === 'user' ? 'ME' : 'F'}
                </div>
                <div className="flex-1 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pt-1">
                  {msg.content}
                  {msg.generatedImage && <img src={msg.generatedImage} className="mt-4 rounded-xl border border-slate-800 max-w-sm" />}
                  {msg.generatedVideo && <video src={msg.generatedVideo} controls className="mt-4 rounded-xl border border-slate-800 w-full" />}
                </div>
              </div>
            ))}
          </div>
        )}
        {isLoading && <div className="max-w-3xl mx-auto w-full pl-12"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" /></div>}
        <div ref={messagesEndRef} className="h-32" />
      </div>

      <div className="p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl flex flex-col p-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAction('chat'))}
              placeholder="Tanya apa saja..."
              className="w-full bg-transparent text-white p-3 focus:outline-none resize-none text-sm"
            />
            <div className="flex justify-between items-center px-2 py-1">
              <div className="flex gap-2">
                <button onClick={() => handleAction('image')} className="text-[9px] font-bold text-slate-500 hover:text-indigo-400 uppercase">Image</button>
                <button onClick={() => handleAction('video')} className="text-[9px] font-bold text-slate-500 hover:text-amber-400 uppercase">Video</button>
              </div>
              <button onClick={() => handleAction('chat')} className="bg-white text-slate-950 p-2 rounded-lg hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
