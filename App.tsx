

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ComposeView from './components/Composer';
import PostCard from './components/PostCard';
import SettingsView from './components/SettingsView';
import TrendingView from './components/TrendingView';
import ContactsView from './components/ContactsView';
import ChatView from './components/ChatView';
import ConversationListView from './components/ConversationListView';
import LoginView from './components/LoginView';
import BrowserModal from './components/BrowserModal';
import ForwardModal from './components/ForwardModal';
import { PlusIcon, ShieldAlertIcon, SparklesIcon, FireIcon, CameraIcon } from './components/Icons';

const NotificationToast = () => {
  const { notifications } = useApp();
  
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[60] space-y-2 flex flex-col items-end pointer-events-none w-full max-w-sm px-4 md:px-0">
      {notifications.map(n => (
        <div 
          key={n.id}
          className={`w-full md:w-auto px-4 py-3 rounded-lg shadow-xl border text-sm font-medium animate-slide-in backdrop-blur-md pointer-events-auto flex items-center shadow-black/5
            ${n.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-700 dark:bg-emerald-900/80 dark:border-emerald-800 dark:text-emerald-100' : 
              n.type === 'error' ? 'bg-red-50/90 border-red-100 text-red-700 dark:bg-red-900/80 dark:border-red-800 dark:text-red-100' : 
              'bg-white/90 border-slate-200 text-slate-700 dark:bg-[#1c1c1e]/90 dark:border-slate-700 dark:text-slate-200'}`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};

const EulaModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('eula_accepted');
        if (!hasAccepted) {
            setIsOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('eula_accepted', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                        <ShieldAlertIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Welcome to 阿猫阿狗</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please review and accept our Community Guidelines & Legal Disclaimer.</p>
                </div>
                
                <div className="bg-slate-50 dark:bg-black p-4 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-3 mb-6 border border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
                    <div>
                        <p className="font-bold mb-1">1. User Responsibility & Liability</p>
                        <p>You are solely responsible for your actions and content on ZenSpace. The platform assumes no liability for user-generated content or interactions.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">2. Compliance with Local Laws</p>
                        <p>Users must comply with all applicable laws and regulations in their jurisdiction. Illegal content, hate speech, and harassment are strictly prohibited.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">3. External Links Disclaimer</p>
                        <p>ZenSpace is not responsible for the content, privacy policies, or practices of any third-party websites accessed via links on our platform.</p>
                    </div>
                    <div>
                        <p className="font-bold mb-1">4. Community Standards</p>
                        <p>Violators of these rules will be banned immediately to ensure a safe environment for all.</p>
                    </div>
                </div>

                <button 
                    onClick={handleAccept}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                >
                    I Agree & Continue
                </button>
            </div>
        </div>
    );
};

// Share Wall (Formerly Feed)
const ShareWall = () => {
  const { shareWallPosts, currentUser, navigateTo, shareWallFilter, setShareWallFilter } = useApp();
  const { t } = useLanguage();
  
  return (
    <main className="flex-1 max-w-2xl w-full mx-auto pb-24 md:pb-8 bg-[#f2f2f2] dark:bg-black min-h-screen">
      
      {/* Share Wall Header with Toggle */}
      <div className="sticky top-0 z-30 bg-[#f2f2f2] dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 safe-pt">
          <div className="px-4 py-3 flex justify-center items-center relative">
              <div className="flex bg-slate-200 dark:bg-[#1c1c1e] rounded-lg p-1">
                  <button 
                    onClick={() => setShareWallFilter('news')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${shareWallFilter === 'news' ? 'bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t('wall.news')}
                  </button>
                  <button 
                    onClick={() => setShareWallFilter('friends')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${shareWallFilter === 'friends' ? 'bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t('wall.friends')}
                  </button>
                  <button 
                    onClick={() => setShareWallFilter('mine')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${shareWallFilter === 'mine' ? 'bg-white dark:bg-[#3a3a3c] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                      {t('wall.mine')}
                  </button>
              </div>
              
              <button onClick={() => navigateTo('compose')} className="absolute right-4 p-2">
                  <CameraIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </button>
          </div>
      </div>
      
      <div className="p-4 space-y-5">
        {shareWallPosts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">
                {shareWallFilter === 'friends' ? "No friend updates. Invite friends!" : "No news yet."}
            </div>
        ) : (
            shareWallPosts.map(post => (
                <PostCard key={post.id} post={post} />
            ))
        )}
        
        {shareWallPosts.length > 0 && (
            <div className="py-8 text-center text-slate-300 dark:text-slate-600 text-sm">
            {t('feed.caught_up')}
            </div>
        )}
      </div>
    </main>
  );
};

const RightColumn = () => {
    const { t } = useLanguage();
    const { trendingTopics, navigateTo } = useApp();
    
    // Mini Trending Widget for Desktop
    const topTopics = trendingTopics.slice(0, 5);

    return (
        <div className="hidden lg:block w-80 sticky top-0 h-screen p-6 space-y-6 bg-white dark:bg-black border-l border-slate-100 dark:border-white/10 overflow-y-auto no-scrollbar">
             
             {/* Search / Explore Box */}
             <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-slate-100 dark:bg-[#1c1c1e] border-none rounded-full px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500" 
                 />
             </div>

             {/* Trending Widget */}
             <div className="rounded-xl p-4 bg-slate-50 dark:bg-[#1c1c1e] border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{t('trending.title')}</h3>
                    <button 
                        onClick={() => navigateTo('trending')}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-4">
                    {topTopics.map((topic, i) => (
                        <div key={topic.id} className="cursor-pointer group" onClick={() => navigateTo('trending')}>
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-0.5">{topic.category}</p>
                                {i < 3 && <FireIcon className="w-3 h-3 text-red-500" />}
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{topic.tag}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{topic.heat.toLocaleString()} heat</p>
                        </div>
                    ))}
                </div>
             </div>

             {/* Footer Links */}
             <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-400 dark:text-slate-600 px-2">
                 <a href="#" className="hover:underline">Terms of Service</a>
                 <a href="#" className="hover:underline">Privacy Policy</a>
                 <span>© 2024 Amaoagou Inc.</span>
             </div>
        </div>
    )
}

const AppContent = () => {
  const { currentView, isAuthenticated } = useApp();

  // Auth Check
  if (!isAuthenticated) {
      return <LoginView />;
  }

  // Render Full Page Views (Compose & Chat take over full screen on Mobile)
  if (currentView === 'compose') {
      return (
          <div className="min-h-screen bg-white dark:bg-black font-sans text-slate-900 dark:text-slate-100 transition-colors">
              <ComposeView />
              <NotificationToast />
          </div>
      );
  }
  if (currentView === 'chat') {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
              <ChatView />
              <NotificationToast />
          </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-[#f2f2f2] dark:bg-black font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      {/* View Switcher */}
      {currentView === 'chats' && <ConversationListView />}
      {currentView === 'moments' && <ShareWall />}
      {currentView === 'contacts' && <ContactsView />}
      {currentView === 'trending' && <TrendingView />}
      {currentView === 'settings' && <SettingsView />}
      
      <RightColumn />
      <MobileNav />
      <EulaModal />
      <BrowserModal />
      <ForwardModal />
      <NotificationToast />
    </div>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
};

export default App;