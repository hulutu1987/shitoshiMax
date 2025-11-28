

import React, { useState } from 'react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { HeartIcon, ThumbsDownIcon, MessageSquareIcon, CheckBadgeIcon, SmartphoneIcon, MoreHorizontalIcon, FlagIcon, BanIcon, MapPinIcon, LinkIcon, MaximizeIcon, TrashIcon, LockIcon, GlobeIcon, ShareIcon, ShieldAlertIcon } from './Icons';
import CommentSection from './CommentSection';
import Lightbox from './Lightbox';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { interactWithPost, currentUser, followUser, contacts, reportPost, blockUser, openBrowser, deletePost, sharePost } = useApp();
  const { t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const actionsRemaining = currentUser.maxActionsPerDay - currentUser.actionsToday;
  const canInteract = actionsRemaining > 0;
  
  const isFollowing = contacts.some(c => c.userId === post.userId);
  const isSelf = currentUser.id === post.userId;

  const handleReport = () => {
      reportPost(post.id);
      setShowMenu(false);
  };

  const handleBlock = () => {
      if (window.confirm(`Block ${post.user.name}? You will no longer see their posts.`)) {
          blockUser(post.userId);
      }
      setShowMenu(false);
  };

  const handleDelete = () => {
      if (window.confirm("Are you sure you want to delete this post?")) {
          deletePost(post.id);
      }
      setShowMenu(false);
  };

  // Helper to parse content for links
  const renderContent = (content: string) => {
    // Regex to find http/https links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <span 
                    key={i} 
                    onClick={(e) => {
                        e.stopPropagation();
                        openBrowser(part);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center space-x-0.5 break-all"
                >
                    <LinkIcon className="w-3 h-3 inline mr-0.5" />
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  };

  return (
    <>
    <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none border border-slate-100 dark:border-white/5 transition-all overflow-visible relative">
      <div className="p-4">
        <div className="flex space-x-3">
            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-md object-cover bg-slate-100 dark:bg-slate-700" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-[#1a1a1a] dark:text-slate-100 text-[15px] leading-none">{post.user.name}</h3>
                            {post.user.isVerified && (
                                <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                            )}
                            {!isSelf && !isFollowing && (
                                <button 
                                    onClick={() => followUser({ id: post.userId, name: post.user.name, handle: post.user.handle, avatar: post.user.avatar, isVerified: post.user.isVerified })}
                                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-2 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                >
                                    + {t('action.follow')}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                             <span className="text-slate-400 dark:text-slate-500 text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                {formatDate(post.timestamp)}
                             </span>
                             
                             {/* Visibility Icon */}
                             {post.visibility === 'friends' ? (
                                <LockIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                             ) : (
                                <GlobeIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                             )}

                             {/* Device Info */}
                             {post.deviceName && (
                                 <span className="text-[10px] text-slate-300 dark:text-slate-600 flex items-center bg-slate-50 dark:bg-[#2c2c2e] px-1.5 py-0.5 rounded">
                                    <SmartphoneIcon className="w-3 h-3 mr-0.5" />
                                    {post.deviceName}
                                 </span>
                             )}
                             {/* IP Location (Hidden network type text) */}
                             {post.location && (
                                 <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center bg-slate-50 dark:bg-[#2c2c2e] px-1.5 py-0.5 rounded border border-slate-100 dark:border-white/5">
                                    <MapPinIcon className="w-3 h-3 mr-0.5" />
                                    IP: {post.location}
                                 </span>
                             )}
                             
                             {/* VPN Badge */}
                             {post.networkType === 'VPN' && (
                                 <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 font-bold">
                                    <ShieldAlertIcon className="w-3 h-3 mr-0.5" />
                                    VPN Detected
                                 </span>
                             )}
                        </div>
                    </div>
                    
                    {/* Menu - Available for Self (Delete) and Others (Report) */}
                    <div className="relative">
                         <button onClick={() => setShowMenu(!showMenu)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1">
                             <MoreHorizontalIcon className="w-5 h-5" />
                         </button>
                         
                         {showMenu && (
                             <div className="absolute right-0 top-6 w-32 bg-white dark:bg-[#2c2c2e] shadow-lg rounded-lg border border-slate-100 dark:border-white/10 z-10 overflow-hidden">
                                 {isSelf ? (
                                     <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                                         <TrashIcon className="w-3 h-3 mr-2" />
                                         {t('action.delete')}
                                     </button>
                                 ) : (
                                     <>
                                        <button onClick={handleReport} className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center">
                                            <FlagIcon className="w-3 h-3 mr-2" />
                                            {t('action.report')}
                                        </button>
                                        <button onClick={() => {sharePost(post); setShowMenu(false)}} className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center">
                                            <ShareIcon className="w-3 h-3 mr-2" />
                                            {t('action.forward')}
                                        </button>
                                        <button onClick={handleBlock} className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center border-t border-slate-50 dark:border-white/5">
                                            <BanIcon className="w-3 h-3 mr-2" />
                                            {t('action.block')}
                                        </button>
                                     </>
                                 )}
                             </div>
                         )}
                         {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
                    </div>
                </div>
                
                <div className="mt-2 mb-3">
                    <p className="text-[#333] dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                        {renderContent(post.content)}
                    </p>
                    
                    {post.mediaUrl && (
                        <div 
                            className="mt-3 rounded-lg overflow-hidden border border-slate-100 dark:border-white/5 max-h-[400px] flex justify-center bg-black relative group cursor-pointer"
                            onClick={() => setShowLightbox(true)}
                        >
                            {/* Maximize Hint Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                                <MaximizeIcon className="w-10 h-10 text-white drop-shadow-lg" />
                            </div>

                            {post.mediaType === 'video' ? (
                                <video 
                                    src={post.mediaUrl} 
                                    className="max-w-full max-h-[400px]"
                                    playsInline
                                    muted
                                />
                            ) : (
                                <img 
                                    src={post.mediaUrl} 
                                    alt="Post Media" 
                                    className="max-w-full max-h-[400px] object-contain" 
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 bg-white dark:bg-[#1c1c1e] max-w-[90%]">
                    {/* 1. Like */}
                    <button
                        onClick={() => interactWithPost(post.id, 'like')}
                        disabled={!canInteract || post.hasLiked}
                        className={`flex items-center space-x-1.5 text-xs transition-colors ${
                            post.hasLiked ? 'text-red-500' : 'text-slate-400 dark:text-slate-500 hover:text-red-500'
                        }`}
                    >
                        <HeartIcon className="w-4 h-4" filled={post.hasLiked} />
                        <span>{post.likes || ''}</span>
                    </button>

                    {/* 2. Comment */}
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center space-x-1.5 text-xs transition-colors ${
                            showComments ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                    >
                        <MessageSquareIcon className="w-4 h-4" filled={showComments} />
                        <span>{post.comments.length || ''}</span>
                    </button>

                    {/* 3. Dislike (Replaced Repost) */}
                    <button
                        onClick={() => interactWithPost(post.id, 'dislike')}
                        disabled={!canInteract || post.hasDisliked}
                        className={`flex items-center space-x-1.5 text-xs transition-colors ${
                            post.hasDisliked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <ThumbsDownIcon className="w-4 h-4" filled={post.hasDisliked} />
                        <span>{post.dislikes || ''}</span>
                    </button>

                    {/* 4. Share */}
                    <button
                        onClick={() => sharePost(post)}
                        className="flex items-center space-x-1.5 text-xs transition-colors text-slate-400 dark:text-slate-500 hover:text-blue-600"
                    >
                        <ShareIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {showComments && (
          <CommentSection postId={post.id} comments={post.comments} />
      )}
    </div>

    {/* Lightbox Overlay */}
    {showLightbox && post.mediaUrl && (
        <Lightbox 
            mediaUrl={post.mediaUrl} 
            mediaType={post.mediaType === 'video' ? 'video' : 'image'} 
            onClose={() => setShowLightbox(false)} 
            allowDownload={post.allowDownload}
            watermark={post.watermark}
            authorHandle={post.user.handle}
        />
    )}
    </>
  );
};

export default PostCard;