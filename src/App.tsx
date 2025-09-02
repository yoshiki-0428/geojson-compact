import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { GeoJSONInput } from '@/components/GeoJSONInput';
import { MapView } from '@/components/MapView';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { HeaderAdPlacement, FooterAdPlacement } from '@/components/AdPlacement';
import { compressGeoJSON, CompressionResult } from '@/utils/geojson-compressor';
import { getHistory, addToHistory, HistoryItem } from '@/utils/history-manager';
import { MapPin, Github, Twitter, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function App() {
  const [geojson, setGeojson] = useState<string>('');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'map' | 'result' | 'history'>('input');

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const updateHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  const handleGeoJSONChange = useCallback((input: string) => {
    setGeojson(input);
    
    // Clear previous timeout
    if (processingTimeout) {
      clearTimeout(processingTimeout);
    }
    
    // Debounce compression for 500ms
    const timeout = setTimeout(() => {
      if (input.trim()) {
        const result = compressGeoJSON(input);
        setCompressionResult(result);
        
        if (!result.error && result.compressionRatio > 0) {
          // Add to history
          addToHistory({
            name: `GeoJSON_${new Date().toLocaleDateString('ja-JP')}`,
            geojson: result.compressed,
            compressedSize: result.compressedSize,
            originalSize: result.originalSize,
            compressionRatio: result.compressionRatio
          });
          
          updateHistory();
          
          // Show success toast
          toast.success(`圧縮完了: ${result.compressionRatio}%削減`, {
            duration: 2000,
            position: 'bottom-right',
          });
        }
      } else {
        setCompressionResult(null);
      }
    }, 500);
    
    setProcessingTimeout(timeout);
  }, [processingTimeout, updateHistory]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setGeojson(item.geojson);
    const result = compressGeoJSON(item.geojson);
    setCompressionResult(result);
    
    toast.success('履歴から復元しました', {
      duration: 2000,
      position: 'bottom-right',
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">GeoCompact</h1>
                <p className="hidden sm:block text-sm text-muted-foreground">
                  GeoJSON圧縮&最適化ツール
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-background">
            <div className="container mx-auto px-3 py-2 flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4 mr-1" />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Header Ad - Hide on mobile */}
      <div className="hidden sm:block container mx-auto px-4 mt-4">
        <HeaderAdPlacement />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile Tab Navigation */}
        <div className="sm:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'input' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('input')}
            className="flex-shrink-0"
          >
            入力
          </Button>
          <Button
            variant={activeTab === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('map')}
            className="flex-shrink-0"
          >
            マップ
          </Button>
          <Button
            variant={activeTab === 'result' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('result')}
            className="flex-shrink-0"
          >
            結果
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="flex-shrink-0"
          >
            履歴
          </Button>
        </div>
        
        {/* Mobile Content */}
        <div className="sm:hidden">
          {activeTab === 'input' && (
            <GeoJSONInput onGeoJSONChange={handleGeoJSONChange} />
          )}
          {activeTab === 'map' && (
            <MapView geojson={geojson} />
          )}
          {activeTab === 'result' && (
            <ResultsPanel result={compressionResult} />
          )}
          {activeTab === 'history' && (
            <HistoryPanel 
              history={history}
              onHistorySelect={(item) => {
                handleHistorySelect(item);
                setActiveTab('result');
              }}
              onHistoryUpdate={updateHistory}
            />
          )}
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <GeoJSONInput onGeoJSONChange={handleGeoJSONChange} />
            <div className="block lg:hidden">
              <MapView geojson={geojson} />
            </div>
            <HistoryPanel 
              history={history}
              onHistorySelect={handleHistorySelect}
              onHistoryUpdate={updateHistory}
            />
          </div>
          
          {/* Right Column - Map & Results */}
          <div className="space-y-6">
            <div className="hidden lg:block">
              <MapView geojson={geojson} />
            </div>
            <ResultsPanel result={compressionResult} />
          </div>
        </div>

        {/* Features Section - Hide on mobile */}
        <div className="hidden sm:grid mt-12 grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">即座に圧縮</h3>
            <p className="text-sm text-muted-foreground">
              貼り付けと同時に自動圧縮。設定不要で最適な結果を提供
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">完全プライバシー</h3>
            <p className="text-sm text-muted-foreground">
              すべての処理はブラウザ内で完結。データは送信されません
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">リアルタイム表示</h3>
            <p className="text-sm text-muted-foreground">
              圧縮結果を即座にマップで確認。履歴機能で作業効率UP
            </p>
          </div>
        </div>
      </main>

      {/* Footer Ad - Hide on mobile */}
      <div className="hidden sm:block container mx-auto px-4 py-6">
        <FooterAdPlacement />
      </div>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © 2024 GeoCompact
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                GeoJSON圧縮ツール
              </p>
            </div>
            
            <div className="flex justify-center gap-3 text-xs sm:text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                使い方
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                プライバシー
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;