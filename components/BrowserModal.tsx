
import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, ShieldAlertIcon, ExternalLinkIcon, GlobeIcon } from './Icons';

const BrowserModal = () => {
  const { browserUrl, closeBrowser } = useApp();
  const { t } = useLanguage();

  if (!browserUrl) return null;

  const handleContinue = () => {
    window.open(browserUrl, '_blank');
    closeBrowser();
  };

  // Extract domain for display
  const domain = browserUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-lg rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors">
        
        {/* Browser Header */}
        <div className="bg-slate-100 dark:bg-slate-800 p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg px-3 py-1.5 flex items-center space-x-2 border border-slate-200 dark:border-slate-700 mx-2 shadow-sm">
                <GlobeIcon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono">{domain}</span>
            </div>
            <button onClick={closeBrowser} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
        </div>

        {/* Safety Interstitial Content */}
        <div className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-2">
                <ShieldAlertIcon className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('browser.leaving')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                   {t('browser.disclaimer')}
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 w-full text-left border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wide">Legal Disclaimer</p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4">
                    <li>{t('browser.liability')}</li>
                    <li>{t('browser.laws')}</li>
                </ul>
            </div>

            <div className="w-full space-y-3">
                <button 
                    onClick={handleContinue}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
                >
                    <span>{t('browser.continue')}</span>
                    <ExternalLinkIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={closeBrowser}
                    className="w-full text-slate-500 dark:text-slate-400 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    {t('browser.cancel')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserModal;
