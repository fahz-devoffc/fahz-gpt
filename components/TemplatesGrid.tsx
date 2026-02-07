
import React from 'react';
import { AI_TEMPLATES } from '../constants';

interface TemplatesGridProps {
  onApply: (instruction: string) => void;
}

const TemplatesGrid: React.FC<TemplatesGridProps> = ({ onApply }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold mb-4">Pick a Starting Template</h2>
        <p className="text-slate-400">
          Not sure where to start? Choose a pre-configured AI personality and see how we've 
          written the system instructions for each one.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {AI_TEMPLATES.map((template) => (
          <div 
            key={template.id}
            className="group relative p-8 bg-slate-900 border border-slate-800 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <div className="relative">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{template.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{template.name}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">{template.description}</p>
              
              <div className="p-4 bg-slate-950 rounded-xl mb-6 border border-slate-800 group-hover:border-slate-700 transition-colors">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Instruction Snippet</p>
                <p className="text-xs text-indigo-300/80 italic line-clamp-2">"{template.systemInstruction}"</p>
              </div>

              <button 
                onClick={() => onApply(template.systemInstruction)}
                className="w-full py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesGrid;
