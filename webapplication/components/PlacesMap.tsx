'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Map } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Place marker icon
const placeIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface Image {
  title: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  thumbnailUrl: string;
  source: string;
  domain: string;
  link: string;
}

interface Attraction {
  position: number;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  ratingCount: number;
  category: string;
  phoneNumber?: string;
  website?: string;
  cid: string;
  images: Image[];
  district: string;
}

interface PlacesMapProps {
  places: Attraction[];
}

export function PlacesMap({ places }: PlacesMapProps) {
  // Calculate center based on all places
  const center: [number, number] = places.length > 0
    ? [
        places.reduce((sum, p) => sum + p.latitude, 0) / places.length,
        places.reduce((sum, p) => sum + p.longitude, 0) / places.length,
      ]
    : [7.8731, 80.7718]; // Default to Sri Lanka center

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={8}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Place Markers */}
        {places.map((place, index) => (
          <Marker
            key={place.cid}
            position={[place.latitude, place.longitude]}
            icon={placeIcon}
          >
            <Popup maxWidth={300}>
              <div className="text-sm p-2">
                <strong className="text-base block mb-2">{place.title}</strong>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center gap-1">
                    <Map className="w-3 h-3" />
                    {place.district}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-2">{place.address}</span>
                  </p>
                  <p className="flex items-center gap-1 font-semibold text-black">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {place.rating} ({place.ratingCount} reviews)
                  </p>
                </div>

                {place.images?.[0]?.thumbnailUrl && (
                  <img
                    src={place.images[0].thumbnailUrl}
                    alt={place.title}
                    className="w-full h-32 object-cover rounded mt-2"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
