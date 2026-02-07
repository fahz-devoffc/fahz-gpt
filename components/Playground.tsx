
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const checkVeoAccess = async (): Promise<boolean> => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        return true; // Proceed anyway as per instructions (avoid race condition)
      }
    }
    return true;
  };

  const handleAction = async (type: 'chat' | 'image' | 'video') => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    if (type === 'video') {
      await checkVeoAccess();
    }

    const currentInput = input;
    const currentAttachments = [...pendingAttachments];
    
    const userMsg: ChatMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      attachments: currentAttachments
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingAttachments([]);
    setIsLoading(true);

    try {
      if (type === 'image') {
        const imageUrl = await geminiService.generateImage(currentInput);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `Tentu, saya telah membuatkan gambar berdasarkan prompt: "${currentInput}"`,
          generatedImage: imageUrl,
          timestamp: new Date()
        }]);
      } else if (type === 'video') {
        const videoUrl = await geminiService.generateVideo(currentInput);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `Berikut adalah video yang dihasilkan untuk: "${currentInput}"`,
          generatedVideo: videoUrl,
          timestamp: new Date()
        }]);
      } else {
        const response = await geminiService.generateResponse(currentInput, config, currentAttachments);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: response,
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `⚠️ Galat: ${error.message || 'Terjadi kesalahan tak terduga.'}\n\nPastikan API key Anda sudah diset dengan benar di environment variables dan memiliki kuota yang cukup.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full max-w-4xl mx-auto">
      {/* ChatGPT-style Sticky Header */}
      <div className="flex items-center justify-between p-3 sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold hover:bg-slate-800 transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            {config.model.includes('flash') ? 'Fahz Flash 3.0' : 'Fahz Pro 3.0'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fahz-Company</div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute top-14 left-4 z-40 w-72 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Pilih Otak AI</label>
              <div className="space-y-2">
                <button 
                  onClick={() => { setConfig({...config, model: 'gemini-3-flash-preview'}); setShowSettings(false); }}
                  className={`w-full px-4 py-3 rounded-xl text-left border transition-all ${config.model === 'gemini-3-flash-preview' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-xs">Fahz Flash</div>
                  <div className="text-[9px] opacity-60">Sangat cepat untuk tugas harian.</div>
                </button>
                <button 
                  onClick={() => { setConfig({...config, model: 'gemini-3-pro-preview'}); setShowSettings(false); }}
                  className={`w-full px-4 py-3 rounded-xl text-left border transition-all ${config.model === 'gemini-3-pro-preview' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-xs">Fahz Pro</div>
                  <div className="text-[9px] opacity-60">Analisis dalam dan coding expert.</div>
                </button>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Kreativitas</label>
                <span className="text-[10px] text-indigo-400 font-mono">{config.temperature}</span>
              </div>
              <input 
                type="range" min="0" max="1.5" step="0.1" 
                value={config.temperature}
                onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-8 scroll-smooth no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8 pb-20">
            <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-white/5 rotate-3 animate-pulse">
              <span className="text-4xl font-black text-slate-950">F</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white tracking-tight">Halo! Saya Fahz GPT.</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Asisten AI pribadi Anda yang ditenagai oleh Gemini. Saya bisa mengobrol, menganalisis gambar, hingga membuat video.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full px-4">
              {[
                { label: "Buat gambar kota masa depan", type: 'image' },
                { label: "Ide bisnis Fahz-Company", type: 'chat' },
                { label: "Review kode React saya", type: 'chat' },
                { label: "Video pendek aurora borealis", type: 'video' }
              ].map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setInput(s.label); handleAction(s.type as any); }}
                  className="group p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400 hover:bg-slate-800 hover:border-slate-700 transition-all text-left flex flex-col gap-1"
                >
                  <span className="text-slate-200 font-medium group-hover:text-white">{s.label}</span>
                  <span className="text-[9px] opacity-50 uppercase tracking-widest">{s.type} prompt</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-12">
            {messages.map((msg, i) => (
              <div key={i} className="flex gap-5 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold border transition-all ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 border-slate-700 text-slate-400' 
                    : 'bg-white border-white text-slate-950 shadow-xl shadow-white/10'
                }`}>
                  {msg.role === 'user' ? 'U' : 'F'}
                </div>
                <div className="flex-1 min-w-0 space-y-4 pt-1">
                  <div className={`text-[16px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'text-slate-200 font-medium' : 'text-slate-300'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className="relative w-40 h-40 rounded-2xl overflow-hidden border border-slate-800 shadow-lg group/img">
                          <img src={att.url} alt="Uploaded" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.generatedImage && (
                    <div className="mt-6">
                      <img src={msg.generatedImage} alt="Generated" className="rounded-2xl border border-slate-800 shadow-2xl max-w-full md:max-w-md" />
                      <div className="flex gap-3 mt-4">
                        <a href={msg.generatedImage} download="fahz-art.png" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all border border-slate-700">Unduh Gambar</a>
                      </div>
                    </div>
                  )}

                  {msg.generatedVideo && (
                    <div className="mt-6">
                      <video src={msg.generatedVideo} controls className="rounded-2xl border border-slate-800 shadow-2xl w-full aspect-video bg-black" />
                      <div className="flex gap-3 mt-4">
                        <a href={msg.generatedVideo} download="fahz-video.mp4" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg transition-all border border-slate-700">Unduh Video</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-5 animate-pulse">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-white text-slate-950 shadow-xl">F</div>
                <div className="flex items-center gap-1.5 pt-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} className="h-40" />
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
        <div className="max-w-3xl mx-auto pb-6">
          {/* Preview Attachments */}
          {pendingAttachments.length > 0 && (
            <div className="flex gap-3 p-3 mb-3 overflow-x-auto no-scrollbar bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md">
              {pendingAttachments.map((att, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-indigo-500/30 group">
                  <img src={att.url} alt="Pending" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative bg-slate-900 border border-slate-800 rounded-[1.75rem] shadow-2xl focus-within:border-slate-600 transition-all overflow-hidden group/input">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAction('chat');
                }
              }}
              placeholder="Tanya apa saja..."
              className="w-full bg-transparent text-white px-5 py-5 focus:outline-none resize-none max-h-40 min-h-[64px] placeholder-slate-600 text-[15px]"
            />
            
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  multiple 
                  className="hidden" 
                  accept="image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  title="Lampirkan Gambar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <div className="h-6 w-[1px] bg-slate-800 mx-1" />
                <button 
                  onClick={() => handleAction('image')}
                  className="px-3 py-1.5 text-[9px] font-black text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-lg transition-all uppercase tracking-wider"
                >
                  Buat Gambar
                </button>
                <button 
                  onClick={() => handleAction('video')}
                  className="px-3 py-1.5 text-[9px] font-black text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-all uppercase tracking-wider"
                >
                  Buat Video
                </button>
              </div>

              <button 
                onClick={() => handleAction('chat')}
                disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  (!input.trim() && pendingAttachments.length === 0) || isLoading 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-white text-slate-950 hover:bg-indigo-50 shadow-xl'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-4 font-bold uppercase tracking-[0.2em]">
            Powered by Gemini • Developed by Fahz-Company
          </p>
        </div>
      </div>
    </div>
  );
};

export default Playground;
