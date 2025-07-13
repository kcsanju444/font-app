import React, { useState, useRef, useEffect } from 'react';
import { Download, AlertTriangle, Code } from 'lucide-react';

interface Font {
  id: string;
  name: string;
  url: string;
  category?: string;
  variants?: string[];
}

interface FontCardProps {
  font: Font;
  previewText: string;
  fontSize: number;
  color: string;
  loadedFonts: Set<string>;
  onDownload: (font: Font) => void;
  viewMode: 'grid' | 'list';
  direction?: 'ltr' | 'rtl'; // ✅ Added direction support
}

const doesFontSupportText = (fontName: string, text: string): boolean => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return false;

  context.font = `16px ${fontName}, sans-serif`;
  const widthWithFont = context.measureText(text).width;

  context.font = `16px sans-serif`;
  const widthWithFallback = context.measureText(text).width;

  return widthWithFont !== widthWithFallback;
};

export const FontCard: React.FC<FontCardProps> = ({
  font,
  previewText,
  fontSize,
  color,
  loadedFonts,
  onDownload,
  viewMode,
  direction = 'ltr' // ✅ Default to 'ltr' if not provided
}) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const [copied, setCopied] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  const isLoaded = loadedFonts.has(font.id);
  const isSupported = isLoaded && doesFontSupportText(font.id, previewText);

  const format = font.url.endsWith('.woff2') ? 'woff2' : 'truetype';

  const embedCode = `@font-face {
  font-family: '${font.name}';
  src: url('${font.url}') format('${format}');
  font-weight: normal;
  font-style: normal;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (embedRef.current && !embedRef.current.contains(event.target as Node)) {
        setShowEmbed(false);
      }
    };
    if (showEmbed) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmbed]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700
                    hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200
                    hover:shadow-lg dark:hover:shadow-xl group relative`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1
                         group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {font.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {font.category || 'sans-serif'} • {font.variants?.length || 1} style{(font.variants?.length || 1) !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => onDownload(font)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200
                       hover:scale-105 active:scale-95"
            title="Download font"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowEmbed(prev => !prev)}
            className={`p-2 rounded-lg transition-all duration-200
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
            title="Show embed code"
            aria-label="Show embed code"
          >
            <Code className="w-5 h-5" />
          </button>

          {showEmbed && (
            <div
              ref={embedRef}
              className="absolute right-0 overflow-x-auto top-full mt-2 w-72 bg-gray-100 dark:bg-gray-900 rounded-md shadow-lg
                         p-3 text-xs font-mono whitespace-pre-wrap break-words z-50 border border-gray-300 dark:border-gray-700"
            >
              <pre>{embedCode}</pre>
              <button
                onClick={handleCopy}
                className={`mt-2 w-full py-1 rounded text-white text-center
                           ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                aria-label="Copy embed code"
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-[80px] flex items-start justify-center">
        {!isLoaded ? (
          <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Loading font...</span>
          </div>
        ) : isSupported ? (
          <div
            className="text-start leading-relaxed break-words w-full"
            style={{
              fontFamily: font.id,
              color: color,
              fontSize: `${Math.min(fontSize, viewMode === 'grid' ? 36 : 48)}px`,
              direction: direction, // ✅ Use direction prop here
              textAlign: direction === 'rtl' ? 'right' : 'left' // ✅ Optional: improves readability
            }}
          >
            {previewText}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-center">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Font family "{font.name}" does not support the selected text or language
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
