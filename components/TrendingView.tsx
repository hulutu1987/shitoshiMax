

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { FireIcon, TrendingUpIcon, PlusIcon } from './Icons';
import { TrendingCategory } from '../types';

const TrendingView = () => {
  const { trendingTopics, navigateTo, addPost } = useApp();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<TrendingCategory>('all');

  const formatHeat = (heat: number) => {
      if (heat >= 1000000) return (heat / 1000000).toFixed(1) + 'M';
      if (heat >= 1000) return (heat / 1000).toFixed(1) + 'k';
      return heat.toString();
  };

  // Filter and Sort
  const filteredTopics = trendingTopics
      .filter(t => activeCategory === 'all' || t.category === activeCategory)
      .sort((a, b) => b.heat - a.heat); // Ensure highest heat is first

  const categories: TrendingCategory[] = ['all', 'tech', 'lifestyle', 'entertainment', 'finance'];

  const handleTopicClick = (topicTag: string) => {
      navigateTo('compose');
  };

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-500">
                <FireIcon className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('trending.title')}</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('trending.update')}</p>
            </div>
         </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                    ${activeCategory === cat 
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-[#1c1c1e] dark:text-slate-400 dark:border-white/10 dark:hover:bg-[#2c2c2e]'}`}
              >
                  {t(`trending.cat.${cat}` as any)}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
          <div className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredTopics.map((topic, index) => {
                  const rank = index + 1;
                  let rankColor = "bg-slate-100 text-slate-500 dark:bg-[#2c2c2e] dark:text-slate-400";
                  if (rank === 1) rankColor = "bg-red-500 text-white";
                  if (rank === 2) rankColor = "bg-orange-500 text-white";
                  if (rank === 3) rankColor = "bg-yellow-500 text-white";

                  return (
                      <div 
                        key={topic.id} 
                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => handleTopicClick(topic.tag)}
                      >
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold flex-shrink-0 ${rankColor}`}>
                                  {rank}
                              </span>
                              <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{topic.tag}</h3>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{topic.description}</p>
                              </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 pl-4">
                              <div className="text-right">
                                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500">{formatHeat(topic.heat)}</div>
                                  <div className="text-[10px] text-slate-300 dark:text-slate-600">{t('trending.hot')}</div>
                              </div>
                              <button className="text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <TrendingUpIcon className="w-5 h-5" />
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default TrendingView;