
import React from 'react';

const LearnSection: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="max-w-3xl">
        <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
          Official Release v1.0
        </div>
        <h2 className="text-5xl font-extrabold mb-6 tracking-tight">Selamat Datang di <span className="text-indigo-500">Fahz GPT</span>.</h2>
        <p className="text-xl text-slate-400 leading-relaxed">
          Ini adalah AI pribadi Anda, ditenagai oleh model tercanggih dari Google (Gemini) 
          dan dirancang oleh <strong>Fahz-Company</strong> untuk memberikan pengalaman 
          cerdas yang bisa Anda sesuaikan sendiri.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-indigo-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 text-2xl font-bold shadow-inner">1</div>
          <h3 className="text-lg font-bold mb-3">Identitas Fahz</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Anda dapat mengubah cara Fahz GPT berbicara melalui <strong>System Instructions</strong> di Playground.
          </p>
        </div>
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-emerald-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 text-2xl font-bold shadow-inner">2</div>
          <h3 className="text-lg font-bold mb-3">Mesin Gemini</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Didukung penuh oleh API Gemini 3 Flash yang memberikan respons kilat namun sangat cerdas.
          </p>
        </div>
        <div className="p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 text-2xl font-bold shadow-inner">3</div>
          <h3 className="text-lg font-bold mb-3">Siap Deploy</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Siap untuk dibawa ke Vercel agar Fahz GPT bisa diakses oleh siapa saja di internet.
          </p>
        </div>
      </div>

      <section className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h3 className="text-3xl font-bold mb-4">Coba Sekarang</h3>
          <p className="text-indigo-200/70 mb-8 leading-relaxed text-lg">
            Masuk ke menu Playground untuk mulai mengobrol dengan Fahz GPT atau gunakan 
            template yang sudah disediakan Fahz-Company.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30">Mulai Chat</button>
            <button className="px-8 py-3 border border-indigo-500/30 text-indigo-300 rounded-xl font-bold hover:bg-indigo-500/10 transition-all">Pelajari API</button>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-800 code-font text-sm shadow-2xl">
          <div className="flex gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
          </div>
          <pre className="text-indigo-400/90">
            <code>{`// Inisialisasi Fahz GPT
const fahzAI = new GoogleGenAI({ 
  apiKey: process.env.API_KEY 
});

const response = await fahzAI.generate({
  model: "gemini-3-flash-preview",
  system: "You are Fahz GPT..."
});`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
};

export default LearnSection;
