import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EarthquakeData {
  id: string;
  geometry: {
    coordinates: [number, number, number];
  };
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
    type: string;
    depth: number;
  };
}

interface EarthquakeResponse {
  features: EarthquakeData[];
}

const EarthquakeMap: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeData | null>(null);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: EarthquakeResponse = await response.json();
        setEarthquakes(data.features || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching earthquake data:', err);
        setError('Failed to load earthquake data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchEarthquakes, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getMagnitudeColor = (magnitude: number): string => {
    if (magnitude < 1) return 'hsl(var(--magnitude-minor))';
    if (magnitude < 2) return 'hsl(var(--magnitude-light))';
    if (magnitude < 3) return 'hsl(var(--magnitude-moderate))';
    if (magnitude < 4) return 'hsl(var(--magnitude-strong))';
    if (magnitude < 5) return 'hsl(var(--magnitude-major))';
    return 'hsl(var(--magnitude-great))';
  };

  const getMagnitudeSize = (magnitude: number): number => {
    return Math.max(8, magnitude * 4);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getMagnitudeLabel = (magnitude: number): string => {
    if (magnitude < 1) return 'Micro';
    if (magnitude < 2) return 'Minor';
    if (magnitude < 3) return 'Light';
    if (magnitude < 4) return 'Moderate';
    if (magnitude < 5) return 'Strong';
    if (magnitude < 6) return 'Major';
    return 'Great';
  };

  // Convert lat/lng to screen coordinates (simple projection)
  const latLngToScreen = (lat: number, lng: number) => {
    // Simple equirectangular projection
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* World Map Background */}
      <div 
        className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(142, 71, 45, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(142, 71, 45, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%)
          `
        }}
      >
        {/* Grid overlay for geographic reference */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={`lat-${i}`}
              className="absolute w-full border-t border-slate-600"
              style={{ top: `${(i + 1) * 12.5}%` }}
            />
          ))}
          {[...Array(12)].map((_, i) => (
            <div
              key={`lng-${i}`}
              className="absolute h-full border-l border-slate-600"
              style={{ left: `${(i + 1) * 8.33}%` }}
            />
          ))}
        </div>

        {/* Earthquake markers */}
        {earthquakes.map((earthquake) => {
          const [lng, lat] = earthquake.geometry.coordinates;
          const magnitude = earthquake.properties.mag;
          const position = latLngToScreen(lat, lng);
          const size = getMagnitudeSize(magnitude);
          
          return (
            <button
              key={earthquake.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: getMagnitudeColor(magnitude),
                boxShadow: `0 0 ${size / 2}px ${getMagnitudeColor(magnitude)}50`,
              }}
              onClick={() => setSelectedEarthquake(earthquake)}
              title={`M${magnitude.toFixed(1)} - ${earthquake.properties.place}`}
            />
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-4 rounded-lg space-y-2">
          <h3 className="font-medium text-sm">Magnitude Scale</h3>
          {[
            { range: '6.0+', color: 'hsl(var(--magnitude-great))', label: 'Great' },
            { range: '5.0-5.9', color: 'hsl(var(--magnitude-major))', label: 'Major' },
            { range: '4.0-4.9', color: 'hsl(var(--magnitude-strong))', label: 'Strong' },
            { range: '3.0-3.9', color: 'hsl(var(--magnitude-moderate))', label: 'Moderate' },
            { range: '2.0-2.9', color: 'hsl(var(--magnitude-light))', label: 'Light' },
            { range: '<2.0', color: 'hsl(var(--magnitude-minor))', label: 'Minor' },
          ].map(({ range, color, label }) => (
            <div key={range} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{range}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Geographic labels */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
          90°N
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
          90°S
        </div>
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-xs text-muted-foreground">
          180°W
        </div>
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-xs text-muted-foreground">
          180°E
        </div>
      </div>

      {/* Selected earthquake details */}
      {selectedEarthquake && (
        <div className="absolute top-4 right-4 w-80">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Magnitude {selectedEarthquake.properties.mag.toFixed(1)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {getMagnitudeLabel(selectedEarthquake.properties.mag)}
                  </Badge>
                  <button
                    onClick={() => setSelectedEarthquake(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <CardDescription className="text-sm">
                {selectedEarthquake.properties.place}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Time:</span>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(selectedEarthquake.properties.time)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Depth:</span>
                  <p className="text-muted-foreground">
                    {selectedEarthquake.geometry.coordinates[2]?.toFixed(1)} km
                  </p>
                </div>
                <div>
                  <span className="font-medium">Coordinates:</span>
                  <p className="text-muted-foreground text-xs">
                    {selectedEarthquake.geometry.coordinates[1].toFixed(3)}, {selectedEarthquake.geometry.coordinates[0].toFixed(3)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Type:</span>
                  <p className="text-muted-foreground capitalize">
                    {selectedEarthquake.properties.type}
                  </p>
                </div>
              </div>
              <a
                href={selectedEarthquake.properties.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-primary hover:underline text-sm mt-2"
              >
                View USGS Details →
              </a>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EarthquakeMap;