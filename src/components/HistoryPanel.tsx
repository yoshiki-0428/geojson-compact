import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Trash2, Clock, FileJson } from 'lucide-react';
import { HistoryItem, removeFromHistory, clearHistory } from '@/utils/history-manager';
import { formatBytes } from '@/utils/geojson-compressor';

interface HistoryPanelProps {
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
  onHistoryUpdate: () => void;
}

export function HistoryPanel({ history, onHistorySelect, onHistoryUpdate }: HistoryPanelProps) {
  const handleDelete = (id: string) => {
    removeFromHistory(id);
    onHistoryUpdate();
  };

  const handleClearAll = () => {
    if (window.confirm('履歴をすべて削除しますか？')) {
      clearHistory();
      onHistoryUpdate();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">履歴（最新10件）</span>
            <span className="sm:hidden">履歴</span>
          </CardTitle>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">すべて削除</span>
              <span className="sm:hidden">削除</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>履歴がありません</p>
            <p className="text-sm mt-1">圧縮したGeoJSONは自動的に保存されます</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onHistorySelect(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {formatBytes(item.originalSize)} → {formatBytes(item.compressedSize)}
                  </Badge>
                  <Badge variant={item.compressionRatio > 30 ? "default" : "secondary"} className="text-xs">
                    -{item.compressionRatio}%
                  </Badge>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground font-mono truncate">
                  {item.preview}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}