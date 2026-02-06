export interface MarineConditions {
  swell: string;
  wind: string;
  tide: string;
  swellHeight: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  tideStage: string | null;
  lat: number;
  lon: number;
}

function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function getTideStage(heights: number[], times: string[], currentTime: string): string {
  const now = new Date(currentTime).getTime();
  let closestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = i;
    }
  }

  const current = heights[closestIdx];
  const prev = heights[Math.max(0, closestIdx - 2)] ?? current;
  const next = heights[Math.min(heights.length - 1, closestIdx + 2)] ?? current;

  const rising = next > current;
  const falling = next < current;

  const min = Math.min(...heights.filter(h => h !== undefined));
  const max = Math.max(...heights.filter(h => h !== undefined));
  const range = max - min || 1;
  const position = (current - min) / range;

  let stage: string;
  if (position > 0.75) stage = 'High';
  else if (position < 0.25) stage = 'Low';
  else stage = 'Mid';

  if (rising) return `Rising ${stage}-Tide`;
  if (falling) return `Falling ${stage}-Tide`;
  return `${stage}-Tide`;
}

export function getDeviceLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export async function fetchMarineConditions(lat: number, lon: number): Promise<MarineConditions> {
  const marineParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'wave_height,swell_wave_height,swell_wave_direction,sea_level_height',
    current: 'wave_height,swell_wave_height',
    timezone: 'auto',
    forecast_days: '1',
  });

  const weatherParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'wind_speed_10m,wind_direction_10m',
    timezone: 'auto',
    forecast_days: '1',
  });

  const [marineRes, weatherRes] = await Promise.all([
    fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`),
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`),
  ]);

  let swellHeight: number | null = null;
  let tideStage: string | null = null;
  let windSpeed: number | null = null;
  let windDir: string | null = null;

  if (marineRes.ok) {
    const marine = await marineRes.json();
    if (marine.current) {
      swellHeight = marine.current.swell_wave_height ?? marine.current.wave_height ?? null;
    }
    if (marine.hourly?.sea_level_height && marine.hourly?.time) {
      const nowIso = new Date().toISOString();
      tideStage = getTideStage(marine.hourly.sea_level_height, marine.hourly.time, nowIso);
    }
  }

  if (weatherRes.ok) {
    const weather = await weatherRes.json();
    if (weather.current) {
      windSpeed = weather.current.wind_speed_10m ?? null;
      const windDeg = weather.current.wind_direction_10m;
      if (windDeg !== undefined && windDeg !== null) {
        windDir = degreesToCardinal(windDeg);
      }
    }
  }

  const swellStr = swellHeight !== null ? `${swellHeight.toFixed(1)}m` : 'N/A';
  const windKt = windSpeed !== null ? Math.round(windSpeed * 0.539957) : null;
  const windStr = windKt !== null && windDir
    ? `${windKt}kt ${windDir}`
    : 'N/A';
  const tideStr = tideStage || 'N/A';

  return {
    swell: swellStr,
    wind: windStr,
    tide: tideStr,
    swellHeight,
    windSpeed: windKt,
    windDirection: windDir,
    tideStage,
    lat,
    lon,
  };
}
