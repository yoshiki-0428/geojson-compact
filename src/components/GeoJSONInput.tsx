import React, { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import { validateGeoJSON } from '@/utils/geojson-compressor';

interface GeoJSONInputProps {
  onGeoJSONChange: (geojson: string) => void;
  error?: string;
}

export function GeoJSONInput({ onGeoJSONChange, error }: GeoJSONInputProps) {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string>('');

  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (value.trim()) {
      const validation = validateGeoJSON(value);
      if (validation.valid) {
        setValidationError('');
        onGeoJSONChange(value);
      } else {
        setValidationError(validation.error || 'Invalid GeoJSON');
      }
    } else {
      setValidationError('');
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleInputChange(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json' || file.name.endsWith('.geojson')) {
      handleFileRead(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const loadSampleData = () => {
    const sample = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "name": "Tokyo Tower",
            "height": 333,
            "year": 1958
          },
          "geometry": {
            "type": "Point",
            "coordinates": [139.745433, 35.658581]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "name": "Tokyo Skytree",
            "height": 634,
            "year": 2012
          },
          "geometry": {
            "type": "Point",
            "coordinates": [139.810700, 35.710063]
          }
        }
      ]
    };
    
    const sampleJson = JSON.stringify(sample, null, 2);
    handleInputChange(sampleJson);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileJson className="h-4 w-4 sm:h-5 sm:w-5" />
            GeoJSON入力
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">サンプル読込</span>
              <span className="sm:hidden">サンプル</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs sm:text-sm"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">ファイル選択</span>
              <span className="sm:hidden">ファイル</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`relative ${isDragging ? 'ring-2 ring-primary' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Textarea
            placeholder="GeoJSONを貼り付けるか、ファイルをドラッグ&ドロップしてください..."
            className="min-h-[300px] sm:min-h-[400px] font-mono text-xs sm:text-sm"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none rounded-md">
              <div className="text-primary font-semibold">
                ファイルをドロップ
              </div>
            </div>
          )}
        </div>
        
        {(validationError || error) && (
          <div className="mt-2 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{validationError || error}</span>
          </div>
        )}
        
        {input && !validationError && !error && (
          <Badge variant="secondary" className="mt-2">
            有効なGeoJSON
          </Badge>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.geojson"
          className="hidden"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
}