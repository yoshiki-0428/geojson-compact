import { useState } from 'react';
import { Download, Copy, CheckCircle, TrendingDown, FileJson, Zap, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface CompressionResult {
  original: any;
  compressed: any;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
}

interface ModernResultsPanelProps {
  result: CompressionResult | null;
}

export function ModernResultsPanel({ result }: ModernResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <Card variant="default" className="text-center py-12">
          <FileJson className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Results Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload and compress a GeoJSON file to see results
          </p>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result.compressed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed.geojson';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result.compressed, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = [
    {
      label: 'Original Size',
      value: formatBytes(result.originalSize),
      icon: FileJson,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Compressed Size',
      value: formatBytes(result.compressedSize),
      icon: TrendingDown,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Compression Ratio',
      value: `${result.compressionRatio.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Processing Time',
      value: `${result.processingTime}ms`,
      icon: Zap,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Compression Complete!</h2>
        </div>
        <p className="opacity-90">
          Successfully reduced file size by {(100 - result.compressionRatio).toFixed(1)}%
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="default" padding="sm">
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', stat.bg)}>
                  <Icon className={cn('w-5 h-5', stat.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Compression Visualization */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Size Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(result.originalSize)}</span>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 w-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compressed</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(result.compressedSize)}</span>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500"
                  style={{ width: `${result.compressionRatio}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output Preview */}
      <Card variant="default">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Compressed Output</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy'}
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
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {JSON.stringify(result.compressed, null, 2).slice(0, 500)}
              {JSON.stringify(result.compressed, null, 2).length > 500 && '\n...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}