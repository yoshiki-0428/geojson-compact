import React, { useState, useCallback } from 'react';
import { Upload, FileJson, Link, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ModernGeoJSONInputProps {
  onGeoJSONLoad: (data: any) => void;
  onCompress: () => void;
  isCompressing: boolean;
}

export function ModernGeoJSONInput({ onGeoJSONLoad, onCompress, isCompressing }: ModernGeoJSONInputProps) {
  const [inputMethod, setInputMethod] = useState<'upload' | 'url' | 'paste'>('upload');
  const [url, setUrl] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onGeoJSONLoad(data);
        setSuccess(`Successfully loaded ${file.name}`);
        setError(null);
      } catch (err) {
        setError('Invalid JSON format');
        setSuccess(null);
      }
    };
    reader.readAsText(file);
  }, [onGeoJSONLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFile(file);
    }
  }, [handleFile]);

  const handleUrlLoad = async () => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      onGeoJSONLoad(data);
      setSuccess('Successfully loaded from URL');
      setError(null);
    } catch (err) {
      setError('Failed to load from URL');
      setSuccess(null);
    }
  };

  const handlePaste = () => {
    try {
      const data = JSON.parse(pasteContent);
      onGeoJSONLoad(data);
      setSuccess('Successfully parsed GeoJSON');
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
      setSuccess(null);
    }
  };

  const inputMethods = [
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'url', label: 'From URL', icon: Link },
    { id: 'paste', label: 'Paste JSON', icon: Code },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card variant="gradient" className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-400 dark:to-purple-500 bg-clip-text text-transparent">
            GeoJSON Compressor
          </CardTitle>
          <CardDescription className="text-base">
            Reduce your GeoJSON file size while preserving precision
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Input Method Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {inputMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setInputMethod(method.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    inputMethod === method.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Upload Method */}
          {inputMethod === 'upload' && (
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all',
                isDragging
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <FileJson className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Drop your GeoJSON file here
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".json,.geojson"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="primary" size="lg" icon={<Upload className="w-4 h-4" />}>
                  Choose File
                </Button>
              </label>
            </div>
          )}

          {/* URL Method */}
          {inputMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GeoJSON URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/data.geojson"
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <Button
                    onClick={handleUrlLoad}
                    variant="primary"
                    icon={<Link className="w-4 h-4" />}
                  >
                    Load
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Paste Method */}
          {inputMethod === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste GeoJSON
                </label>
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder='{"type": "FeatureCollection", "features": [...]}'
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              <Button
                onClick={handlePaste}
                variant="primary"
                size="lg"
                fullWidth
                icon={<Code className="w-4 h-4" />}
              >
                Parse JSON
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-200">Success</p>
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            </div>
          )}

          {/* Compress Button */}
          {success && (
            <div className="mt-6">
              <Button
                onClick={onCompress}
                variant="primary"
                size="xl"
                fullWidth
                loading={isCompressing}
                className="shadow-lg"
              >
                {isCompressing ? 'Compressing...' : 'Compress GeoJSON'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}