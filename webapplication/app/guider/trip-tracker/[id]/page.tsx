"use client";

import { AppSidebar } from "@/components/guider/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Calendar,
  Users,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

interface Location {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  dayNumber: number;
  visitOrder: number;
  estimatedDuration: string | null;
  category: string;
}

interface TripData {
  id: string;
  fromDate: string;
  toDate: string;
  numberOfPeople: number;
  country: string;
  status: string;
  totalDistance: number | null;
  planDescription: string | null;
  aiSummary: string | null;
  currentDay: number;
  traveler: {
    name: string;
    phone: string;
    country: string;
  };
  locations: Location[];
}

export default function GuiderTripTrackerPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTripData();
    getUserLocation();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [tripId]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Colombo if location unavailable
          setUserLocation([6.9271, 79.8612]);
        }
      );
    } else {
      setUserLocation([6.9271, 79.8612]);
    }
  };

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guider/trips/${tripId}/tracking`);
      const data = await response.json();

      if (data.success) {
        setTrip(data.trip);
      } else {
        toast.error(data.error || "Failed to load trip data");
        router.push("/guider/jobs");
      }
    } catch (error) {
      console.error("Error fetching trip data:", error);
      toast.error("Failed to load trip data");
      router.push("/guider/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/guider/trips/${tripId}/complete`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Trip completed successfully!");
        router.push("/guider/jobs");
      } else {
        toast.error(data.error || "Failed to complete trip");
      }
    } catch (error) {
      console.error("Error completing trip:", error);
      toast.error("Failed to complete trip");
    } finally {
      setActionLoading(false);
      setCompleteDialogOpen(false);
    }
  };

  const handleCancelTrip = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/guider/trips/${tripId}/cancel`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Trip cancelled");
        router.push("/guider/jobs");
      } else {
        toast.error(data.error || "Failed to cancel trip");
      }
    } catch (error) {
      console.error("Error cancelling trip:", error);
      toast.error("Failed to cancel trip");
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTodayLocations = () => {
    if (!trip) return [];
    return trip.locations.filter((loc) => loc.dayNumber === trip.currentDay);
  };

  const getIcon = (location: Location, isToday: boolean) => {
    if (typeof window === "undefined") return null;
    
    const L = require("leaflet");
    const iconUrl = isToday
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png";

    return new L.Icon({
      iconUrl,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  const getUserIcon = () => {
    if (typeof window === "undefined") return null;
    
    const L = require("leaflet");
    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!trip) {
    return null;
  }

  const todayLocations = getTodayLocations();
  const routeCoordinates = trip.locations.map((loc) => [loc.latitude, loc.longitude] as [number, number]);
  const center = trip.locations.length > 0
    ? [trip.locations[0].latitude, trip.locations[0].longitude] as [number, number]
    : [6.9271, 79.8612] as [number, number];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Date/Time */}
          <div className="bg-white border-b px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trip to {trip.country}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(new Date().toISOString())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(currentTime)}</span>
                  </div>
                  <Badge variant="default" className="ml-2 bg-green-600">
                    Day {trip.currentDay}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Trip
                </Button>
                <Button
                  variant="default"
                  onClick={() => setCompleteDialogOpen(true)}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Trip
                </Button>
              </div>
            </div>

            {/* Traveler Info */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Traveler</p>
                      <p className="font-semibold text-lg">{trip.traveler.name}</p>
                      <p className="text-sm text-gray-600">From {trip.traveler.country}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{trip.numberOfPeople} {trip.numberOfPeople === 1 ? "person" : "people"}</span>
                    </div>
                  </div>
                  <a href={`tel:${trip.traveler.phone}`}>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {trip.traveler.phone}
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            {userLocation && (
              <MapContainer
                center={center}
                zoom={10}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location */}
                <Marker position={userLocation} icon={getUserIcon()}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Your Location</p>
                      <p className="text-xs text-gray-600">Current Position</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Trip Locations */}
                {trip.locations.map((location, index) => {
                  const isToday = location.dayNumber === trip.currentDay;
                  return (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      icon={getIcon(location, isToday)}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={isToday ? "default" : "secondary"} className={isToday ? "bg-green-600" : ""}>
                              Day {location.dayNumber} - Stop {location.visitOrder}
                            </Badge>
                          </div>
                          <p className="font-semibold">{location.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                          {location.estimatedDuration && (
                            <p className="text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {location.estimatedDuration}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs mt-2">
                            {location.category}
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Route Line */}
                {routeCoordinates.length > 1 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="#16A34A"
                    weight={3}
                    opacity={0.7}
                  />
                )}
              </MapContainer>
            )}
          </div>

          {/* Today's Locations Panel */}
          <div className="bg-white border-t p-4 max-h-48 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-3">Today's Destinations (Day {trip.currentDay})</h3>
            {todayLocations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todayLocations.map((location, index) => (
                  <Card key={location.id} className="bg-green-50 border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {location.visitOrder}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{location.title}</p>
                          <p className="text-xs text-gray-600 truncate">{location.address}</p>
                          {location.estimatedDuration && (
                            <p className="text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {location.estimatedDuration}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No locations scheduled for today</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete Trip Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this trip as completed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteTrip}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Trip Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              No, Keep Trip
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelTrip}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Trip"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
