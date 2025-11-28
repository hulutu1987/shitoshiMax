

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeftIcon, PlusIcon, MicrophoneIcon, FaceSmileIcon, KeyboardIcon, SparklesIcon, WaveformIcon, UserGroupIcon, BanknotesIcon, DiceIcon, HandRockIcon, PlayIcon, PauseIcon, PhotoIcon, BanIcon, ShareIcon, CopyIcon, TrashIcon, ArrowRightIcon } from './Icons';
import { Message } from '../types';

const ChatView = () => {
  const { activeChatUser, contacts, messages, currentUser, sendMessage, navigateTo, sparkLevel, transferPoints, chatBackground, setChatBackground, forwardMessage, addNotification } = useApp();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransferInput, setShowTransferInput] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, message: Message | null }>({ x: 0, y: 0, message: null });
  const longPressTimer = useRef<number | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Find user details
  const contact = contacts.find(c => c.userId === activeChatUser);
  const isBlocked = activeChatUser ? currentUser.blockedUserIds.includes(activeChatUser) : false;
  
  // Filter messages
  const conversation = messages.filter(
      m => (m.senderId === currentUser.id && m.receiverId === activeChatUser) ||
           (m.senderId === activeChatUser && m.receiverId === currentUser.id) ||
           (contact?.isGroup && m.receiverId === contact.userId)
  ).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, showStickers, showPlusMenu]);

  // Hide context menu on click elsewhere
  useEffect(() => {
      const handleClick = () => setContextMenu({ x: 0, y: 0, message: null });
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSend = () => {
      if (!inputText.trim() || isBlocked) return;
      sendMessage(inputText, 'text');
      setInputText('');
      setShowStickers(false);
      setShowPlusMenu(false);
  };

  const sendSticker = (emoji: string) => {
      sendMessage(emoji, 'sticker');
      setShowStickers(false);
  };

  const sendInteractive = (type: 'dice' | 'rps') => {
      let content = '';
      if (type === 'dice') {
          const val = Math.floor(Math.random() * 6) + 1;
          content = val.toString();
      } else {
          const opts = ['✊', '✌️', '✋'];
          content = opts[Math.floor(Math.random() * 3)];
      }
      sendMessage(content, type);
      setShowPlusMenu(false);
  }

  const handleTransfer = () => {
      const amount = parseInt(transferAmount);
      if (amount > 0) {
          transferPoints(amount);
          setTransferAmount('');
          setShowTransferInput(false);
          setShowPlusMenu(false);
      }
  };

  const handleVoiceRecord = (start: boolean) => {
      if (start) {
          setIsRecording(true);
      } else {
          setIsRecording(false);
          // Simulate sending audio after release
          setTimeout(() => {
             sendMessage('Audio Message (3s)', 'audio');
          }, 200);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isBlocked) return;
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          sendMessage(url, 'image');
          setShowPlusMenu(false);
      }
  };

  const toggleAudio = (id: string) => {
      if (playingAudioId === id) {
          setPlayingAudioId(null);
      } else {
          setPlayingAudioId(id);
          // Auto stop after 3s simulation
          setTimeout(() => {
              setPlayingAudioId(prev => prev === id ? null : prev);
          }, 3000);
      }
  };

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
  };

  const handleTouchStart = (msg: Message) => {
      longPressTimer.current = window.setTimeout(() => {
          // Simulate center screen position for mobile context menu since touch coordinates are tricky here without event
          setContextMenu({ x: window.innerWidth / 2, y: window.innerHeight / 2, message: msg });
      }, 600);
  };

  const handleTouchEnd = () => {
      if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
  };

  const handleMenuAction = (action: 'copy' | 'forward' | 'delete') => {
      if (!contextMenu.message) return;
      const msg = contextMenu.message;

      if (action === 'copy') {
          navigator.clipboard.writeText(msg.content);
          addNotification("Copied", "success");
      } else if (action === 'forward') {
          forwardMessage(msg);
      } else if (action === 'delete') {
          // In a real app, verify permission. Here just hiding locally logic simulated
          addNotification("Message deleted locally", "info");
      }
  };

  if (!contact) return <div className="p-4 text-center text-slate-400 mt-10">Select a contact to message.</div>;

  return (
    <div className={`flex flex-col h-screen max-w-2xl mx-auto w-full shadow-xl border-x border-slate-200 dark:border-white/10 ${chatBackground} bg-cover bg-center transition-all relative`}>
        {/* Header */}
        <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0 sticky top-0 z-20 safe-pt">
            <div className="flex items-center">
                <button onClick={() => navigateTo('chats')} className="mr-2 text-slate-600 dark:text-slate-300 p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3">
                     {contact.isGroup ? (
                        <div className="w-9 h-9 rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                     ) : (
                        <img src={contact.avatar} alt="Avatar" className="w-9 h-9 rounded-lg object-cover border border-slate-100 dark:border-slate-700" />
                     )}
                     <span className="font-bold text-slate-800 dark:text-slate-100 block leading-tight">{contact.note || contact.originalName}</span>
                </div>
            </div>
            
            {/* Spark Meter */}
            <div className="flex items-center space-x-1 bg-white dark:bg-[#1c1c1e] px-2 py-1 rounded-full border border-slate-100 dark:border-white/10 shadow-sm">
                <SparklesIcon className={`w-4 h-4 ${sparkLevel > 50 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{sparkLevel}</span>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {!isMe && <img src={contact.avatar} className="w-9 h-9 rounded-md mr-2 self-start bg-slate-200" />}
                        <div 
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-[15px] shadow-sm relative select-none ${
                            isMe 
                            ? 'bg-blue-500 text-white rounded-br-none' // iMessage Blue
                            : 'bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-white/5'
                            } ${contextMenu.message?.id === msg.id ? 'brightness-90 scale-95 transition-transform' : ''}`}
                            onContextMenu={(e) => handleContextMenu(e, msg)}
                            onTouchStart={() => handleTouchStart(msg)}
                            onTouchEnd={handleTouchEnd}
                        >
                            {msg.type === 'text' && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                            
                            {msg.type === 'image' && <img src={msg.content} alt="Shared" className="rounded-lg max-w-full" />}
                            
                            {msg.type === 'sticker' && <span className="text-5xl block">{msg.content}</span>}
                            
                            {msg.type === 'transfer' && (
                                <div className={`flex flex-col min-w-[160px] ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="p-1.5 bg-orange-400 rounded-full">
                                            <BanknotesIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-bold">{msg.meta?.amount} pts</span>
                                    </div>
                                    <span className="text-xs opacity-80">{t('chat.transfer_received')}</span>
                                </div>
                            )}

                            {msg.type === 'share_card' && (
                                <div 
                                    className={`flex flex-col min-w-[200px] cursor-pointer bg-white/10 p-1 rounded hover:opacity-90 transition-opacity ${isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}
                                    onClick={() => navigateTo('moments')}
                                >
                                    <div className="flex items-center space-x-2 mb-2 border-b border-white/20 pb-1">
                                        <ShareIcon className="w-4 h-4" />
                                        <span className="text-xs font-bold">{t('chat.share_card')}</span>
                                    </div>
                                    {msg.meta?.image && <img src={msg.meta.image} className="w-full h-24 object-cover rounded mb-2" />}
                                    <h4 className="font-bold text-sm mb-1">{msg.meta?.title}</h4>
                                    <p className="text-xs opacity-80 line-clamp-2">{msg.meta?.summary}</p>
                                </div>
                            )}

                            {msg.type === 'dice' && (
                                <div className="flex flex-col items-center">
                                    <DiceIcon className="w-12 h-12 mb-1" />
                                    <span className="font-bold text-xl">{msg.content}</span>
                                </div>
                            )}

                            {msg.type === 'rps' && (
                                <div className="flex flex-col items-center">
                                    <HandRockIcon className="w-12 h-12 mb-1" />
                                    <span className="text-3xl">{msg.content}</span>
                                </div>
                            )}
                            
                            {msg.type === 'audio' && (
                                <div 
                                    className="flex items-center space-x-2 min-w-[100px] cursor-pointer"
                                    onClick={() => toggleAudio(msg.id)}
                                >
                                    {playingAudioId === msg.id ? (
                                        <PauseIcon className="w-5 h-5 animate-pulse" />
                                    ) : (
                                        <PlayIcon className="w-5 h-5" />
                                    )}
                                    <WaveformIcon className={`w-12 h-6 ${playingAudioId === msg.id ? 'animate-pulse' : 'opacity-60'}`} />
                                    <span className="text-xs font-medium">3"</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
            <div ref={endOfMessagesRef} />
        </div>

        {/* Context Menu Overlay */}
        {contextMenu.message && (
            <div 
                className="fixed z-50 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-2xl border border-slate-100 dark:border-white/10 py-2 w-48 animate-fade-in"
                style={{ 
                    top: Math.min(contextMenu.y, window.innerHeight - 200), 
                    left: Math.min(contextMenu.x, window.innerWidth - 200) 
                }}
            >
                <button onClick={() => handleMenuAction('copy')} className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200">
                    <CopyIcon className="w-4 h-4" />
                    <span>{t('chat.copy')}</span>
                </button>
                <button onClick={() => handleMenuAction('forward')} className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200">
                    <ArrowRightIcon className="w-4 h-4" />
                    <span>{t('chat.forward')}</span>
                </button>
                <button onClick={() => handleMenuAction('delete')} className="w-full px-4 py-2.5 text-left text-sm flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
                    <TrashIcon className="w-4 h-4" />
                    <span>{t('chat.delete')}</span>
                </button>
            </div>
        )}

        {/* Transfer Overlay */}
        {showTransferInput && (
            <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-[#1c1c1e] p-4 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-30 animate-slide-in">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('chat.transfer')}</h3>
                <div className="flex space-x-2">
                    <input 
                        type="number" 
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder={t('chat.transfer_amount')}
                        className="flex-1 border rounded-lg px-3 py-2 bg-slate-50 dark:bg-black text-slate-900 dark:text-white"
                        autoFocus
                    />
                    <button 
                        onClick={handleTransfer}
                        className="bg-blue-600 text-white px-4 rounded-lg font-bold"
                    >
                        {t('chat.transfer_confirm')}
                    </button>
                    <button 
                        onClick={() => setShowTransferInput(false)}
                        className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 rounded-lg font-bold"
                    >
                        X
                    </button>
                </div>
            </div>
        )}

        {/* WeChat-style Input Bar */}
        <div className="bg-[#f7f7f7] dark:bg-black border-t border-slate-200 dark:border-white/10 p-2 safe-pb">
            {isBlocked ? (
                <div className="flex flex-col items-center justify-center py-4 text-slate-400 space-y-2">
                    <BanIcon className="w-6 h-6" />
                    <span className="text-sm">{t('chat.blocked_msg')}</span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        {/* Voice/Keyboard Toggle */}
                        <button onClick={() => setIsVoiceMode(!isVoiceMode)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full">
                            {isVoiceMode ? <KeyboardIcon className="w-7 h-7" /> : <MicrophoneIcon className="w-7 h-7" />}
                        </button>

                        {/* Input Field or Voice Button */}
                        <div className="flex-1">
                            {isVoiceMode ? (
                                <button 
                                    className={`w-full font-bold text-slate-700 dark:text-slate-200 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 select-none ${isRecording ? 'bg-slate-300 dark:bg-slate-700' : 'bg-white dark:bg-[#1c1c1e]'}`}
                                    onMouseDown={() => handleVoiceRecord(true)}
                                    onMouseUp={() => handleVoiceRecord(false)}
                                    onTouchStart={() => handleVoiceRecord(true)}
                                    onTouchEnd={() => handleVoiceRecord(false)}
                                >
                                    {isRecording ? t('chat.release_to_send') : t('chat.hold_to_talk')}
                                </button>
                            ) : (
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="w-full bg-white dark:bg-[#1c1c1e] border-none rounded-md px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-green-500 text-slate-900 dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                            )}
                        </div>

                        {/* Sticker Toggle */}
                        <button onClick={() => {setShowStickers(!showStickers); setShowPlusMenu(false)}} className={`p-2 rounded-full ${showStickers ? 'bg-slate-200 dark:bg-white/10' : ''}`}>
                            <FaceSmileIcon className="w-7 h-7 text-slate-600 dark:text-slate-400" />
                        </button>

                        {/* Plus Menu Toggle */}
                        {inputText.trim() ? (
                            <button onClick={handleSend} className="bg-[#95ec69] text-white px-3 py-1.5 rounded-md text-sm font-bold">
                                {t('composer.post')}
                            </button>
                        ) : (
                            <button onClick={() => {setShowPlusMenu(!showPlusMenu); setShowStickers(false)}} className={`p-2 rounded-full ${showPlusMenu ? 'bg-slate-200 dark:bg-white/10' : ''}`}>
                                <PlusIcon className="w-7 h-7 text-slate-600 dark:text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Sticker Picker */}
                    {showStickers && (
                        <div className="h-48 overflow-y-auto mt-2 border-t border-slate-200 dark:border-white/10 pt-2 grid grid-cols-5 gap-2 animate-fade-in">
                             {/* Cat Series */}
                             {['😺','😸','😹','😻','😼','😽','🙀','😿','😾'].map(s => (
                                 <button key={s} onClick={() => sendSticker(s)} className="text-3xl hover:bg-slate-200 dark:hover:bg-white/10 rounded p-2">{s}</button>
                             ))}
                             {/* Dog Series */}
                             {['🐶','🐕','🦮','🐩','🐾','🦴','🐺','🦊'].map(s => (
                                 <button key={s} onClick={() => sendSticker(s)} className="text-3xl hover:bg-slate-200 dark:hover:bg-white/10 rounded p-2">{s}</button>
                             ))}
                        </div>
                    )}

                    {/* Plus Menu (WeChat Style) */}
                    {showPlusMenu && (
                        <div className="h-48 mt-2 border-t border-slate-200 dark:border-white/10 pt-4 grid grid-cols-4 gap-4 px-2 animate-fade-in">
                            <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => setShowTransferInput(true)}>
                                <div className="w-14 h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                    <BanknotesIcon className="w-8 h-8 text-orange-500" />
                                </div>
                                <span className="text-xs text-slate-500">{t('chat.transfer')}</span>
                            </div>

                            <label className="flex flex-col items-center space-y-1 cursor-pointer">
                                <div className="w-14 h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                    <PhotoIcon className="w-8 h-8 text-blue-500" />
                                </div>
                                <span className="text-xs text-slate-500">Image</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>

                            <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => sendInteractive('dice')}>
                                <div className="w-14 h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                    <DiceIcon className="w-8 h-8 text-red-500" />
                                </div>
                                <span className="text-xs text-slate-500">{t('chat.dice')}</span>
                            </div>

                            <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => sendInteractive('rps')}>
                                <div className="w-14 h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                    <HandRockIcon className="w-8 h-8 text-purple-500" />
                                </div>
                                <span className="text-xs text-slate-500">{t('chat.rps')}</span>
                            </div>

                            {/* Background Switcher */}
                            <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => {
                                const bgs = ['bg-[#f2f2f2] dark:bg-black', 'bg-blue-50 dark:bg-blue-950', 'bg-pink-50 dark:bg-pink-950', 'bg-slate-100 dark:bg-slate-900'];
                                const currentIdx = bgs.indexOf(chatBackground);
                                const nextBg = bgs[(currentIdx + 1) % bgs.length];
                                setChatBackground(nextBg);
                            }}>
                                <div className="w-14 h-14 bg-white dark:bg-[#1c1c1e] rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                    <PhotoIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <span className="text-xs text-slate-500">{t('chat.bg')}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatView;