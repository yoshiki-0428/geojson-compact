import { useState, useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { ModernGeoJSONInput } from './components/ModernGeoJSONInput';
import { ModernResultsPanel } from './components/ModernResultsPanel';
import { ModernHistoryPanel } from './components/ModernHistoryPanel';
import { ModernSettingsPanel } from './components/ModernSettingsPanel';
import { ModernMapView } from './components/ModernMapView';
import { compressGeoJSON } from './utils/compression';
import { Toaster, toast } from 'react-hot-toast';

interface CompressionResult {
  original: any;
  compressed: any;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
}

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  data: CompressionResult;
}

function App() {
  const [activeView, setActiveView] = useState<'input' | 'history' | 'settings'>('input');
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showMap, setShowMap] = useState(false);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('geoJsonHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Failed to load history from localStorage:', error);
      }
    }
  }, []);

  const handleGeoJSONLoad = (data: any) => {
    setGeoJsonData(data);
    toast.success('GeoJSON loaded successfully');
  };

  const handleCompress = async () => {
    if (!geoJsonData) {
      toast.error('Please load a GeoJSON file first');
      return;
    }

    setIsCompressing(true);
    const startTime = performance.now();
    
    try {
      const compressed = await compressGeoJSON(geoJsonData);
      const endTime = performance.now();
      
      const originalStr = JSON.stringify(geoJsonData);
      const compressedStr = JSON.stringify(compressed);
      const originalSize = new Blob([originalStr]).size;
      const compressedSize = new Blob([compressedStr]).size;
      const compressionRatio = (compressedSize / originalSize) * 100;
      
      const result: CompressionResult = {
        original: geoJsonData,
        compressed,
        originalSize,
        compressedSize,
        compressionRatio,
        processingTime: Math.round(endTime - startTime),
      };
      
      setCompressionResult(result);
      
      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        name: `Compression ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        originalSize,
        compressedSize,
        compressionRatio,
        data: result,
      };
      
      setHistory(prev => [historyItem, ...prev].slice(0, 10)); // Keep last 10 items

      // Save to localStorage
      const updatedHistory = [historyItem, ...history].slice(0, 10);
      localStorage.setItem('geoJsonHistory', JSON.stringify(updatedHistory));
      
      toast.success(`Compressed by ${(100 - compressionRatio).toFixed(1)}%!`);
    } catch (error) {
      toast.error('Compression failed');
      console.error(error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCompressionResult(item.data);
    setGeoJsonData(item.data.original);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'input':
        return (
          <div className="space-y-6">
            <ModernGeoJSONInput
              onGeoJSONLoad={handleGeoJSONLoad}
              onCompress={handleCompress}
              isCompressing={isCompressing}
            />
            {compressionResult && (
              <ModernResultsPanel result={compressionResult} />
            )}
          </div>
        );
      case 'history':
        return <ModernHistoryPanel history={history} onSelect={handleHistorySelect} />;
      case 'settings':
        return <ModernSettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppLayout activeView={activeView} onViewChange={setActiveView}>
        <div className="relative">
          {renderContent()}
          
          {/* Floating Map Toggle for when compression result is available */}
          {compressionResult && (
            <button
              onClick={() => setShowMap(!showMap)}
              className="fixed bottom-6 right-6 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-30"
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          )}
        </div>
      </AppLayout>

      {/* Map Overlay */}
      {showMap && compressionResult && (
        <ModernMapView
          geoJsonData={compressionResult.compressed}
          onClose={() => setShowMap(false)}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;