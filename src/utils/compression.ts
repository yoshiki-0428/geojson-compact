// GeoJSON Compression Utilities

interface Point {
  x: number;
  y: number;
}

// Douglas-Peucker algorithm for line simplification
function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIndex = 0;

  // Find the point with the maximum distance from the line
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
    return [points[0], points[points.length - 1]];
  }
}

// Calculate perpendicular distance from point to line
function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const norm = Math.sqrt(dx * dx + dy * dy);
  
  if (norm === 0) {
    return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  }
  
  return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / norm;
}

// Round coordinates to specified precision
function roundCoordinate(coord: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(coord * multiplier) / multiplier;
}

// Compress coordinates array
function compressCoordinates(coords: any[], precision: number = 6, simplify: boolean = true): any[] {
  if (!Array.isArray(coords)) return coords;
  
  // Check if it's a coordinate pair
  if (coords.length === 2 && typeof coords[0] === 'number') {
    return [
      roundCoordinate(coords[0], precision),
      roundCoordinate(coords[1], precision)
    ];
  }
  
  // Check if it's an array of coordinates
  if (coords.length > 0 && Array.isArray(coords[0])) {
    let processedCoords = coords;
    
    // Apply Douglas-Peucker simplification for LineString and Polygon
    if (simplify && coords.length > 2 && coords[0].length === 2) {
      const points: Point[] = coords.map(c => ({ x: c[0], y: c[1] }));
      const simplified = douglasPeucker(points, 0.0001);
      processedCoords = simplified.map(p => [p.x, p.y]);
    }
    
    return processedCoords.map(c => compressCoordinates(c, precision, false));
  }
  
  return coords;
}

// Remove null and undefined properties
function removeNullProperties(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(removeNullProperties);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      const value = removeNullProperties(obj[key]);
      if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  
  return obj;
}

// Compress geometry
function compressGeometry(geometry: any, options: CompressionOptions): any {
  if (!geometry) return geometry;
  
  const compressed: any = {
    type: geometry.type
  };
  
  switch (geometry.type) {
    case 'Point':
      compressed.coordinates = compressCoordinates(geometry.coordinates, options.precision);
      break;
    case 'LineString':
    case 'MultiPoint':
      compressed.coordinates = compressCoordinates(geometry.coordinates, options.precision, options.simplify);
      break;
    case 'Polygon':
    case 'MultiLineString':
      compressed.coordinates = geometry.coordinates.map((ring: any) =>
        compressCoordinates(ring, options.precision, options.simplify)
      );
      break;
    case 'MultiPolygon':
      compressed.coordinates = geometry.coordinates.map((polygon: any) =>
        polygon.map((ring: any) => compressCoordinates(ring, options.precision, options.simplify))
      );
      break;
    case 'GeometryCollection':
      compressed.geometries = geometry.geometries.map((g: any) =>
        compressGeometry(g, options)
      );
      break;
  }
  
  return compressed;
}

// Compress properties
function compressProperties(properties: any, options: CompressionOptions): any {
  if (!properties || !options.removeNullProperties) return properties;
  return removeNullProperties(properties);
}

interface CompressionOptions {
  precision?: number;
  simplify?: boolean;
  removeNullProperties?: boolean;
}

// Main compression function
export async function compressGeoJSON(
  geoJson: any,
  options: CompressionOptions = {}
): Promise<any> {
  const defaultOptions: CompressionOptions = {
    precision: 6,
    simplify: true,
    removeNullProperties: true,
    ...options
  };
  
  return new Promise((resolve) => {
    // Small delay to show loading state
    setTimeout(() => {
      const compressed: any = {
        type: geoJson.type
      };
      
      if (geoJson.type === 'FeatureCollection') {
        compressed.features = geoJson.features.map((feature: any) => {
          const compressedFeature: any = {
            type: 'Feature',
            geometry: compressGeometry(feature.geometry, defaultOptions)
          };
          
          const compressedProps = compressProperties(feature.properties, defaultOptions);
          if (compressedProps && Object.keys(compressedProps).length > 0) {
            compressedFeature.properties = compressedProps;
          }
          
          if (feature.id !== undefined) {
            compressedFeature.id = feature.id;
          }
          
          return compressedFeature;
        });
      } else if (geoJson.type === 'Feature') {
        compressed.geometry = compressGeometry(geoJson.geometry, defaultOptions);
        
        const compressedProps = compressProperties(geoJson.properties, defaultOptions);
        if (compressedProps && Object.keys(compressedProps).length > 0) {
          compressed.properties = compressedProps;
        }
        
        if (geoJson.id !== undefined) {
          compressed.id = geoJson.id;
        }
      } else {
        // It's a geometry object
        return resolve(compressGeometry(geoJson, defaultOptions));
      }
      
      // Additional compression: remove empty arrays and objects
      const finalCompressed = JSON.parse(JSON.stringify(compressed, (_key, value) => {
        if (Array.isArray(value) && value.length === 0) return undefined;
        if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return undefined;
        return value;
      }));
      
      resolve(finalCompressed);
    }, 100);
  });
}