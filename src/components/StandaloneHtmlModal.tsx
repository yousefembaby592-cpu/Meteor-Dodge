import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { generateStandaloneHtml } from '../utils/standaloneHtml';
import { soundManager } from '../utils/audio';

interface StandaloneHtmlModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export const StandaloneHtmlModal: React.FC<StandaloneHtmlModalProps> = ({
  isOpen,
  lang,
  onClose
}) => {
  const t = getTranslation(lang);
  const [copied, setCopied] = useState(false);
  const htmlCode = generateStandaloneHtml();

  if (!isOpen) return null;

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    soundManager.playClick();
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meteor-dodge.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        id="standalone-code-modal"
        className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {t.downloadHtml}
              </h3>
              <p className="text-xs text-slate-400">
                {t.downloadDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Preview area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/90 font-mono text-xs text-purple-200 border-b border-slate-800 dir-ltr text-left">
          <pre className="whitespace-pre-wrap select-all">
            {htmlCode.slice(0, 1500)}
            {'\n... [باقي الكود البرمجي الكامل موجود بالملف] ...'}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>HTML5 + CSS3 + JS Canvas + Web Audio API</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.htmlCopied : t.copyHtml}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadHtml}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
