import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,  // Request high accuracy
        timeout: 10000,           // Time to wait for location (10 seconds)
        maximumAge: 0             // Force fresh location
      };

      const success = (pos: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log('Location found:', { latitude, longitude, accuracy });
        setPosition([latitude, longitude]);
      };

      const error = (err: GeolocationPositionError) => {
        console.error('Geolocation error:', err);
        // Fallback to a default location if geolocation fails
        setPosition([12.9716, 77.5946]); // Default to a known location (e.g., Bangalore)
        setError(`Unable to get your location: ${err.message}. Showing default location.`);
      };

      // First try with high accuracy
      navigator.geolocation.getCurrentPosition(success, error, options);
      
      // Set up a watch position for better accuracy
      const watchId = navigator.geolocation.watchPosition(success, error, options);
      
      // Clean up the watch position when component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by your browser');
      // Fallback to a default location
      setPosition([12.9716, 77.5946]); // Default to a known location
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Location Error</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="h-screen w-full relative z-0">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
