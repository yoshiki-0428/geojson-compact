/**
 * Reverse geocoding utility to get location names from coordinates
 */

export interface LocationInfo {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
}

/**
 * Extract representative coordinates from GeoJSON data
 */
export function getRepresentativeCoordinates(geoJsonData: any): [number, number] | null {
  try {
    if (!geoJsonData) return null;

    // Handle FeatureCollection
    if (geoJsonData.type === 'FeatureCollection' && geoJsonData.features?.length > 0) {
      return getFeatureCoordinates(geoJsonData.features[0]);
    }

    // Handle single Feature
    if (geoJsonData.type === 'Feature') {
      return getFeatureCoordinates(geoJsonData);
    }

    // Handle geometry directly
    if (geoJsonData.type && geoJsonData.coordinates) {
      return getGeometryCoordinates(geoJsonData);
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return null;
  }
}

function getFeatureCoordinates(feature: any): [number, number] | null {
  if (!feature.geometry) return null;
  return getGeometryCoordinates(feature.geometry);
}

function getGeometryCoordinates(geometry: any): [number, number] | null {
  const { type, coordinates } = geometry;

  switch (type) {
    case 'Point':
      return [coordinates[1], coordinates[0]]; // [lat, lon]

    case 'LineString':
      // Use the first point of the line
      return [coordinates[0][1], coordinates[0][0]];

    case 'Polygon':
      // Use the first point of the outer ring
      return [coordinates[0][0][1], coordinates[0][0][0]];

    case 'MultiPoint':
      return [coordinates[0][1], coordinates[0][0]];

    case 'MultiLineString':
      return [coordinates[0][0][1], coordinates[0][0][0]];

    case 'MultiPolygon':
      return [coordinates[0][0][0][1], coordinates[0][0][0][0]];

    default:
      return null;
  }
}

/**
 * Get location name using Nominatim reverse geocoding
 */
export async function getLocationName(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=ja,en`,
      {
        headers: {
          'User-Agent': 'GeoJSON-Compact-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: LocationInfo = await response.json();

    if (data && data.display_name) {
      // Extract meaningful location name
      return extractLocationName(data.display_name);
    }

    return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
  }
}

/**
 * Extract a meaningful location name from Nominatim display_name
 */
function extractLocationName(displayName: string): string {
  // Split by commas and take the first meaningful parts
  const parts = displayName.split(',').map(part => part.trim());

  // Filter out numbers and very long parts
  const meaningfulParts = parts.filter(part =>
    part.length > 0 &&
    part.length < 50 &&
    !/^\d+$/.test(part) // Not just numbers
  );

  // Take the first 1-3 meaningful parts
  const selectedParts = meaningfulParts.slice(0, 3);

  return selectedParts.join(', ') || displayName;
}

/**
 * Generate automatic name for GeoJSON data with location info
 */
export async function generateAutoName(geoJsonData: any): Promise<string> {
  const coords = getRepresentativeCoordinates(geoJsonData);

  if (!coords) {
    return `GeoJSON-${new Date().toISOString().slice(0, 10)}`;
  }

  const [lat, lon] = coords;
  const locationName = await getLocationName(lat, lon);

  // Create a descriptive name with timestamp
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  return `${locationName} (${timestamp})`;
}