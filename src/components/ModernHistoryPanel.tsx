import { Clock, FileJson, TrendingDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { cn } from '../lib/utils';

interface HistoryItem {
  id: string;
  name: string;
  timestamp: Date;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  data: any;
}

interface ModernHistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function ModernHistoryPanel({ history, onSelect }: ModernHistoryPanelProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (history.length === 0) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        <Card variant="default" className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No History Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your compression history will appear here
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="text-2xl">Compression History</CardTitle>
          <CardDescription>
            View and restore your recent compressions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  'group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
                  'hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md',
                  'transition-all cursor-pointer'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileJson className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.timestamp)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">Original:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formatBytes(item.originalSize)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">Compressed:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatBytes(item.compressedSize)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-green-500" />
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {(100 - item.compressionRatio).toFixed(1)}% saved
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}