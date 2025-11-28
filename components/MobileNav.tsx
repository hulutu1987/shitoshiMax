

import React from 'react';
import { useApp } from '../context/AppContext';
import { ChatBubbleOvalLeftIcon, ShareWallIcon, TrendingUpIcon, UserIcon, UsersIcon } from './Icons';

const MobileNav = () => {
  const { currentView, navigateTo } = useApp();
  
  const navItemClass = (viewName: string) => 
    `flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
      currentView === viewName 
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-6 py-2 flex justify-between items-center z-40 safe-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <button 
        onClick={() => navigateTo('chats')}
        className={navItemClass('chats')}
        aria-label="Chats"
      >
        <ChatBubbleOvalLeftIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={() => navigateTo('contacts')}
        className={navItemClass('contacts')}
        aria-label="Contacts"
      >
        <UsersIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={() => navigateTo('moments')}
        className={navItemClass('moments')}
        aria-label="Moments"
      >
        <ShareWallIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={() => navigateTo('trending')}
        className={navItemClass('trending')}
        aria-label="Trending"
      >
        <TrendingUpIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={() => navigateTo('settings')}
        className={navItemClass('settings')}
        aria-label="Profile"
      >
        <UserIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MobileNav;