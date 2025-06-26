import React, { useState, useEffect } from 'react';
import { Search, Type, Grid, List, Sliders, Globe, Palette } from 'lucide-react';
import axios from 'axios';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/ThemeToggle';
import { FontCard } from './components/FontCard';

type LanguageKey = 'en' | 'np' | 'ko';
type ViewMode = 'grid' | 'list';

interface Font {
  id: string;
  name: string;
  url: string;
  category?: string;
  variants?: string[];
}

interface FontResponse {
  fonts: Font[];
  currentPage: number;
  totalPages: number;
  totalFonts: number;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const [fonts, setFonts] = useState<Font[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<Font[]>([]);
  const [previewText, setPreviewText] = useState('Type something');
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState('#1f2937');
  const [language, setLanguage] = useState<LanguageKey>('en');
  const [fontSize, setFontSize] = useState(40);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFonts, setTotalFonts] = useState(0);
  const limit = 6; // Changed to 6 fonts per page

  const languages = {
    en: 'Everyone has the right to freedom of thought, conscience',
    np: 'सबै मानिसले विचार, विवेकको स्वतन्त्रता पाउने अधिकार राख्छन्',
    ko: '모든 사람은 사상과 양심의 자유를 가질 권리가 있습니다',
  };

  // Update color based on theme
  useEffect(() => {
    setColor(theme === 'dark' ? '#ffffff' : '#1f2937');
  }, [theme]);

  const loadFont = async (font: Font) => {
    if (loadedFonts.has(font.id)) return;
    try {
      const fontFace = new FontFace(font.id, `url(${font.url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      setLoadedFonts(prev => new Set([...prev, font.id]));
    } catch (error) {
      console.error(`Failed to load font ${font.name}:`, error);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get<FontResponse>('http://localhost:3000/api/fonts', {
      params: { page: currentPage, limit }
    })
      .then(res => {
        const { fonts, currentPage: page, totalPages, totalFonts } = res.data;
        const fontsWithCategories = fonts.map((font: Font) => ({
          ...font,
          category: font.category || 'sans-serif',
          variants: font.variants || ['regular']
        }));
        setFonts(fontsWithCategories);
        setFilteredFonts(fontsWithCategories);
        setCurrentPage(page);
        setTotalPages(totalPages);
        setTotalFonts(totalFonts);
        fontsWithCategories.forEach(loadFont);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching fonts:', err);
        setLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    setPreviewText(customText.trim() ? customText : languages[language]);
  }, [language, customText]);

  useEffect(() => {
    let filtered = fonts;
    if (searchQuery) {
      filtered = filtered.filter(font => font.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(font => font.category === selectedCategory);
    }
    setFilteredFonts(filtered);
  }, [fonts, searchQuery, selectedCategory]);

  const categories = ['all', 'serif', 'sans-serif', 'display', 'handwriting', 'monospace'];

  const handleDownload = (font: Font) => {
    const link = document.createElement('a');
    link.href = font.url;
    link.download = `${font.name}.woff2`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading fonts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex transition-colors">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Type className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fontica
              </h1>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <nav className="space-y-2 mb-8">
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
              <Type className="w-4 h-4" />
              <span className="font-medium">Fonts</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 
                            hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 
                            rounded-lg cursor-pointer transition-colors">
              <Globe className="w-4 h-4" />
              <span>Preview</span>
            </div>
          </nav>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview text
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type something to preview..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                         rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 
                         dark:placeholder-gray-400 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-700 
                         dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Filters
              </span>
              <div className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>

            {showFilters && (
              <div className="space-y-3 pl-6 animate-in slide-in-from-top-1 duration-200">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as LanguageKey)}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="en">English</option>
                    <option value="np">नेपाली (Nepali)</option>
                    <option value="ko">한국어 (Korean)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                               text-gray-900 dark:text-white transition-colors"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                {filteredFonts.length} of {totalFonts} families
              </span>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {filteredFonts.length === 0 ? (
            <div className="text-center py-12">
              <Type className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No fonts found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {filteredFonts.map(font => (
                  <FontCard
                    key={font.id}
                    font={font}
                    previewText={previewText}
                    fontSize={fontSize}
                    color={color}
                    loadedFonts={loadedFonts}
                    onDownload={handleDownload}
                    viewMode={viewMode}
                  />
                ))}
              </div>
              {/* Pagination Controls at Bottom */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;