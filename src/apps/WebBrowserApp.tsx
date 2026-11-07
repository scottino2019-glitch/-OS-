import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import {
  RotateCw,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  Globe
} from 'lucide-react';

interface WebBrowserAppProps {
  initialUrl?: string;
  appName?: string;
}

export const WebBrowserApp: React.FC<WebBrowserAppProps> = ({
  initialUrl = 'https://zh.m.wikipedia.org/',
  appName = '网页应用'
}) => {
  const { closeApp, showToast } = usePhone();

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [iframeKey, setIframeKey] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setCurrentUrl(url);
    setInputUrl(url);
    setIsLoading(true);
    setIframeKey(k => k + 1);
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(k => k + 1);
  };

  const handleOpenExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
    showToast('已在新标签页中打开');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 select-text">
      {/* Browser Navigation Bar */}
      <div className="px-2.5 py-1.5 bg-white border-b border-slate-200 flex items-center gap-1.5 shadow-2xs">

        {/* Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200 min-w-0">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mr-2" />
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-mono font-medium truncate"
            placeholder="输入网址 https://..."
          />
        </form>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleReload}
            title="刷新"
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCw size={16} className={isLoading ? 'animate-spin text-amber-500' : ''} />
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="在新标签页中打开 (Apri in scheda esterna)"
            className="p-2 text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Frame Loading status bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 animate-pulse w-full" />
        </div>
      )}

      {/* Webview IFrame */}
      <div className="flex-1 relative bg-white">
        <iframe
          key={iframeKey}
          src={currentUrl}
          title={appName}
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
          className="w-full h-full border-none bg-white"
        />

        {/* Fallback helper tip at bottom if site blocks iframe */}
       <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-1.5 py-0.5 flex items-center justify-between text-xs text-slate-700 shadow-md">
  <div className="flex items-center gap-1.5 truncate">
    <Globe size={8} className="text-indigo-600 shrink-0" />
    <span className="truncate">{appName} ·</span>
  </div>
  <button
    onClick={handleOpenExternal}
    className="text-indigo-600 font-bold hover:underline shrink-0 ml-2 text-[11px]"
  >
    Apri fuori
  </button>
</div>


      </div>
    </div>
  );
};
