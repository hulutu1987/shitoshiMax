

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatBubbleOvalLeftIcon, UserGroupIcon, PlusIcon, ScanIcon, UserIcon } from './Icons';

const ConversationListView = () => {
  const { contacts, messages, openChat, currentUser, navigateTo, addNotification, sendFriendRequest } = useApp();
  const { t } = useLanguage();
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Get list of users we have messages with or groups
  const chats = contacts.map(contact => {
      // Find last message
      const conversation = messages.filter(
          m => (m.senderId === currentUser.id && m.receiverId === contact.userId) ||
               (m.senderId === contact.userId && m.receiverId === currentUser.id) ||
               (contact.isGroup && m.receiverId === contact.userId)
      ).sort((a, b) => b.timestamp - a.timestamp);

      const lastMsg = conversation[0];
      
      return {
          contact,
          lastMessage: lastMsg?.content || 'No messages yet',
          timestamp: lastMsg?.timestamp,
          unread: Math.random() > 0.7 ? 1 : 0 // Mock unread
      };
  }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const handleScan = () => {
      setShowAddMenu(false);
      // In a real app, this would open the camera
      addNotification("Camera opened for QR Scan", "info");
      // navigateTo('scan') if there was a scan view
  };

  const handleAddFriend = () => {
      setShowAddMenu(false);
      const id = prompt(t('chat.search_id'));
      if (id) {
          addNotification(`Searching for ${id}...`, "info");
          setTimeout(() => {
              sendFriendRequest(id);
          }, 1000);
      }
  };

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto p-0 md:p-4 pb-24 h-screen flex flex-col">
       {/* Header */}
       <div className="bg-[#f2f2f2] dark:bg-black px-4 py-3 flex justify-between items-center sticky top-0 z-10 safe-pt border-b border-slate-200 dark:border-white/10">
           <span className="font-medium text-slate-800 dark:text-white text-lg">
               {t('nav.home')}
               <span className="text-xs text-slate-500 ml-2">({chats.length})</span>
           </span>
           
           <div className="relative">
                <button 
                    onClick={() => setShowAddMenu(!showAddMenu)} 
                    className="bg-slate-200 dark:bg-[#1c1c1e] p-1.5 rounded-md hover:bg-slate-300 dark:hover:bg-[#3a3a3c] transition-colors"
                >
                    <PlusIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                {showAddMenu && (
                    <div className="absolute right-0 top-10 w-40 bg-slate-800 text-white rounded-lg shadow-xl overflow-hidden z-20 animate-fade-in origin-top-right">
                        <button 
                            onClick={handleScan}
                            className="w-full flex items-center px-4 py-3 hover:bg-slate-700 border-b border-slate-700"
                        >
                            <ScanIcon className="w-5 h-5 mr-3" />
                            <span className="text-sm font-medium">{t('chat.scan')}</span>
                        </button>
                        <button 
                            onClick={handleAddFriend}
                            className="w-full flex items-center px-4 py-3 hover:bg-slate-700"
                        >
                            <UserIcon className="w-5 h-5 mr-3" />
                            <span className="text-sm font-medium">{t('chat.add_contact')}</span>
                        </button>
                    </div>
                )}
                {showAddMenu && <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />}
           </div>
       </div>

       {/* Chat List */}
       <div className="flex-1 overflow-y-auto bg-white dark:bg-black">
           {chats.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                   <ChatBubbleOvalLeftIcon className="w-16 h-16 opacity-20" />
                   <p>Start a new chat from Contacts</p>
                   <button onClick={() => navigateTo('contacts')} className="text-blue-600 font-bold">Go to Contacts</button>
               </div>
           ) : (
               chats.map(({ contact, lastMessage, timestamp, unread }) => (
                   <div 
                        key={contact.userId} 
                        onClick={() => openChat(contact.userId)}
                        className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-[#1c1c1e] border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors"
                   >
                       <div className="relative">
                           {contact.isGroup ? (
                               <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                   <UserGroupIcon className="w-7 h-7 text-slate-500" />
                               </div>
                           ) : (
                               <img src={contact.avatar} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                           )}
                           {unread > 0 && (
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                           )}
                       </div>
                       
                       <div className="ml-3 flex-1 min-w-0">
                           <div className="flex justify-between items-baseline mb-1">
                               <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate text-[16px]">
                                   {contact.note || contact.originalName}
                               </h3>
                               {timestamp && (
                                   <span className="text-[11px] text-slate-400">
                                       {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                   </span>
                               )}
                           </div>
                           <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                               {lastMessage}
                           </p>
                       </div>
                   </div>
               ))
           )}
       </div>
    </div>
  );
};

export default ConversationListView;