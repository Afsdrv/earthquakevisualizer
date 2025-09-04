import React from 'react';
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

interface EarthquakeStatsProps {
  earthquakes: EarthquakeData[];
}

const EarthquakeStats: React.FC<EarthquakeStatsProps> = ({ earthquakes }) => {
  const getStatsByMagnitude = () => {
    const stats = {
      micro: 0,    // < 1.0
      minor: 0,    // 1.0-1.9
      light: 0,    // 2.0-2.9
      moderate: 0, // 3.0-3.9
      strong: 0,   // 4.0-4.9
      major: 0,    // 5.0-5.9
      great: 0,    // 6.0+
    };

    earthquakes.forEach(eq => {
      const mag = eq.properties.mag;
      if (mag < 1) stats.micro++;
      else if (mag < 2) stats.minor++;
      else if (mag < 3) stats.light++;
      else if (mag < 4) stats.moderate++;
      else if (mag < 5) stats.strong++;
      else if (mag < 6) stats.major++;
      else stats.great++;
    });

    return stats;
  };

  const getMaxMagnitude = () => {
    return Math.max(...earthquakes.map(eq => eq.properties.mag));
  };

  const getAverageMagnitude = () => {
    const total = earthquakes.reduce((sum, eq) => sum + eq.properties.mag, 0);
    return total / earthquakes.length;
  };

  const getMostRecentEarthquake = () => {
    return earthquakes.reduce((latest, current) => 
      current.properties.time > latest.properties.time ? current : latest
    );
  };

  const stats = getStatsByMagnitude();
  const maxMagnitude = getMaxMagnitude();
  const avgMagnitude = getAverageMagnitude();
  const mostRecent = getMostRecentEarthquake();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Statistics</CardTitle>
          <CardDescription>
            Real-time earthquake data from USGS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {earthquakes.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-magnitude-major">
                {maxMagnitude.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Max Magnitude</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold">
              {avgMagnitude.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Average Magnitude</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Magnitude Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Great (6.0+)', count: stats.great, color: 'magnitude-great' },
            { label: 'Major (5.0-5.9)', count: stats.major, color: 'magnitude-major' },
            { label: 'Strong (4.0-4.9)', count: stats.strong, color: 'magnitude-strong' },
            { label: 'Moderate (3.0-3.9)', count: stats.moderate, color: 'magnitude-moderate' },
            { label: 'Light (2.0-2.9)', count: stats.light, color: 'magnitude-light' },
            { label: 'Minor (1.0-1.9)', count: stats.minor, color: 'magnitude-minor' },
            { label: 'Micro (<1.0)', count: stats.micro, color: 'magnitude-minor' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full`}
                  style={{ backgroundColor: `hsl(var(--${color}))` }}
                />
                <span className="text-sm">{label}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Recent Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Magnitude:</span>
              <Badge variant="destructive">
                {mostRecent.properties.mag.toFixed(1)}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {mostRecent.properties.place}
              </p>
            </div>
            <div>
              <span className="font-medium">Time:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(mostRecent.properties.time).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarthquakeStats;