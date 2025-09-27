import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { IconButton } from './ui/button';

interface ModernMapViewProps {
  geoJsonData: any;
  onClose: () => void;
}

export function ModernMapView({ geoJsonData, onClose }: ModernMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const osmMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const osmMapInstanceRef = useRef<L.Map | null>(null);
  const [activeMap, setActiveMap] = useState<'carto' | 'osm'>('carto');

  useEffect(() => {
    if (!mapRef.current || !osmMapRef.current || !geoJsonData) return;

    // Initialize Carto map
    const cartoMap = L.map(mapRef.current).setView([0, 0], 2);
    mapInstanceRef.current = cartoMap;

    // Add Carto tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(cartoMap);

    // Initialize OpenStreetMap
    const osmMap = L.map(osmMapRef.current).setView([0, 0], 2);
    osmMapInstanceRef.current = osmMap;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(osmMap);

    // Create shared GeoJSON style
    const geoJsonStyle = {
      color: '#8b5cf6',
      weight: 2,
      opacity: 0.8,
      fillColor: '#8b5cf6',
      fillOpacity: 0.3
    };

    const onEachFeature = (feature: any, layer: any) => {
      if (feature.properties) {
        const props = Object.entries(feature.properties)
          .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
          .join('<br>');
        layer.bindPopup(props);
      }
    };

    // Add GeoJSON layer to both maps
    const cartoGeoJsonLayer = L.geoJSON(geoJsonData, {
      style: geoJsonStyle,
      onEachFeature
    }).addTo(cartoMap);

    L.geoJSON(geoJsonData, {
      style: geoJsonStyle,
      onEachFeature
    }).addTo(osmMap);

    // Fit both maps to GeoJSON bounds
    const bounds = cartoGeoJsonLayer.getBounds();
    if (bounds.isValid()) {
      cartoMap.fitBounds(bounds, { padding: [50, 50] });
      osmMap.fitBounds(bounds, { padding: [50, 50] });
    }

    // Sync map movements
    const syncCartoToOsm = () => {
      const center = cartoMap.getCenter();
      const zoom = cartoMap.getZoom();
      osmMap.setView(center, zoom, { animate: false });
    };

    const syncOsmToCarto = () => {
      const center = osmMap.getCenter();
      const zoom = osmMap.getZoom();
      cartoMap.setView(center, zoom, { animate: false });
    };

    cartoMap.on('move zoom', syncCartoToOsm);
    osmMap.on('move zoom', syncOsmToCarto);

    return () => {
      cartoMap.off('move zoom', syncCartoToOsm);
      osmMap.off('move zoom', syncOsmToCarto);
      cartoMap.remove();
      osmMap.remove();
    };
  }, [geoJsonData]);

  const handleZoomIn = () => {
    if (activeMap === 'carto' && mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    } else if (activeMap === 'osm' && osmMapInstanceRef.current) {
      osmMapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (activeMap === 'carto' && mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    } else if (activeMap === 'osm' && osmMapInstanceRef.current) {
      osmMapInstanceRef.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (geoJsonData) {
      const geoJsonLayer = L.geoJSON(geoJsonData);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        if (activeMap === 'carto' && mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else if (activeMap === 'osm' && osmMapInstanceRef.current) {
          osmMapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
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
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveMap('carto')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeMap === 'carto'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Carto
                </button>
                <button
                  onClick={() => setActiveMap('osm')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeMap === 'osm'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  OpenStreetMap
                </button>
              </div>
              <IconButton
                onClick={onClose}
                variant="ghost"
                icon={<X className="w-5 h-5" />}
              />
            </div>
          </div>
        </div>

        {/* Map Container - Grid Layout */}
        <div className="absolute inset-0 top-14 grid grid-cols-2 gap-0">
          {/* Carto Map */}
          <div className="relative border-r border-gray-200 dark:border-gray-700">
            <div ref={mapRef} className="absolute inset-0" />
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Carto Light
            </div>
          </div>

          {/* OpenStreetMap */}
          <div className="relative">
            <div ref={osmMapRef} className="absolute inset-0" />
            <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              OpenStreetMap
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <IconButton
              onClick={handleZoomIn}
              variant="ghost"
              size="lg"
              icon={<ZoomIn className="w-5 h-5" />}
            />
            <IconButton
              onClick={handleZoomOut}
              variant="ghost"
              size="lg"
              icon={<ZoomOut className="w-5 h-5" />}
            />
            <IconButton
              onClick={handleFitBounds}
              variant="ghost"
              size="lg"
              icon={<Maximize2 className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}