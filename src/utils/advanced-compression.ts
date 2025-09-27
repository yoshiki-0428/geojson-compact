/**
 * Advanced GeoJSON Compression with aggressive optimization
 */

// Convert coordinates to delta encoding for better compression
export function deltaEncode(coords: number[][]): number[][] {
  if (coords.length <= 1) return coords;

  const encoded: number[][] = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    encoded.push([
      coords[i][0] - coords[i - 1][0],
      coords[i][1] - coords[i - 1][1]
    ]);
  }
  return encoded;
}

// Remove unnecessary precision from numbers
function optimizeNumber(num: number, precision: number): number {
  if (precision === 0) return Math.round(num);
  const multiplier = Math.pow(10, precision);
  return Math.round(num * multiplier) / multiplier;
}

// Optimize property values
export function optimizeProperties(props: any): any {
  if (!props) return undefined;

  const optimized: any = {};
  for (const key in props) {
    const value = props[key];

    // Skip null/undefined/empty values
    if (value === null || value === undefined || value === '') continue;

    // Optimize numbers
    if (typeof value === 'number') {
      // For integers, don't use decimals
      if (Number.isInteger(value)) {
        optimized[key] = value;
      } else {
        // For floats, limit precision
        optimized[key] = optimizeNumber(value, 2);
      }
    }
    // Optimize strings
    else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) optimized[key] = trimmed;
    }
    // Recursively optimize objects
    else if (typeof value === 'object' && !Array.isArray(value)) {
      const opt = optimizeProperties(value);
      if (opt && Object.keys(opt).length > 0) {
        optimized[key] = opt;
      }
    }
    // Keep arrays as-is
    else if (Array.isArray(value) && value.length > 0) {
      optimized[key] = value;
    }
    // Keep booleans
    else if (typeof value === 'boolean') {
      optimized[key] = value;
    }
  }

  return Object.keys(optimized).length > 0 ? optimized : undefined;
}

// Aggressive coordinate optimization
export function aggressiveCoordinateOptimization(coords: any, precision: number = 4): any {
  if (!Array.isArray(coords)) return coords;

  // Single coordinate pair
  if (coords.length === 2 && typeof coords[0] === 'number') {
    return [
      optimizeNumber(coords[0], precision),
      optimizeNumber(coords[1], precision)
    ];
  }

  // Array of coordinates
  if (coords.length > 0 && Array.isArray(coords[0])) {
    return coords.map(c => aggressiveCoordinateOptimization(c, precision));
  }

  return coords;
}

// Calculate actual file size
export function calculateSize(obj: any): number {
  // Convert to minified JSON string
  const jsonStr = JSON.stringify(obj);
  // Calculate byte size
  return new Blob([jsonStr]).size;
}

// Validate GeoJSON structure
export function validateGeoJSON(geoJson: any): boolean {
  if (!geoJson || typeof geoJson !== 'object') return false;

  const validTypes = [
    'Point', 'LineString', 'Polygon',
    'MultiPoint', 'MultiLineString', 'MultiPolygon',
    'GeometryCollection', 'Feature', 'FeatureCollection'
  ];

  return validTypes.includes(geoJson.type);
}

// Get compression statistics
export function getCompressionStats(original: any, compressed: any): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savings: number;
  savedPercentage: number;
} {
  const originalSize = calculateSize(original);
  const compressedSize = calculateSize(compressed);
  const compressionRatio = (compressedSize / originalSize) * 100;
  const savings = originalSize - compressedSize;
  const savedPercentage = 100 - compressionRatio;

  return {
    originalSize,
    compressedSize,
    compressionRatio,
    savings,
    savedPercentage
  };
}