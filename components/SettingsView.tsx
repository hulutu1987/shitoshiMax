import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUpIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon, CheckBadgeIcon, IdCardIcon, LogOutIcon, MapPinIcon, CameraIcon, TrashIcon, GlobeIcon, SettingsIcon, MoonIcon, SunIcon, QrCodeIcon, ScanIcon, XIcon, LinkIcon, CreditCardIcon, AppleIcon, FingerPrintIcon, SparklesIcon } from './Icons';
import { ThemeMode } from '../context/AppContext';

const SettingsView = () => {
  const { currentUser, updateUser, navigateTo, verifyIdentity, logout, addNotification, themeMode, setThemeMode, buyPoints } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    handle: currentUser.handle,
    bio: currentUser.bio || ''
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState('128 MB');
  const [showQrCode, setShowQrCode] = useState(false);
  
  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateUser(formData);
  };

  const handleDeleteAccount = () => {
      const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be removed (GDPR Compliance).");
      if (confirmDelete) {
          logout();
      }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUser({ avatar: reader.result });
          addNotification(t('settings.save'), 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCache = () => {
    setCacheSize('0 KB');
    addNotification(t('settings.cache_cleared'), 'success');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handlePayment = () => {
      if (!selectedAmount) return;
      setIsProcessing(true);
      
      // Simulate FaceID / Network delay
      setTimeout(() => {
          buyPoints(selectedAmount);
          setIsProcessing(false);
          setShowPayment(false);
          setSelectedAmount(null);
      }, 2000);
  };

  // Mock Transaction History
  const transactions = [
    { id: 1, type: 'reward', desc: 'Daily Login Bonus', amount: 10, date: 'Today, 9:00 AM' },
    { id: 2, type: 'reward', desc: 'High Quality Post', amount: 15, date: 'Yesterday' },
    { id: 3, type: 'reward', desc: 'Constructive Comment', amount: 2, date: 'Yesterday' },
  ];
  
  const regions = ['Global', 'US', 'CN', 'JP', 'UK', 'EU'];

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <button onClick={() => navigateTo('moments')} className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            &larr; {t('settings.back')}
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('nav.profile')}</h1>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Profile Header (Avatar + Info) */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5 flex items-start space-x-5 transition-colors relative">
              <div className="relative flex-shrink-0 group">
                 <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-lg object-cover border border-slate-100 dark:border-slate-700" />
                 
                 {/* Avatar Edit Overlay */}
                 <div 
                    className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    <CameraIcon className="w-6 h-6 text-white" />
                 </div>
                 <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleAvatarChange} 
                 />

                 <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-[#1c1c1e]">
                    {currentUser.points} PTS
                 </div>
              </div>
              <div className="flex-1">
                 <div className="mb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="block w-full font-bold text-lg text-slate-800 dark:text-slate-100 border-b border-transparent hover:border-slate-200 focus:border-blue-400 focus:outline-none bg-transparent placeholder-slate-400 transition-colors"
                                placeholder={t('settings.displayName')}
                            />
                            {currentUser.isVerified && <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                        </div>
                        {/* My QR Code Button */}
                        <button onClick={() => setShowQrCode(true)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                            <QrCodeIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">{currentUser.handle}</p>
                    {currentUser.location && (
                      <div className="flex items-center space-x-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
                         <MapPinIcon className="w-3 h-3" />
                         <span>{currentUser.location}</span>
                      </div>
                    )}
                 </div>
                 <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full text-sm text-slate-600 dark:text-slate-300 bg-transparent border-none p-0 focus:ring-0 resize-none placeholder-slate-300"
                    rows={2}
                    placeholder={t('settings.bio')}
                    onBlur={handleSave}
                  />
              </div>
        </div>

        {/* Recharge Action */}
        <button 
            onClick={() => setShowPayment(true)}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform"
        >
            <CreditCardIcon className="w-5 h-5" />
            <span>{t('settings.recharge')}</span>
        </button>

        {/* General Settings */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
             <div className="px-4 py-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center">
                     <SettingsIcon className="w-4 h-4 mr-2 text-slate-500" />
                     {t('settings.general')}
                 </h3>
             </div>
             
             {/* News Region Selector */}
             <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-white/5">
                 <div className="flex items-center space-x-3">
                     <GlobeIcon className="w-5 h-5 text-slate-400" />
                     <div>
                         <span className="text-sm font-medium text-slate-700 dark:text-slate-200 block">{t('settings.news_region')}</span>
                         <span className="text-[10px] text-slate-400 block">{t('settings.news_desc')}</span>
                     </div>
                 </div>
                 <select 
                    value={currentUser.newsRegion} 
                    onChange={(e) => updateUser({ newsRegion: e.target.value })}
                    className="bg-slate-50 dark:bg-[#2c2c2e] text-slate-800 dark:text-white text-sm rounded-lg px-2 py-1 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                 >
                     {regions.map(r => (
                         <option key={r} value={r}>{t(`region.${r}` as any)}</option>
                     ))}
                 </select>
             </div>

             {/* Language */}
             <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={toggleLanguage}>
                 <div className="flex items-center space-x-3">
                     <GlobeIcon className="w-5 h-5 text-slate-400" />
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.language')}</span>
                 </div>
                 <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                     {language === 'en' ? 'English' : '中文'}
                 </span>
             </div>

             {/* Theme Mode Selector */}
             <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-white/5">
                 <div className="flex items-center space-x-3">
                     {themeMode === 'dark' ? <MoonIcon className="w-5 h-5 text-slate-400" /> : <SunIcon className="w-5 h-5 text-slate-400" />}
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.dark_mode')}</span>
                 </div>
                 <select 
                    value={themeMode}
                    onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
                    className="bg-slate-50 dark:bg-[#2c2c2e] text-slate-800 dark:text-white text-sm rounded-lg px-2 py-1 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                 >
                     <option value="light">{t('theme.light')}</option>
                     <option value="dark">{t('theme.dark')}</option>
                     <option value="system">{t('theme.system')}</option>
                 </select>
             </div>

             {/* Clear Cache */}
             <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={handleClearCache}>
                 <div className="flex items-center space-x-3">
                     <TrashIcon className="w-5 h-5 text-slate-400" />
                     <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.clear_cache')}</span>
                 </div>
                 <span className="text-xs text-slate-400">{cacheSize}</span>
             </div>
        </div>

        {/* Identity Verification */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
             <div className="flex justify-between items-start mb-4">
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center">
                     <CheckBadgeIcon className="w-4 h-4 mr-2 text-blue-500" />
                     {t('settings.verify')}
                 </h3>
                 <span className={`text-xs px-2 py-1 rounded-full font-bold ${currentUser.isVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                     {currentUser.isVerified ? t('settings.verified') : t('settings.unverified')}
                 </span>
             </div>
             
             {currentUser.isVerified ? (
                 <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.verify_desc')}</p>
             ) : (
                 <div className="grid grid-cols-2 gap-3 mt-4">
                     <button 
                        onClick={() => verifyIdentity('passport')}
                        className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-white/5 hover:border-blue-200 transition-all"
                     >
                         <IdCardIcon className="w-6 h-6 text-slate-600 dark:text-slate-300 mb-2" />
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('settings.verify_id')}</span>
                         <span className="text-[10px] text-slate-400">Passport / ID</span>
                     </button>
                     <button 
                        onClick={() => verifyIdentity('social_link')}
                        className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-white/5 hover:border-blue-200 transition-all"
                     >
                         <LinkIcon className="w-6 h-6 text-blue-500 mb-2" />
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('settings.verify_social')}</span>
                         <span className="text-[10px] text-slate-400">Connect Account</span>
                     </button>
                 </div>
             )}
        </div>

        {/* Collapsible Rules & History Section */}
        <div className="space-y-4">
            
            {/* Reputation Rules (Collapsible) */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
                <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setIsRulesOpen(!isRulesOpen)}
                >
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center text-sm">
                        <SparklesIcon className="w-4 h-4 mr-2 text-orange-400" />
                        {t('rules.title')}
                    </h3>
                    {isRulesOpen ? <ChevronUpIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
                </div>
                
                {isRulesOpen && (
                    <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
                             <div>
                                 <p className="font-bold mb-2 text-slate-800 dark:text-slate-200">{t('rules.earning')}</p>
                                 <ul className="space-y-1">
                                     <li className="flex justify-between"><span>{t('rules.daily_login')}</span><span className="text-emerald-500 font-bold">+20</span></li>
                                     <li className="flex justify-between"><span>{t('rules.post_earn')}</span><span className="text-emerald-500 font-bold">+2</span></li>
                                     <li className="flex justify-between"><span>{t('rules.comment_earn')}</span><span className="text-emerald-500 font-bold">+1</span></li>
                                 </ul>
                             </div>
                             <div>
                                 <p className="font-bold mb-2 text-slate-800 dark:text-slate-200">{t('rules.spending')}</p>
                                 <ul className="space-y-1">
                                     <li className="flex justify-between"><span>{t('rules.post_base')}</span><span className="text-red-500 font-bold">-3</span></li>
                                     <li className="flex justify-between"><span>{t('rules.post_video')}</span><span className="text-red-500 font-bold">-10</span></li>
                                     <li className="flex justify-between"><span>{t('rules.post_overflow')}</span><span className="text-red-500 font-bold">-1 / char</span></li>
                                     <li className="flex justify-between"><span>{t('rules.interaction_cost')}</span><span className="text-red-500 font-bold">-1</span></li>
                                     <li className="flex justify-between"><span>{t('rules.toxic_penalty')}</span><span className="text-red-500 font-bold">-50</span></li>
                                 </ul>
                             </div>
                         </div>
                    </div>
                )}
            </div>

            {/* Point History (Collapsible) */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
                <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                >
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center text-sm">
                        <TrendingUpIcon className="w-4 h-4 mr-2 text-slate-400" />
                        {t('settings.history')}
                    </h3>
                    {isHistoryOpen ? <ChevronUpIcon className="w-4 h-4 text-slate-400" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
                </div>
                
                {isHistoryOpen && (
                    <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                        <div className="p-3 border-b border-slate-100 dark:border-white/5 flex justify-end">
                            <button className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                <DownloadIcon className="w-3 h-3" />
                                <span>{t('profile.export')}</span>
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {transactions.map(t => (
                                <div key={t.id} className="p-3 flex justify-between items-center px-4">
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.desc}</p>
                                        <p className="text-[10px] text-slate-400">{t.date}</p>
                                    </div>
                                    <div className={`font-bold text-xs ${t.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {t.amount > 0 ? '+' : ''}{t.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* About & Safety */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-white/5 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm">{t('settings.about_safety')}</h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <a href="#" className="block hover:text-blue-600 dark:hover:text-blue-400">{t('settings.privacy')}</a>
                <a href="#" className="block hover:text-blue-600 dark:hover:text-blue-400">{t('settings.terms')}</a>
                <div className="flex justify-between items-center">
                    <span>{t('settings.blocked_users')}</span>
                    <span className="text-slate-400 text-xs">{currentUser.blockedUserIds.length} {t('action.blocked')}</span>
                </div>
            </div>
        </div>
        
        {/* Account Actions */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/30 space-y-4 transition-colors">
             <button onClick={logout} className="w-full flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors border border-slate-200 dark:border-white/10">
                <LogOutIcon className="w-4 h-4" />
                <span className="text-sm font-bold">{t('settings.logout')}</span>
            </button>

            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                <span className="text-sm font-bold">Delete Account</span>
            </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrCode && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowQrCode(false)}>
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl max-w-sm w-full p-6 text-center space-y-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowQrCode(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                      <XIcon className="w-6 h-6" />
                  </button>
                  
                  <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t('settings.qrcode')}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Scan to add me</p>
                  </div>

                  <div className="flex justify-center my-6">
                      <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-100">
                          {/* Simulated QR Code via simple SVG pattern */}
                          <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor" className="text-slate-900">
                              <rect x="0" y="0" width="100" height="100" fill="white" />
                              <rect x="10" y="10" width="30" height="30" />
                              <rect x="60" y="10" width="30" height="30" />
                              <rect x="10" y="60" width="30" height="30" />
                              <rect x="15" y="15" width="20" height="20" fill="white" />
                              <rect x="65" y="15" width="20" height="20" fill="white" />
                              <rect x="15" y="65" width="20" height="20" fill="white" />
                              <rect x="20" y="20" width="10" height="10" />
                              <rect x="70" y="20" width="10" height="10" />
                              <rect x="20" y="70" width="10" height="10" />
                              <rect x="50" y="50" width="10" height="10" />
                              <rect x="45" y="10" width="5" height="5" />
                              <rect x="10" y="45" width="5" height="5" />
                              <rect x="80" y="80" width="10" height="10" />
                              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                          </svg>
                      </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                      <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-slate-200" />
                      <div className="text-left">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.handle}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* iOS Payment Sheet (Apple Pay Simulation) */}
      {showPayment && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
              <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-in overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 dark:text-white">{t('pay.title')}</h3>
                      <button onClick={() => setShowPayment(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-sm">Cancel</button>
                  </div>
                  
                  {isProcessing ? (
                       <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                           <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-black flex items-center justify-center animate-pulse">
                               <FingerPrintIcon className="w-10 h-10 text-blue-500" />
                           </div>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">{t('pay.processing')}</p>
                           <p className="text-xs text-slate-500">Confirming with Face ID</p>
                       </div>
                  ) : (
                      <div className="p-4 space-y-4">
                          {/* Card Simulation */}
                          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                              <div className="flex justify-between items-start mb-6">
                                  <AppleIcon className="w-8 h-8" />
                                  <span className="font-mono text-xs opacity-70">.... 4242</span>
                              </div>
                              <div className="flex justify-between items-end">
                                  <div>
                                      <p className="text-[10px] opacity-60 uppercase">Card Holder</p>
                                      <p className="font-bold text-sm tracking-wide">Alex Chen</p>
                                  </div>
                                  <AppleIcon className="w-6 h-6 opacity-80" />
                              </div>
                          </div>
                          
                          {/* Amount Selection */}
                          <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('pay.select_amount')}</p>
                              <div className="grid grid-cols-3 gap-3">
                                  {[100, 500, 1000].map(amt => (
                                      <button 
                                        key={amt}
                                        onClick={() => setSelectedAmount(amt)}
                                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedAmount === amt ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-white/10 hover:border-blue-300'}`}
                                      >
                                          {amt} Pts
                                      </button>
                                  ))}
                              </div>
                          </div>

                          {/* Confirm Button */}
                          <button 
                              disabled={!selectedAmount}
                              onClick={handlePayment}
                              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                          >
                              <div className="w-5 h-5 bg-white text-black dark:bg-black dark:text-white rounded-full flex items-center justify-center text-[10px] font-serif font-black">A</div>
                              <span>{t('pay.confirm')}</span>
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default SettingsView;