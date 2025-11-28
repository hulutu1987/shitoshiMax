

import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatBubbleOvalLeftIcon, AppLogoIcon, TrendingUpIcon, SettingsIcon, PlusIcon, UsersIcon, MapPinIcon, ShareWallIcon } from './Icons';

const Sidebar = () => {
  const { currentUser, currentView, navigateTo } = useApp();
  const { t } = useLanguage();

  return (
    <div className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 dark:border-white/10 bg-[#f5f5f5] dark:bg-black py-6 px-4 space-y-8 transition-colors">
      {/* Logo */}
      <div className="flex items-center space-x-3 px-2 cursor-pointer" onClick={() => navigateTo('chats')}>
        <div className="w-10 h-10 shadow-md rounded-lg overflow-hidden">
            <AppLogoIcon className="w-full h-full" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">阿猫阿狗</h1>
      </div>

      {/* User Profile Snippet */}
      <div className="flex items-center space-x-3 px-2 mb-2">
          <img src={currentUser.avatar} alt="User" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{currentUser.name}</p>
            <div className="flex items-center space-x-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.points} pts</p>
            </div>
            {currentUser.location && (
                <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <MapPinIcon className="w-3 h-3" />
                    <span>{currentUser.location}</span>
                </div>
            )}
          </div>
      </div>

      {/* Compose Button - Desktop Sidebar */}
      <button 
        onClick={() => navigateTo('compose')}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors shadow-sm flex items-center justify-center space-x-2"
      >
        <PlusIcon className="w-5 h-5" />
        <span>{t('nav.compose')}</span>
      </button>

      {/* Navigation */}
      <nav className="space-y-1">
        <button 
            onClick={() => navigateTo('chats')} 
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium transition-colors ${currentView === 'chats' ? 'bg-slate-200 dark:bg-[#1c1c1e] text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span>{t('nav.home')}</span>
        </button>

        <button 
            onClick={() => navigateTo('contacts')} 
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium transition-colors ${currentView === 'contacts' ? 'bg-slate-200 dark:bg-[#1c1c1e] text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
        >
          <UsersIcon className="w-5 h-5" />
          <span>{t('nav.contacts')}</span>
        </button>

        <button 
            onClick={() => navigateTo('moments')} 
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium transition-colors ${currentView === 'moments' ? 'bg-slate-200 dark:bg-[#1c1c1e] text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
        >
          <ShareWallIcon className="w-5 h-5" />
          <span>{t('nav.feed')}</span>
        </button>
        
        <button 
            onClick={() => navigateTo('trending')} 
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium transition-colors ${currentView === 'trending' ? 'bg-slate-200 dark:bg-[#1c1c1e] text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
        >
          <TrendingUpIcon className="w-5 h-5" />
          <span>{t('nav.trending')}</span>
        </button>

        <button 
            onClick={() => navigateTo('settings')} 
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md font-medium transition-colors ${currentView === 'settings' ? 'bg-slate-200 dark:bg-[#1c1c1e] text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span>{t('nav.settings')}</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;