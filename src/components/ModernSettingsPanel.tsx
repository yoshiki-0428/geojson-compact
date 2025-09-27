import { useState } from 'react';
import { Settings, Sliders, Save, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function ModernSettingsPanel() {
  const [precision, setPrecision] = useState(6);
  const [simplification, setSimplification] = useState(0.0001);
  const [autoCompress, setAutoCompress] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('geoCompactSettings', JSON.stringify({
      precision,
      simplification,
      autoCompress,
    }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </CardTitle>
          <CardDescription>
            Configure compression parameters and app preferences
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Compression Settings */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            Compression Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium text-gray-900">Coordinate Precision</span>
                <p className="text-sm text-gray-500 mt-1">
                  Number of decimal places to keep
                </p>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {precision}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium text-gray-900">Simplification Tolerance</span>
                <p className="text-sm text-gray-500 mt-1">
                  Douglas-Peucker algorithm tolerance
                </p>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {simplification}
              </span>
            </label>
            <input
              type="range"
              min="0.00001"
              max="0.001"
              step="0.00001"
              value={simplification}
              onChange={(e) => setSimplification(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Precise</span>
              <span>Simplified</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Auto-compress on upload</span>
              <p className="text-sm text-gray-500 mt-1">
                Automatically compress files when loaded
              </p>
            </div>
            <button
              onClick={() => setAutoCompress(!autoCompress)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                autoCompress ? 'bg-purple-600' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                  autoCompress && 'translate-x-6'
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-500" />
            About GeoCompact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              GeoCompact is a powerful GeoJSON compression tool that reduces file sizes while preserving geographic accuracy.
            </p>
            <p>
              Using advanced algorithms including coordinate precision reduction and Douglas-Peucker simplification,
              we achieve typical compression ratios of 60-80%.
            </p>
            <div className="pt-3 border-t border-gray-200">
              <p className="font-medium text-gray-900 mb-2">Features:</p>
              <ul className="space-y-1 ml-4">
                <li>• Lossless and lossy compression options</li>
                <li>• Real-time map visualization</li>
                <li>• Compression history tracking</li>
                <li>• Multiple input methods</li>
                <li>• Export to various formats</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-4">
        <Button
          onClick={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          icon={<Save className="w-5 h-5" />}
          className="shadow-lg"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}