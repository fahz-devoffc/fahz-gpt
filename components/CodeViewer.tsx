
import React, { useState } from 'react';
import { AIConfig } from '../types';

interface CodeViewerProps {
  config: AIConfig;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `import { GoogleGenAI } from "@google/genai";

/**
 * Fahz GPT Implementation
 * Created by Fahz-Company
 * Powered by Google Gemini
 */

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function fahzChat(message: string) {
  const response = await ai.models.generateContent({
    model: "${config.model}",
    contents: message,
    config: {
      systemInstruction: "${config.systemInstruction.replace(/"/g, '\\"')}",
      temperature: ${config.temperature},
      topP: 0.95,
      topK: 64,
    }
  });

  return response.text;
}

// Start your own AI now!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Kode Sumber Fahz GPT</h2>
          <p className="text-slate-400">
            Gunakan kode ini untuk membangun aplikasi Fahz GPT Anda sendiri.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCopy}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${
              copied ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {copied ? '✅ Copied' : '📋 Copy Code'}
          </button>
          <a 
            href="https://vercel.com/import/git"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            🚀 Deploy to Vercel
          </a>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 code-font text-sm overflow-x-auto shadow-2xl">
          <div className="flex gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <span className="ml-4 text-xs text-indigo-400/50 uppercase tracking-widest font-sans font-bold">fahz-gpt-core.ts</span>
          </div>
          <pre className="text-slate-300 leading-relaxed">
            {codeSnippet.split('\n').map((line, i) => (
              <div key={i} className="flex group/line">
                <span className="w-10 text-slate-700 shrink-0 select-none text-right pr-4">{i + 1}</span>
                <span className={`${
                  line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') ? 'text-slate-500 italic' :
                  line.includes('const') || line.includes('function') || line.includes('async') || line.includes('import') ? 'text-indigo-400' :
                  line.includes('"') || line.includes("'") ? 'text-emerald-400' :
                  'text-slate-300'
                }`}>
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <h4 className="text-indigo-400 font-bold mb-2">1. Pasang SDK</h4>
          <p className="text-sm text-indigo-200/60 leading-relaxed mb-4">
            Jalankan perintah ini di terminal proyek Anda untuk menginstal Gemini SDK.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg text-xs code-font text-indigo-300 border border-slate-800">
            npm install @google/genai
          </div>
        </div>
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <h4 className="text-amber-400 font-bold mb-2">2. Environment Variables</h4>
          <p className="text-sm text-amber-200/60 leading-relaxed mb-4">
            Di Vercel, pastikan Anda menambahkan key berikut di pengaturan proyek:
          </p>
          <div className="bg-slate-950 p-3 rounded-lg text-xs code-font text-amber-300/80 border border-slate-800">
            API_KEY=AIzaSyDa...VBB3fKLs
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;

