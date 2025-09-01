import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Copy, 
  CheckCircle, 
  FileJson,
  TrendingDown,
  FileText
} from 'lucide-react';
import { CompressionResult, formatBytes } from '@/utils/geojson-compressor';

interface ResultsPanelProps {
  result: CompressionResult | null;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result?.compressed) {
      try {
        await navigator.clipboard.writeText(result.compressed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleDownload = () => {
    if (result?.compressed) {
      const blob = new Blob([result.compressed], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed_${Date.now()}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          圧縮結果
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!result ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>GeoJSONを入力すると圧縮結果が表示されます</p>
          </div>
        ) : result.error ? (
          <div className="text-destructive">
            <p className="font-semibold">エラー:</p>
            <p>{result.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compression Statistics */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">元のサイズ</span>
                <Badge variant="secondary">{formatBytes(result.originalSize)}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">圧縮後サイズ</span>
                <Badge variant="default">{formatBytes(result.compressedSize)}</Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">圧縮率</span>
                  <Badge 
                    variant={result.compressionRatio > 30 ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    <TrendingDown className="h-3 w-3" />
                    {result.compressionRatio}%
                  </Badge>
                </div>
                <Progress value={result.compressionRatio} className="h-2" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="default"
                className="flex-1"
                disabled={!result.compressed}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    コピー
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
                disabled={!result.compressed}
              >
                <Download className="h-4 w-4 mr-2" />
                ダウンロード
              </Button>
            </div>

            {/* Compressed Output Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>圧縮済みGeoJSON（最初の500文字）</span>
              </div>
              <Textarea
                value={result.compressed.substring(0, 500) + (result.compressed.length > 500 ? '...' : '')}
                readOnly
                className="font-mono text-xs h-[150px]"
              />
            </div>

            {/* File Size Comparison */}
            <div className="bg-muted rounded-lg p-3">
              <div className="text-sm">
                <span className="font-semibold text-primary">
                  {formatBytes(result.originalSize - result.compressedSize)}
                </span>
                <span className="text-muted-foreground ml-1">
                  のファイルサイズを削減しました
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}