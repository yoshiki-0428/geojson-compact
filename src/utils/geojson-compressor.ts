export interface CompressionResult {
  compressed: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

export interface GeoJSONFeature {
  type: string;
  geometry?: {
    type: string;
    coordinates: any;
  };
  properties?: Record<string, any>;
}

export interface GeoJSON {
  type: string;
  features?: GeoJSONFeature[];
  geometry?: {
    type: string;
    coordinates: any;
  };
  properties?: Record<string, any>;
}

export function validateGeoJSON(input: string): { valid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(input);
    
    // Basic GeoJSON structure validation
    if (!parsed.type) {
      return { valid: false, error: "Missing 'type' property" };
    }
    
    const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 
                       'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
    
    if (!validTypes.includes(parsed.type)) {
      return { valid: false, error: `Invalid type: ${parsed.type}` };
    }
    
    if (parsed.type === 'FeatureCollection' && !Array.isArray(parsed.features)) {
      return { valid: false, error: "FeatureCollection must have 'features' array" };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: "Invalid JSON format" };
  }
}

function roundCoordinate(coord: number, precision: number = 6): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(coord * multiplier) / multiplier;
}

function processCoordinates(coords: any, precision: number): any {
  if (typeof coords === 'number') {
    return roundCoordinate(coords, precision);
  }
  if (Array.isArray(coords)) {
    return coords.map(c => processCoordinates(c, precision));
  }
  return coords;
}

function cleanProperties(properties: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(properties)) {
    // Remove null, undefined, and empty string values
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

export function compressGeoJSON(input: string, coordinatePrecision: number = 6): CompressionResult {
  try {
    const validation = validateGeoJSON(input);
    if (!validation.valid) {
      return {
        compressed: input,
        originalSize: new Blob([input]).size,
        compressedSize: new Blob([input]).size,
        compressionRatio: 0,
        error: validation.error
      };
    }
    
    const originalSize = new Blob([input]).size;
    const parsed: GeoJSON = JSON.parse(input);
    
    // Process coordinates with specified precision
    if (parsed.geometry?.coordinates) {
      parsed.geometry.coordinates = processCoordinates(parsed.geometry.coordinates, coordinatePrecision);
    }
    
    // Process features if it's a FeatureCollection
    if (parsed.features) {
      parsed.features = parsed.features.map((feature: GeoJSONFeature) => {
        const processedFeature = { ...feature };
        
        // Process geometry coordinates
        if (processedFeature.geometry?.coordinates) {
          processedFeature.geometry.coordinates = processCoordinates(
            processedFeature.geometry.coordinates, 
            coordinatePrecision
          );
        }
        
        // Clean properties
        if (processedFeature.properties) {
          processedFeature.properties = cleanProperties(processedFeature.properties);
        }
        
        return processedFeature;
      });
    }
    
    // Clean root properties
    if (parsed.properties) {
      parsed.properties = cleanProperties(parsed.properties);
    }
    
    // Convert to minified JSON (no spaces)
    const compressed = JSON.stringify(parsed);
    const compressedSize = new Blob([compressed]).size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;
    
    return {
      compressed,
      originalSize,
      compressedSize,
      compressionRatio: Math.round(compressionRatio * 10) / 10
    };
  } catch (error) {
    return {
      compressed: input,
      originalSize: new Blob([input]).size,
      compressedSize: new Blob([input]).size,
      compressionRatio: 0,
      error: 'Compression failed: ' + (error as Error).message
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}