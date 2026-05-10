import { AppError } from '../../middleware/error-handler';
import { tripsRepository } from '../trips/trips.repository';

interface MapMarker {
  stopId: string;
  cityId: string;
  label: string;
  orderIndex: number;
  arrivalDate: string;
  departureDate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface TripRoute {
  tripId: string;
  provider: 'openstreetmap';
  tileLayerUrl: string;
  attribution: string;
  markers: MapMarker[];
  routeGeoJson: {
    type: 'Feature';
    properties: {
      tripId: string;
      stopCount: number;
    };
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
  };
  links: {
    openStreetMap: string | null;
  };
}

const toNumber = (value: unknown): number => Number(value);
const toDateString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value;

export class MapsService {
  public async tripRoute(tripId: string, userId: string): Promise<TripRoute> {
    const trip = await tripsRepository.findOwnedDetail(tripId, userId);
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    const markers = trip.stops.map((stop) => ({
      stopId: stop.id,
      cityId: stop.cityId,
      label: [stop.city.name, stop.city.country].filter(Boolean).join(', '),
      orderIndex: stop.orderIndex,
      arrivalDate: toDateString(stop.arrivalDate),
      departureDate: toDateString(stop.departureDate),
      coordinates: {
        latitude: toNumber(stop.city.latitude),
        longitude: toNumber(stop.city.longitude)
      }
    }));

    const coordinates = markers.map(
      (marker): [number, number] => [marker.coordinates.longitude, marker.coordinates.latitude]
    );

    return {
      tripId,
      provider: 'openstreetmap',
      tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      markers,
      routeGeoJson: {
        type: 'Feature',
        properties: {
          tripId,
          stopCount: markers.length
        },
        geometry: {
          type: 'LineString',
          coordinates
        }
      },
      links: {
        openStreetMap: this.buildOpenStreetMapLink(markers)
      }
    };
  }

  private buildOpenStreetMapLink(markers: MapMarker[]): string | null {
    if (markers.length === 0) return null;

    const lats = markers.map((marker) => marker.coordinates.latitude);
    const lngs = markers.map((marker) => marker.coordinates.longitude);
    const minLng = Math.min(...lngs);
    const minLat = Math.min(...lats);
    const maxLng = Math.max(...lngs);
    const maxLat = Math.max(...lats);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    return `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=6/${centerLat}/${centerLng}`;
  }
}

export const mapsService = new MapsService();
