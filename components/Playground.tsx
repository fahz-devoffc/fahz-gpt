
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

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAction = async (type: 'chat' | 'image' | 'video') => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

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
          content: `Berikut adalah gambar yang saya buat untuk prompt: "${currentInput}"`,
          generatedImage: imageUrl,
          timestamp: new Date()
        }]);
      } else if (type === 'video') {
        const videoUrl = await geminiService.generateVideo(currentInput);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: `Berikut adalah video yang saya buat untuk prompt: "${currentInput}"`,
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
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Error: Gagal memproses permintaan. Pastikan API key Anda valid dan mendukung model ini.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] w-full max-w-4xl mx-auto">
      {/* Header / Model Selector */}
      <div className="flex items-center justify-between p-4 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-medium hover:bg-slate-800"
          >
            {config.model === 'gemini-3-flash-preview' ? '⚡ Fahz-Flash' : '🧠 Fahz-Pro'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 left-4 z-30 w-72 p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Model Engine</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => setConfig({...config, model: 'gemini-3-flash-preview'})}
                  className={`px-3 py-2 text-xs rounded-lg text-left transition-all ${config.model === 'gemini-3-flash-preview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="font-bold">Gemini 3 Flash</div>
                  <div className="text-[10px] opacity-70">Respons super cepat & efisien</div>
                </button>
                <button 
                  onClick={() => setConfig({...config, model: 'gemini-3-pro-preview'})}
                  className={`px-3 py-2 text-xs rounded-lg text-left transition-all ${config.model === 'gemini-3-pro-preview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <div className="font-bold">Gemini 3 Pro</div>
                  <div className="text-[10px] opacity-70">Penalaran kompleks & akurat</div>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Creativity (Temp)</label>
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

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-10 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-white/5">
              <span className="text-3xl font-black text-slate-950">F</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Apa yang bisa saya kerjakan untuk Anda?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {[
                { label: "Buatkan gambar kucing astronot", action: () => { setInput("Buatkan gambar kucing astronot di bulan"); handleAction('image'); } },
                { label: "Analisis kode Python saya", action: () => setInput("Bisakah kamu mereview kode Python saya untuk mencari bug?") },
                { label: "Ide nama startup teknologi", action: () => setInput("Berikan 5 ide nama startup unik untuk perusahaan AI") },
                { label: "Generate video nebula", action: () => { setInput("Buat video pendek tentang nebula warna-warni"); handleAction('video'); } }
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={suggestion.action}
                  className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm text-slate-300 hover:bg-slate-800 hover:border-slate-700 transition-all text-left"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex gap-5 max-w-3xl mx-auto w-full group">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                  msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-white text-slate-950 shadow-lg shadow-white/5'
                }`}>
                  {msg.role === 'user' ? 'ME' : 'F'}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="font-bold text-sm text-slate-200">
                    {msg.role === 'user' ? 'Anda' : 'Fahz GPT'}
                  </div>
                  <div className="text-[16px] leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map((att, idx) => (
                        <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-800">
                          <img src={att.url} alt="User upload" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.generatedImage && (
                    <div className="mt-4 max-w-md">
                      <img src={msg.generatedImage} alt="Generated" className="rounded-2xl border border-slate-800 shadow-2xl" />
                      <a href={msg.generatedImage} download="fahz-gen.png" className="inline-block mt-3 text-xs text-indigo-400 hover:underline">Unduh Gambar</a>
                    </div>
                  )}

                  {msg.generatedVideo && (
                    <div className="mt-4 max-w-xl">
                      <video src={msg.generatedVideo} controls className="rounded-2xl border border-slate-800 shadow-2xl w-full" />
                      <a href={msg.generatedVideo} download="fahz-video.mp4" className="inline-block mt-3 text-xs text-indigo-400 hover:underline">Unduh Video</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-5 max-w-3xl mx-auto w-full">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-white text-slate-950">F</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-40" />
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="max-w-3xl mx-auto">
          {pendingAttachments.length > 0 && (
            <div className="flex gap-2 p-2 mb-2 overflow-x-auto no-scrollbar">
              {pendingAttachments.map((att, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-indigo-500/50">
                  <img src={att.url} alt="Pending" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeAttachment(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl focus-within:border-slate-600 transition-colors overflow-hidden">
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
              placeholder="Apa saja bisa Anda tanyakan..."
              className="w-full bg-transparent text-white px-5 py-4 pt-5 focus:outline-none resize-none max-h-40 min-h-[60px] placeholder-slate-600 scrollbar-hide"
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
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                  title="Upload Foto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleAction('image')}
                  className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-lg hover:border-indigo-500/30 transition-all uppercase"
                  title="Generate Gambar"
                >
                  Gen Image
                </button>
                <button 
                  onClick={() => handleAction('video')}
                  className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-amber-400 border border-slate-800 rounded-lg hover:border-amber-500/30 transition-all uppercase"
                  title="Generate Video"
                >
                  Gen Video
                </button>
              </div>

              <button 
                onClick={() => handleAction('chat')}
                disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  (!input.trim() && pendingAttachments.length === 0) || isLoading 
                    ? 'bg-slate-800 text-slate-600' 
                    : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg shadow-white/5'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-4 font-medium tracking-tight">
            Fahz GPT ditenagai oleh Gemini. Periksa informasi penting sebelum digunakan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Playground;
