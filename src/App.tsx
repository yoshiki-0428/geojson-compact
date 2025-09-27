import { useState, useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { SimpleGeoJSONInput } from './components/SimpleGeoJSONInput';
import { SimpleResultsPanel } from './components/SimpleResultsPanel';
import { ModernHistoryPanel } from './components/ModernHistoryPanel';
import { ModernSettingsPanel } from './components/ModernSettingsPanel';
import { InlineMapView } from './components/InlineMapView';
import { compressGeoJSON } from './utils/compression';
import { generateAutoName } from './utils/geocoding';
import { calculateSize } from './utils/advanced-compression';
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
  locationName?: string;
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

      // Use calculateSize for accurate minified JSON size
      const originalSize = calculateSize(geoJsonData);
      const compressedSize = calculateSize(compressed);
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

      // Generate auto name with location info
      let autoName = `Compression ${new Date().toLocaleTimeString()}`;
      try {
        autoName = await generateAutoName(geoJsonData);
      } catch (error) {
        console.warn('Failed to generate auto name:', error);
      }

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        name: autoName,
        locationName: autoName,
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
    setActiveView('input'); // Switch to input view to show the results
    toast.success('History item loaded');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'input':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full p-4">
            <div className="flex flex-col gap-4">
              <SimpleGeoJSONInput
                onGeoJSONLoad={handleGeoJSONLoad}
                onCompress={handleCompress}
                isCompressing={isCompressing}
              />
              {compressionResult && (
                <SimpleResultsPanel result={compressionResult} />
              )}
            </div>
            <div className="h-[400px] lg:h-full">
              <InlineMapView geoJsonData={geoJsonData} />
            </div>
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
        <div className="h-full">
          {renderContent()}
        </div>
      </AppLayout>

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