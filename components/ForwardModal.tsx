
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, SendIcon, UserIcon, UserGroupIcon, SearchIcon, LinkIcon, ShareIcon, CopyIcon } from './Icons';
import { Post, Message } from '../types';

const ForwardModal = () => {
  const { forwardingContent, setForwardingContent, contacts, messages, currentUser, sendMessage, addNotification } = useApp();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  if (!forwardingContent) return null;

  // Logic to determine "Recent Chats"
  const recentChatIds = new Set<string>();
  // Sort messages desc, grab receiverId or senderId
  [...messages].sort((a,b) => b.timestamp - a.timestamp).forEach(m => {
      if (m.senderId === currentUser.id) recentChatIds.add(m.receiverId);
      if (m.receiverId === currentUser.id) recentChatIds.add(m.senderId);
  });
  
  const recentChats = contacts.filter(c => recentChatIds.has(c.userId));
  const otherContacts = contacts.filter(c => !recentChatIds.has(c.userId));

  const handleForward = (userId: string) => {
    const { type, data } = forwardingContent;

    if (type === 'post') {
        const post = data as Post;
        sendMessage(
            `${post.content.substring(0, 50)}...`, 
            'share_card', 
            { 
                postId: post.id, 
                title: post.user.name + "'s Post", 
                image: post.mediaUrl,
                summary: post.content
            },
            userId
        );
    } else if (type === 'message') {
        const msg = data as Message;
        sendMessage(
            msg.content, 
            msg.type, 
            msg.meta,
            userId
        );
    }
    
    addNotification("Forwarded successfully", "success");
    setForwardingContent(null);
  };

  const handleCopyLink = () => {
      const content = forwardingContent.type === 'post' 
        ? (forwardingContent.data as Post).content 
        : (forwardingContent.data as Message).content;

      // In a real app, generate a deep link
      const textToCopy = `https://zen-space.app/shared?id=${Math.random().toString(36).substring(7)}\n\n${content}`;
      navigator.clipboard.writeText(textToCopy);
      addNotification("Link copied to clipboard", "success");
      setForwardingContent(null);
  };

  const handleSystemShare = async () => {
      const content = forwardingContent.type === 'post' 
        ? (forwardingContent.data as Post).content 
        : (forwardingContent.data as Message).content;
      
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'ZenSpace Shared Content',
                  text: content,
                  url: `https://zen-space.app/shared?id=${Math.random().toString(36).substring(7)}`
              });
              setForwardingContent(null);
          } catch (err) {
              console.log("Share cancelled");
          }
      } else {
          handleCopyLink();
      }
  };

  const renderContact = (contact: any) => (
    <button 
        key={contact.userId}
        onClick={() => handleForward(contact.userId)}
        className="w-full flex items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
    >
        {contact.isGroup ? (
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mr-3">
                <UserGroupIcon className="w-5 h-5 text-slate-500" />
            </div>
        ) : (
            <img src={contact.avatar} className="w-10 h-10 rounded-lg object-cover mr-3 bg-slate-200" />
        )}
        <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{contact.note || contact.originalName}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <SendIcon className="w-5 h-5 text-blue-500" />
        </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white">{t('action.forward_modal_title')}</h3>
                <button onClick={() => setForwardingContent(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                    <XIcon className="w-6 h-6 text-slate-500" />
                </button>
            </div>
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                 <button onClick={handleCopyLink} className="flex flex-col items-center space-y-2 group">
                     <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                         <CopyIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">{t('chat.copy')}</span>
                 </button>
                 <button onClick={handleSystemShare} className="flex flex-col items-center space-y-2 group">
                     <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                         <ShareIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                     </div>
                     <span className="text-[10px] text-slate-500 font-medium">{t('action.share')}</span>
                 </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center px-3 py-2">
                    <SearchIcon className="w-4 h-4 text-slate-400 mr-2" />
                    <input 
                        type="text"
                        placeholder="Search"
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {contacts.length === 0 ? (
                    <div className="text-center p-8 text-slate-400">No contacts found.</div>
                ) : (
                    <>
                        {recentChats.length > 0 && !searchTerm && (
                            <div className="mb-4">
                                <h4 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('chat.recent')}</h4>
                                {recentChats.map(renderContact)}
                            </div>
                        )}
                        
                        <div>
                            <h4 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{t('contacts.all')}</h4>
                            {(searchTerm 
                                ? contacts.filter(c => (c.note || c.originalName).toLowerCase().includes(searchTerm.toLowerCase())) 
                                : otherContacts
                            ).map(renderContact)}
                        </div>
                    </>
                )}
            </div>
            
            {/* Preview of what is being forwarded */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 safe-pb">
                <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 opacity-75">
                    {forwardingContent.type === 'post' ? (
                        <>
                            {(forwardingContent.data as Post).mediaUrl && (
                                <img src={(forwardingContent.data as Post).mediaUrl} className="w-10 h-10 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{(forwardingContent.data as Post).content}</p>
                            </div>
                        </>
                    ) : (
                         <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {(forwardingContent.data as Message).type === 'image' ? '[Image]' : (forwardingContent.data as Message).content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ForwardModal;
