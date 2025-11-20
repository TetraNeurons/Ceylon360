'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventItem } from '@/lib/types';
import { Calendar, MapPin, Tag } from 'lucide-react';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Event marker icon
const eventIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface EventsMapProps {
  events: EventItem[];
}

export function EventsMap({ events }: EventsMapProps) {
  // Calculate center based on all events
  const center: [number, number] = events.length > 0
    ? [
        events.reduce((sum, e) => sum + e.lat, 0) / events.length,
        events.reduce((sum, e) => sum + e.lng, 0) / events.length,
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

        {/* Event Markers */}
        {events.map((event, index) => (
          <Marker
            key={event.id}
            position={[event.lat, event.lng]}
            icon={eventIcon}
          >
            <Popup maxWidth={300}>
              <div className="text-sm p-2">
                <strong className="text-base block mb-2">{event.title}</strong>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.place}
                  </p>
                  <p className="flex items-center gap-1 font-semibold text-black">
                    <Tag className="w-3 h-3" />
                    {event.price}
                  </p>
                </div>

                {event.images?.[0] && (
                  <img
                    src={event.images[0]}
                    alt={event.title}
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
