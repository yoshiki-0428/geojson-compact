import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { IconButton } from './ui/Button';

interface ModernMapViewProps {
  geoJsonData: any;
  onClose: () => void;
}

export function ModernMapView({ geoJsonData, onClose }: ModernMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !geoJsonData) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([0, 0], 2);
    mapInstanceRef.current = map;

    // Add tile layer with a modern style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Add GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: {
        color: '#8b5cf6',
        weight: 2,
        opacity: 0.8,
        fillColor: '#8b5cf6',
        fillOpacity: 0.3
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          const props = Object.entries(feature.properties)
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          layer.bindPopup(props);
        }
      }
    }).addTo(map);

    // Fit map to GeoJSON bounds
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.remove();
    };
  }, [geoJsonData]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (mapInstanceRef.current && geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Map Visualization
            </h3>
            <IconButton
              onClick={onClose}
              variant="ghost"
              icon={<X className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Map Container */}
        <div ref={mapRef} className="absolute inset-0 top-14" />

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <IconButton
            onClick={handleZoomIn}
            variant="primary"
            size="lg"
            icon={<ZoomIn className="w-5 h-5" />}
          />
          <IconButton
            onClick={handleZoomOut}
            variant="primary"
            size="lg"
            icon={<ZoomOut className="w-5 h-5" />}
          />
          <IconButton
            onClick={handleFitBounds}
            variant="primary"
            size="lg"
            icon={<Maximize2 className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
}