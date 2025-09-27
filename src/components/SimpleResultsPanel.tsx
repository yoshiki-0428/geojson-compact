import { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { trackDownload } from '../utils/analytics';

interface CompressionResult {
  original: any;
  compressed: any;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
}

interface SimpleResultsPanelProps {
  result: CompressionResult | null;
}

export function SimpleResultsPanel({ result }: SimpleResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result.compressed)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed.geojson';
    a.click();
    URL.revokeObjectURL(url);

    // Track download event
    trackDownload(result.compressedSize);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result.compressed));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const savedPercentage = (100 - result.compressionRatio).toFixed(1);

  return (
    <Card variant="default" className="w-full">
      <CardContent className="p-4">
        {/* Compression Success */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-900 dark:text-white">
              Compressed {savedPercentage}%
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Size Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Original:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {formatBytes(result.originalSize)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Compressed:</span>
            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
              {formatBytes(result.compressedSize)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${result.compressionRatio}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}