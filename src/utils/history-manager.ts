export interface HistoryItem {
  id: string;
  name: string;
  geojson: string;
  compressedSize: number;
  originalSize: number;
  compressionRatio: number;
  timestamp: number;
  preview?: string; // First 100 chars of GeoJSON for quick preview
}

const HISTORY_KEY = 'geocompact_history';
const MAX_HISTORY_ITEMS = 10;

export function getHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored);
    // Sort by timestamp, newest first
    return history.sort((a: HistoryItem, b: HistoryItem) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  try {
    const history = getHistory();
    
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      preview: item.geojson.substring(0, 100) + '...'
    };
    
    // Add new item at the beginning
    const updatedHistory = [newItem, ...history];
    
    // Keep only the latest MAX_HISTORY_ITEMS
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

export function removeFromHistory(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from history:', error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

export function getHistoryItem(id: string): HistoryItem | undefined {
  const history = getHistory();
  return history.find(item => item.id === id);
}