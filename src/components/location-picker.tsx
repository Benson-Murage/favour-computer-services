import { useEffect, useRef, useState } from "react";
import { Crosshair, MapPin, Loader2 } from "lucide-react";

export type PickedLocation = {
  lat: number;
  lng: number;
  address: string;
};

type Props = {
  value: PickedLocation | null;
  onChange: (loc: PickedLocation | null) => void;
  defaultCenter?: { lat: number; lng: number };
  height?: number;
};

// Nairobi center default
const DEFAULT_CENTER = { lat: -1.2864, lng: 36.8172 };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!r.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const j = await r.json();
    return (j?.display_name as string) ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function LocationPicker({
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
  height = 320,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !ref.current || mapRef.current) return;

      // Fix default marker icons served via CDN
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const iconRetina = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadow = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      // @ts-expect-error internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl: iconRetina, shadowUrl: shadow });

      const start = value ? [value.lat, value.lng] : [defaultCenter.lat, defaultCenter.lng];
      const map = L.map(ref.current, { zoomControl: true }).setView(
        start as [number, number],
        value ? 16 : 12,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const marker = value
        ? L.marker([value.lat, value.lng], { draggable: true }).addTo(map)
        : null;
      markerRef.current = marker;

      const place = async (lat: number, lng: number) => {
        setBusy(true);
        try {
          const address = await reverseGeocode(lat, lng);
          onChange({ lat, lng, address });
        } finally {
          setBusy(false);
        }
      };

      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else {
          const m = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current = m;
          m.on("dragend", async () => {
            const ll = m.getLatLng();
            await place(ll.lat, ll.lng);
          });
        }
        await place(lat, lng);
      });

      if (marker) {
        marker.on("dragend", async () => {
          const ll = marker.getLatLng();
          await place(ll.lat, ll.lng);
        });
      }

      mapRef.current = map;
      // needed if container mounts hidden
      setTimeout(() => map.invalidateSize(), 100);
    })();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useCurrent = () => {
    if (!navigator.geolocation) return;
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const L = (await import("leaflet")).default;
        const map = mapRef.current;
        if (map) {
          map.setView([latitude, longitude], 16);
          if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
          else {
            const m = L.marker([latitude, longitude], { draggable: true }).addTo(map);
            markerRef.current = m;
            m.on("dragend", async () => {
              const ll = m.getLatLng();
              const address = await reverseGeocode(ll.lat, ll.lng);
              onChange({ lat: ll.lat, lng: ll.lng, address });
            });
          }
        }
        const address = await reverseGeocode(latitude, longitude);
        onChange({ lat: latitude, lng: longitude, address });
        setLoadingLoc(false);
      },
      () => setLoadingLoc(false),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useCurrent}
          disabled={loadingLoc}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold transition hover:bg-secondary disabled:opacity-50"
        >
          {loadingLoc ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          Use current location
        </button>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-[11px] font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> or tap on the map to drop a pin
        </span>
      </div>
      <div
        ref={ref}
        style={{ height }}
        className="w-full overflow-hidden rounded-2xl border border-border"
      />
      {value && (
        <div className="rounded-xl border border-border bg-secondary/50 p-3 text-xs">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-[color:var(--accent)]" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground">Pinned location</div>
              <div className="mt-0.5 break-words text-muted-foreground">
                {busy ? "Resolving address…" : value.address}
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StaticMapPreview({
  lat,
  lng,
  height = 220,
  address,
}: {
  lat: number;
  lng: number;
  height?: number;
  address?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | null = null;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !ref.current) return;
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const iconRetina = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadow = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      // @ts-expect-error internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl: iconRetina, shadowUrl: shadow });
      map = L.map(ref.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      L.marker([lat, lng]).addTo(map);
      setTimeout(() => map?.invalidateSize(), 100);
    })();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [lat, lng]);
  return (
    <div className="space-y-2">
      <div
        ref={ref}
        style={{ height }}
        className="w-full overflow-hidden rounded-2xl border border-border"
      />
      {address && <div className="text-xs text-muted-foreground">{address}</div>}
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-semibold transition hover:bg-secondary"
      >
        <MapPin className="h-3 w-3" /> Open in Google Maps
      </a>
    </div>
  );
}
