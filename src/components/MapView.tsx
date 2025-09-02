import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON as LeafletGeoJSON, useMap } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  geojson: string | null;
}

function MapController({ geojson }: { geojson: any }) {
  const map = useMap();
  
  useEffect(() => {
    if (geojson) {
      try {
        const layer = L.geoJSON(geojson);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [geojson, map]);
  
  return null;
}

export function MapView({ geojson }: MapViewProps) {
  const [parsedGeoJSON, setParsedGeoJSON] = React.useState<any>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    if (geojson) {
      try {
        const parsed = JSON.parse(geojson);
        setParsedGeoJSON(parsed);
        keyRef.current += 1;
      } catch (error) {
        console.error('Failed to parse GeoJSON:', error);
        setParsedGeoJSON(null);
      }
    } else {
      setParsedGeoJSON(null);
    }
  }, [geojson]);

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br/>');
      layer.bindPopup(popupContent);
    }
  };

  const pointToLayer = (_feature: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#3b82f6",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });
  };

  const style = (_feature: any) => {
    return {
      fillColor: '#3b82f6',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Map className="h-4 w-4 sm:h-5 sm:w-5" />
          マッププレビュー
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] sm:h-[450px] relative">
          <MapContainer
            center={[35.6762, 139.6503]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {parsedGeoJSON && (
              <>
                <LeafletGeoJSON
                  key={keyRef.current}
                  data={parsedGeoJSON}
                  onEachFeature={onEachFeature}
                  pointToLayer={pointToLayer}
                  style={style}
                />
                <MapController geojson={parsedGeoJSON} />
              </>
            )}
          </MapContainer>
          {!parsedGeoJSON && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 pointer-events-none">
              <p className="text-muted-foreground">GeoJSONを入力するとマップが表示されます</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}