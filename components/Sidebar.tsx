
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onNewChat }) => {
  const navItems = [
    { id: AppTab.PLAYGROUND, label: 'Fahz GPT Chat', icon: '💬' },
    { id: AppTab.TEMPLATES, label: 'Mode AI', icon: '🧩' },
    { id: AppTab.LEARN, label: 'Tentang Kami', icon: '✨' },
    { id: AppTab.CODE, label: 'Deploy & Source', icon: '⚙️' },
  ];

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-3 z-10 transition-all">
      <div className="mb-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all group border border-slate-700/50 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">F</div>
            <span>New Chat</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-4 mb-3">Menu Utama</div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 pt-4 border-t border-slate-800/50">
        <div className="px-4">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Fahz-Company</p>
          <p className="text-[9px] text-slate-500">Premium AI Deployment Solution</p>
        </div>
        
        <button 
          onClick={() => setActiveTab(AppTab.CODE)}
          className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span>Cloud Status: Ready</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
