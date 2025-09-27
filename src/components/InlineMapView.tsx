import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InlineMapViewProps {
  geoJsonData: any;
}

export function InlineMapView({ geoJsonData }: InlineMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([35.6762, 139.6503], 2);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // If no GeoJSON data, just show the base map
    if (!geoJsonData) {
      return;
    }

    // Create GeoJSON style
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

    // Add GeoJSON layer
    try {
      console.log('Adding GeoJSON to inline map');
      console.log('GeoJSON type:', geoJsonData?.type);

      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: geoJsonStyle,
        onEachFeature
      }).addTo(map);

      // Fit map to GeoJSON bounds
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        console.log('Fitting map to bounds:', bounds.toBBoxString());
        map.fitBounds(bounds, { padding: [30, 30] });
      } else {
        console.warn('Invalid bounds, keeping default view');
      }
    } catch (error) {
      console.error('Error adding GeoJSON to inline map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoJsonData]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div ref={mapRef} className="absolute inset-0" />
      <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        OpenStreetMap
      </div>
    </div>
  );
}