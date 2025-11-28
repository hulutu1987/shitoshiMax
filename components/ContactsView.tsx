

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UsersIcon, MessageSquareIcon, EditIcon, CheckBadgeIcon, UserPlusIcon, XIcon, CheckIcon } from './Icons';

const ContactsView = () => {
  const { contacts, friendRequests, acceptFriendRequest, rejectFriendRequest, openChat, updateContactNote, navigateTo } = useApp();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  const startEditing = (userId: string, currentNote: string) => {
    setEditingId(userId);
    setTempNote(currentNote);
  };

  const saveNote = (userId: string) => {
    updateContactNote(userId, tempNote);
    setEditingId(null);
  };

  const pendingRequests = friendRequests.filter(r => r.status === 'pending');

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24">
       <div className="flex items-center mb-6 space-x-4">
            <button onClick={() => navigateTo('moments')} className="md:hidden text-slate-500 hover:text-slate-800">
            &larr; {t('settings.back')}
            </button>
            <div className="flex items-center space-x-2">
                <UsersIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t('contacts.title')}</h1>
            </div>
       </div>

       {/* Friend Requests Section */}
       {pendingRequests.length > 0 && (
           <div className="mb-6 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
               <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-800">
                   <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center">
                       <UserPlusIcon className="w-4 h-4 mr-2" />
                       {t('contacts.requests')} ({pendingRequests.length})
                   </h3>
               </div>
               <div className="divide-y divide-slate-50 dark:divide-white/5">
                   {pendingRequests.map(req => (
                       <div key={req.id} className="p-4 flex items-center justify-between">
                           <div className="flex items-center space-x-3">
                               <img src={req.fromUser.avatar} className="w-10 h-10 rounded-full object-cover" />
                               <div>
                                   <p className="font-bold text-sm text-slate-800 dark:text-white">{req.fromUser.name}</p>
                                   <p className="text-xs text-slate-500">{req.fromUser.handle}</p>
                               </div>
                           </div>
                           <div className="flex space-x-2">
                               <button 
                                   onClick={() => acceptFriendRequest(req.id)}
                                   className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                               >
                                   <CheckIcon className="w-5 h-5" />
                               </button>
                               <button 
                                   onClick={() => rejectFriendRequest(req.id)}
                                   className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                               >
                                   <XIcon className="w-5 h-5" />
                               </button>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}

       <div className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
            <div className="divide-y divide-slate-50 dark:divide-white/5">
                {contacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No contacts yet. Follow people to see them here.
                    </div>
                ) : (
                    contacts.map(contact => (
                        <div key={contact.userId} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center space-x-3">
                                <img src={contact.avatar} alt={contact.originalName} className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-600" />
                                <div>
                                    {editingId === contact.userId ? (
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="text" 
                                                value={tempNote}
                                                onChange={(e) => setTempNote(e.target.value)}
                                                className="border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none w-32 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                                                autoFocus
                                            />
                                            <button onClick={() => saveNote(contact.userId)} className="text-xs text-blue-600 font-bold px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">OK</button>
                                        </div>
                                    ) : (
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] flex items-center">
                                            {contact.note || contact.originalName}
                                            {contact.isVerified && <CheckBadgeIcon className="w-3 h-3 ml-1 text-blue-500" />}
                                        </h3>
                                    )}
                                    
                                    {contact.note && (
                                        <p className="text-xs text-slate-400 mt-0.5">ID: {contact.originalName}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => startEditing(contact.userId, contact.note || '')}
                                    className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
                                    title={t('contacts.edit_note')}
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => openChat(contact.userId)}
                                    className="text-blue-600 bg-blue-50 p-2 rounded-full hover:bg-blue-100 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                    title={t('contacts.message')}
                                >
                                    <MessageSquareIcon className="w-5 h-5" filled />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
       </div>
    </div>
  );
};

export default ContactsView;