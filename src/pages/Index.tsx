import React, { useEffect, useState } from 'react';
import EarthquakeMap from '@/components/EarthquakeMap';
import EarthquakeStats from '@/components/EarthquakeStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

const Index = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Error fetching earthquake data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquakes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Global Earthquake Monitor
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time seismic activity visualization powered by USGS data
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* Map Section */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  Live Earthquake Map
                </CardTitle>
                <CardDescription>
                  Click on markers to view detailed earthquake information
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <div className="h-full min-h-[400px]">
                  <EarthquakeMap />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Panel */}
          <div className="lg:col-span-1">
            {!loading && earthquakes.length > 0 ? (
              <EarthquakeStats earthquakes={earthquakes} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Loading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Data provided by{' '}
            <a 
              href="https://earthquake.usgs.gov/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              USGS Earthquake Hazards Program
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
