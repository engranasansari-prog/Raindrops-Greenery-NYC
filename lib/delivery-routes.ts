// Predefined delivery routes for the "live drivers" animation on the
// coverage map. Each route is a sequence of waypoints (lng, lat) that
// the animated driver dot interpolates between.
//
// Routes are theatrically simulated — they're not tied to real driver
// GPS. This is standard early-stage practice (DoorDash, Uber Eats, and
// Instacart all started the same way) and signals "this is an active
// service" without claiming a tracking accuracy we don't have. When
// real driver telemetry is wired up we'll swap the static waypoint
// list for a live WebSocket feed; the rendering layer doesn't change.

export type DeliveryRoute = {
  id: string;
  label: string;
  waypoints: Array<[number, number]>;
};

export const DELIVERY_ROUTES: DeliveryRoute[] = [
  {
    id: 'midtown-williamsburg',
    label: 'Midtown → Williamsburg',
    waypoints: [
      [-73.998, 40.751], // Midtown West
      [-73.984, 40.748], // Times Square area
      [-73.973, 40.745], // Bryant Park
      [-73.978, 40.728], // East Village
      [-73.974, 40.717], // approach Williamsburg Bridge
      [-73.962, 40.713], // mid-bridge
      [-73.952, 40.714]  // Williamsburg
    ]
  },
  {
    id: 'uws-ues',
    label: 'UWS → UES (86th transverse)',
    waypoints: [
      [-73.975, 40.787], // UWS — 79th + Amsterdam
      [-73.972, 40.788], // 86th + Columbus
      [-73.966, 40.785], // Central Park West entrance
      [-73.959, 40.783], // mid-park transverse
      [-73.954, 40.781], // 86th + 5th
      [-73.948, 40.777]  // UES — 86th + 3rd
    ]
  },
  {
    id: 'greenpoint-lic',
    label: 'Greenpoint → LIC (Pulaski Bridge)',
    waypoints: [
      [-73.948, 40.730], // Greenpoint
      [-73.952, 40.738], // Manhattan Ave
      [-73.953, 40.743], // Pulaski Bridge south
      [-73.948, 40.745], // mid-bridge
      [-73.943, 40.747], // LIC
      [-73.940, 40.750]  // Queens Plaza
    ]
  },
  {
    id: 'fidi-battery',
    label: 'FiDi loop',
    waypoints: [
      [-74.009, 40.706], // FiDi south
      [-74.005, 40.708], // Wall St
      [-74.001, 40.711], // Pearl St
      [-74.005, 40.713], // City Hall area
      [-74.013, 40.711], // World Trade Center
      [-74.018, 40.708], // Battery Park City
      [-74.014, 40.704], // back south
      [-74.009, 40.706]  // close loop
    ]
  },
  {
    id: 'west-east-village',
    label: 'West Village → East Village',
    waypoints: [
      [-74.005, 40.733], // West Village
      [-73.999, 40.731], // 6th Ave + 14th
      [-73.991, 40.731], // Union Square
      [-73.984, 40.729], // 2nd Ave + 14th
      [-73.978, 40.726], // East Village core
      [-73.974, 40.727]  // Alphabet City
    ]
  }
];

export const TRAIL_LENGTH = 6; // how many past positions to keep per driver

// Per-driver animation speed (segment-progress per frame).
// Slightly randomized so the dots don't move in lockstep. 0.0015 = full
// segment in ~11 sec @ 60fps; 0.0035 = ~5 sec. Either way the driver
// arcs feel alive without being frantic.
export const DRIVER_SPEEDS = [0.0022, 0.0028, 0.0019, 0.0031, 0.0024];
