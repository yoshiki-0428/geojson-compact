import React, { useState, useCallback } from 'react';
import { Upload, FileJson, Loader2, CheckCircle, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SimpleGeoJSONInputProps {
  onGeoJSONLoad: (data: any) => void;
  onCompress: () => void;
  isCompressing: boolean;
}

export function SimpleGeoJSONInput({ onGeoJSONLoad, onCompress, isCompressing }: SimpleGeoJSONInputProps) {
  const [pasteContent, setPasteContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleClear = () => {
    setPasteContent('');
    setHasData(false);
  };

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onGeoJSONLoad(data);
        setHasData(true);
        setPasteContent(JSON.stringify(data, null, 2));
      } catch (err) {
        alert('Invalid JSON format');
      }
    };
    reader.readAsText(file);
  }, [onGeoJSONLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handlePaste = () => {
    try {
      const data = JSON.parse(pasteContent);
      onGeoJSONLoad(data);
      setHasData(true);
    } catch (err) {
      alert('Invalid JSON format');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Card variant="default" className="w-full">
      <CardContent className="p-4">
        {/* File Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 mb-4 transition-all',
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          <div className="text-center">
            <FileJson className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop GeoJSON file here
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json,.geojson"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" icon={<Upload className="w-4 h-4" />}>
                Browse Files
              </Button>
            </label>
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2">
          <textarea
            value={pasteContent}
            onChange={(e) => {
              setPasteContent(e.target.value);
              setHasData(false);
            }}
            placeholder="Or paste GeoJSON here..."
            className={cn(
              'w-full h-32 p-3 rounded-lg border resize-none font-mono text-sm',
              'bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-purple-500 dark:focus:border-purple-400',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/20'
            )}
          />

          {/* Action Buttons - Always show both */}
          <div className="flex gap-2">
            <Button
              onClick={handlePaste}
              variant={hasData ? "outline" : "outline"}
              className={cn("flex-1", hasData && "bg-green-50 dark:bg-green-900/20 border-green-500")}
              disabled={!pasteContent || hasData}
              icon={hasData ? <CheckCircle className="w-4 h-4 text-green-600" /> : undefined}
            >
              {hasData ? 'Loaded' : 'Load JSON'}
            </Button>
            <Button
              onClick={onCompress}
              variant="primary"
              disabled={!hasData || isCompressing}
              className="flex-1"
              icon={isCompressing ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isCompressing ? 'Compressing...' : 'Compress'}
            </Button>
            {hasData && (
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4" />}
                title="Clear and load new JSON"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}