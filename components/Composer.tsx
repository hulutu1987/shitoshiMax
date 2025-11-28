

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { analyzeContent, transcribeAudio, analyzeImage, searchMap } from '../services/geminiService';
import { ShieldAlertIcon, ImageIcon, VideoIcon, XCircleIcon, CameraIcon, LockIcon, DownloadIcon, MicrophoneIcon, MagicWandIcon, MapPinIcon, StopIcon, GlobeIcon } from './Icons';
import { MediaType } from '../types';

const ComposeView = () => {
  const { currentUser, addPost, addNotification, navigateTo, trendingTopics } = useApp();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{file: File | null, url: string, type: MediaType}>({ file: null, url: '', type: 'text' });
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  
  // Post Settings
  const [allowDownload, setAllowDownload] = useState(true);
  const [addWatermark, setAddWatermark] = useState(true);
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');

  // Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cost Logic
  const charLimit = 300;
  const charCount = content.length;
  const extraCharCost = Math.max(0, charCount - charLimit);
  const mediaCost = selectedMedia.type === 'video' ? 10 : 3;
  const totalCost = mediaCost + extraCharCost;
  const canAfford = currentUser.points >= totalCost;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');

      if (!isVideo && !isImage) {
          addNotification("Only images and videos are supported.", "error");
          return;
      }

      const url = URL.createObjectURL(file);
      setSelectedMedia({
          file,
          url,
          type: isVideo ? 'video' : 'image'
      });
  };

  const clearMedia = () => {
      setSelectedMedia({ file: null, url: '', type: 'text' });
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- AI Features ---

  const handleTranscribeAudio = async () => {
      if (isRecording) {
          // Stop recording
          mediaRecorderRef.current?.stop();
          setIsRecording(false);
      } else {
          // Start recording
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const mediaRecorder = new MediaRecorder(stream);
              mediaRecorderRef.current = mediaRecorder;
              audioChunksRef.current = [];

              mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                      audioChunksRef.current.push(event.data);
                  }
              };

              mediaRecorder.onstop = async () => {
                  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                  const reader = new FileReader();
                  reader.readAsDataURL(audioBlob);
                  reader.onloadend = async () => {
                      const base64Audio = (reader.result as string).split(',')[1];
                      setIsAnalyzing(true);
                      try {
                          const text = await transcribeAudio(base64Audio, 'audio/webm');
                          setContent(prev => (prev ? prev + ' ' + text : text));
                          addNotification("Audio transcribed!", "success");
                      } catch (e) {
                          addNotification("Transcription failed.", "error");
                      } finally {
                          setIsAnalyzing(false);
                          // Stop all tracks
                          stream.getTracks().forEach(track => track.stop());
                      }
                  };
              };

              mediaRecorder.start();
              setIsRecording(true);
          } catch (e) {
              addNotification("Microphone access denied or error.", "error");
          }
      }
  };

  const handleAnalyzeImage = async () => {
      if (!selectedMedia.file || selectedMedia.type !== 'image') return;
      
      setIsAnalyzing(true);
      try {
          const reader = new FileReader();
          reader.readAsDataURL(selectedMedia.file);
          reader.onloadend = async () => {
              const base64Image = (reader.result as string).split(',')[1];
              const description = await analyzeImage(base64Image, selectedMedia.file!.type);
              setContent(prev => (prev ? prev + '\n\n' + description : description));
              addNotification("Image analyzed!", "success");
              setIsAnalyzing(false);
          };
      } catch (e) {
          addNotification("Image analysis failed.", "error");
          setIsAnalyzing(false);
      }
  };

  const handleMapSearch = async () => {
      const query = prompt("What place are you looking for?");
      if (!query) return;

      setIsAnalyzing(true);
      try {
          const result = await searchMap(query, currentUser.location);
          setContent(prev => (prev ? prev + '\n\n' + result : result));
          addNotification("Map data added!", "success");
      } catch (e) {
          addNotification("Map search failed.", "error");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !selectedMedia.url)) return;
    if (!canAfford) {
        addNotification(`Insufficient Reputation. Need ${totalCost} pts.`, "error");
        return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeContent(content || "Media Post"); 
      addPost(
          content, 
          analysis, 
          selectedMedia.url ? { type: selectedMedia.type, url: selectedMedia.url } : undefined, 
          selectedTopic,
          { allowDownload, watermark: addWatermark, visibility }
      );
      
      if (analysis.isSafe) {
        setContent('');
        clearMedia();
        setSelectedTopic(undefined);
        navigateTo('moments');
      }
    } catch (err) {
      addNotification("Content check failed.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-black z-50 flex flex-col transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-[#1c1c1e] px-4 py-3 flex justify-between items-center border-b border-slate-200 dark:border-white/10 shadow-sm">
        <button 
          onClick={() => navigateTo('moments')} 
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm"
        >
          {t('composer.cancel')}
        </button>
        <h2 className="font-bold text-slate-800 dark:text-slate-100">{t('composer.title')}</h2>
        <div className="flex items-center space-x-2">
            <div className="text-right">
                <span className={`block text-xs font-bold ${canAfford ? 'text-slate-500 dark:text-slate-400' : 'text-red-500'}`}>
                    -{totalCost} pts
                </span>
            </div>
            <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !selectedMedia.url) || isAnalyzing || !canAfford}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all
                ${(!content.trim() && !selectedMedia.url) || isAnalyzing || !canAfford
                ? 'bg-slate-100 dark:bg-[#3a3a3c] text-slate-300 dark:text-slate-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
            {isAnalyzing ? (
                <span className="animate-pulse">{t('composer.analyzing')}</span>
            ) : (
                t('composer.post')
            )}
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex space-x-4 items-start">
            <img 
                src={currentUser.avatar} 
                alt="User" 
                className="w-12 h-12 rounded-lg object-cover shadow-sm border border-slate-100 dark:border-slate-700" 
            />
            <div className="flex-1 space-y-4">
                 <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={isRecording ? "Listening..." : t('composer.placeholder')}
                    disabled={isAnalyzing || isRecording}
                    className="w-full min-h-[120px] text-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-none outline-none resize-none leading-relaxed"
                    autoFocus
                  />
                  
                  {/* Character Counter */}
                  <div className="flex justify-end">
                      <span className={`text-xs font-bold ${charCount > charLimit ? 'text-red-500' : 'text-slate-400'}`}>
                          {charCount} / {charLimit} 
                          {charCount > charLimit && ` (${t('composer.over_limit_cost')}: -${extraCharCost})`}
                      </span>
                  </div>

                  {/* Media Preview */}
                  {selectedMedia.url && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 max-w-xs">
                          <button 
                            onClick={clearMedia}
                            className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 z-10"
                          >
                              <XCircleIcon className="w-5 h-5" />
                          </button>
                          
                          {/* AI Analyze Button for Images */}
                          {selectedMedia.type === 'image' && (
                              <button 
                                onClick={handleAnalyzeImage}
                                className="absolute bottom-2 right-2 flex items-center space-x-1 bg-white/20 backdrop-blur-md border border-white/50 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 z-10"
                              >
                                  <MagicWandIcon className="w-4 h-4" />
                                  <span>Analyze</span>
                              </button>
                          )}

                          {selectedMedia.type === 'video' ? (
                              <video src={selectedMedia.url} className="w-full h-auto" controls />
                          ) : (
                              <img src={selectedMedia.url} alt="Preview" className="w-full h-auto" />
                          )}
                      </div>
                  )}

                  {/* Visibility Settings */}
                  <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#1c1c1e] p-2 rounded-lg w-fit">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold px-1">{t('composer.visibility')}:</span>
                        <div className="flex bg-white dark:bg-[#2c2c2e] rounded p-0.5">
                            <button 
                                onClick={() => setVisibility('public')}
                                className={`px-3 py-1 text-xs rounded transition-colors flex items-center ${visibility === 'public' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                <GlobeIcon className="w-3 h-3 mr-1" />
                                {t('composer.public')}
                            </button>
                            <button 
                                onClick={() => setVisibility('friends')}
                                className={`px-3 py-1 text-xs rounded transition-colors flex items-center ${visibility === 'friends' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                            >
                                <LockIcon className="w-3 h-3 mr-1" />
                                {t('composer.friends')}
                            </button>
                        </div>
                  </div>

                  {/* Media Settings (If media present) */}
                  {selectedMedia.url && (
                      <div className="flex space-x-4 text-sm">
                          <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400">
                              <input 
                                type="checkbox" 
                                checked={allowDownload} 
                                onChange={(e) => setAllowDownload(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 dark:bg-[#2c2c2e] dark:border-slate-600" 
                              />
                              <span>{t('composer.allow_download')}</span>
                          </label>

                          <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400">
                              <input 
                                type="checkbox" 
                                checked={addWatermark} 
                                onChange={(e) => setAddWatermark(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 dark:bg-[#2c2c2e] dark:border-slate-600" 
                              />
                              <span>{t('composer.add_watermark')}</span>
                          </label>
                      </div>
                  )}

                  {/* Topic Selection List */}
                  <div className="pt-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">{t('composer.select_topic')}</p>
                      <div className="flex flex-wrap gap-2">
                          {trendingTopics.slice(0, 10).map(topic => (
                              <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(selectedTopic === topic.id ? undefined : topic.id)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                                    ${selectedTopic === topic.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold' 
                                        : 'bg-white dark:bg-[#1c1c1e] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                              >
                                  {topic.tag}
                                  {selectedTopic === topic.id && <span className="ml-1">✓</span>}
                              </button>
                          ))}
                      </div>
                  </div>
            </div>
        </div>
      </div>
      
      {/* Footer Actions & Status */}
      <div className="bg-white dark:bg-[#1c1c1e] border-t border-slate-100 dark:border-white/10 safe-pb">
        {/* Toolbar */}
        <div className="px-4 py-3 flex items-center space-x-6 overflow-x-auto no-scrollbar">
             
             {/* Camera (Direct Mobile) */}
             <label className="cursor-pointer flex items-center space-x-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                <CameraIcon className="w-6 h-6" />
                <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    className="hidden" 
                    onChange={handleFileSelect}
                />
             </label>

             {/* Gallery Image */}
             <label className="cursor-pointer flex items-center space-x-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                <ImageIcon className="w-6 h-6" />
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
             </label>

             {/* Video */}
             <label className="cursor-pointer flex items-center space-x-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                <VideoIcon className="w-6 h-6" />
                <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
             </label>

             <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />

             {/* AI Dictation */}
             <button 
                onClick={handleTranscribeAudio}
                className={`flex items-center space-x-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'}`}
             >
                {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
             </button>

             {/* Maps Grounding */}
             <button 
                onClick={handleMapSearch}
                className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
             >
                <MapPinIcon className="w-6 h-6" />
             </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-black text-center text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
                <ShieldAlertIcon className="w-3 h-3" />
                <span>{t('composer.moderation')}</span>
            </div>
            {isRecording && <span className="text-red-500 font-bold">Recording...</span>}
        </div>
      </div>
    </div>
  );
};

export default ComposeView;