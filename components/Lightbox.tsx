
import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { XIcon, DownloadIcon, LockIcon } from './Icons';

interface LightboxProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  allowDownload: boolean;
  watermark: boolean;
  onClose: () => void;
  authorHandle: string;
}

const Lightbox: React.FC<LightboxProps> = ({ mediaUrl, mediaType, allowDownload, watermark, onClose, authorHandle }) => {
  const { addNotification } = useApp();
  const { t } = useLanguage();

  const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (!allowDownload) {
          addNotification(t('media.download_denied'), 'error');
          return;
      }

      // Simulate download process
      if (watermark) {
          addNotification(`${t('media.saved_watermark')} @${authorHandle}`, 'success');
      } else {
          addNotification(t('media.saved'), 'success');
      }
      
      // In a real app, we would trigger a blob download here
      // For demo, we just show the success toast
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-fade-in" onClick={onClose}>
        
        {/* Toolbar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 safe-pt">
            <button onClick={onClose} className="p-2 bg-black/30 rounded-full text-white/80 hover:text-white hover:bg-black/50 transition-colors">
                <XIcon className="w-6 h-6" />
            </button>

            {allowDownload ? (
                <button 
                    onClick={handleDownload} 
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span className="text-xs font-bold">{t('media.download')}</span>
                </button>
            ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full text-red-200 backdrop-blur-sm">
                    <LockIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">{t('media.download_denied')}</span>
                </div>
            )}
        </div>

        {/* Media Content */}
        <div className="w-full h-full flex items-center justify-center p-4">
            {mediaType === 'video' ? (
                <video 
                    src={mediaUrl} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()} 
                />
            ) : (
                <img 
                    src={mediaUrl} 
                    alt="Full View" 
                    className="max-w-full max-h-full object-contain transition-transform"
                    onClick={(e) => e.stopPropagation()} 
                />
            )}
        </div>

    </div>
  );
};

export default Lightbox;
