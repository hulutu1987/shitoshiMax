
import React, { useState } from 'react';
import { Comment } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { analyzeContent } from '../services/geminiService';
import { SendIcon } from './Icons';

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
    const { currentUser, addComment, addNotification } = useApp();
    const { t } = useLanguage();
    const [newComment, setNewComment] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const commentsRemaining = currentUser.maxCommentsPerDay - currentUser.commentsToday;
    const isLimitReached = commentsRemaining <= 0;

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isLimitReached) return;

        setIsAnalyzing(true);
        try {
            const analysis = await analyzeContent(newComment);
            addComment(postId, newComment, analysis);
            if (analysis.isSafe) {
                setNewComment('');
            }
        } catch (err) {
            addNotification("Failed to verify comment.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-[#f9f9f9] dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-700 animate-fade-in">
            {/* Comments List */}
            <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-2">{t('comment.none')}</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                            <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-200" />
                            <div className="flex-1 bg-white dark:bg-slate-700/50 p-2.5 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-50 dark:border-slate-700">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{comment.user.name}</span>
                                    <span className="text-[10px] text-slate-400">
                                        {Math.floor((Date.now() - comment.timestamp) / 60000)}m
                                    </span>
                                </div>
                                <p className="text-sm text-slate-800 dark:text-slate-300 mt-0.5 leading-snug">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input - Optimized for Mobile App Look */}
            <div className="flex items-center space-x-3">
                <img src={currentUser.avatar} alt="You" className="w-8 h-8 rounded-lg object-cover" />
                <div className="flex-1 relative">
                    <form onSubmit={handleCommentSubmit} className="relative">
                        <input 
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={isLimitReached ? t('comment.limit') : t('comment.placeholder')}
                            disabled={isLimitReached || isAnalyzing}
                            className="w-full pl-4 pr-10 py-2.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all disabled:opacity-60 placeholder-slate-400 shadow-sm"
                        />
                        <button 
                            type="submit"
                            disabled={!newComment.trim() || isLimitReached || isAnalyzing}
                            className={`absolute right-1.5 top-1.5 p-1.5 rounded-full transition-colors ${
                                !newComment.trim() || isLimitReached 
                                    ? 'text-slate-300 dark:text-slate-500' 
                                    : 'text-white bg-blue-500 hover:bg-blue-600 shadow-sm'
                            }`}
                        >
                            <SendIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
