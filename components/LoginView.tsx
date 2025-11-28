
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { AppLogoIcon, PhoneIcon, MailIcon, AppleIcon, GoogleIcon, FacebookIcon, TwitterXIcon } from './Icons';

const LoginView = () => {
  const { login } = useApp();
  const { t } = useLanguage();
  const [method, setMethod] = useState<'phone' | 'email'>('email');
  const [credential, setCredential] = useState('');
  const [code, setCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // In a real app, authenticate here
      login();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
             <AppLogoIcon className="h-full w-full" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Tab Switch */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setMethod('email')}
                className={`flex-1 pb-4 text-sm font-medium text-center border-b-2 transition-colors ${method === 'email' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                  <MailIcon className="w-4 h-4 inline mr-2" />
                  {t('login.email')}
              </button>
              <button 
                onClick={() => setMethod('phone')}
                className={`flex-1 pb-4 text-sm font-medium text-center border-b-2 transition-colors ${method === 'phone' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  {t('login.phone')}
              </button>
          </div>

          {/* Inputs */}
          <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                  <input 
                    type={method === 'phone' ? 'tel' : 'email'}
                    required
                    className="relative block w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm bg-slate-50 dark:bg-slate-900 transition-all"
                    placeholder={method === 'phone' ? t('login.input_phone') : t('login.input_email')}
                    value={credential}
                    onChange={e => setCredential(e.target.value)}
                  />
              </div>
              <div className="flex space-x-3">
                  <input 
                    type="password"
                    required
                    className="relative block w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm bg-slate-50 dark:bg-slate-900 transition-all"
                    placeholder={method === 'phone' ? t('login.input_code') : "Password"}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                  {method === 'phone' && (
                    <button type="button" className="w-32 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        {t('login.get_code')}
                    </button>
                  )}
              </div>

              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                {t('login.btn')}
              </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">{t('login.or')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-4 gap-6">
            <button 
                onClick={login} 
                className="flex justify-center items-center w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group shadow-sm hover:shadow-md"
                aria-label="Login with Apple"
            >
                <AppleIcon className="w-6 h-6 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={login} 
                className="flex justify-center items-center w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group shadow-sm hover:shadow-md"
                aria-label="Login with Google"
            >
                <GoogleIcon className="w-6 h-6 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={login} 
                className="flex justify-center items-center w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group shadow-sm hover:shadow-md"
                aria-label="Login with X"
            >
                <TwitterXIcon className="w-5 h-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
            </button>
            <button 
                onClick={login} 
                className="flex justify-center items-center w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 group shadow-sm hover:shadow-md"
                aria-label="Login with Facebook"
            >
                <FacebookIcon className="w-6 h-6 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-6 leading-relaxed">
              {t('login.agree')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
