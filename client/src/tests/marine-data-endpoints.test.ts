import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the marine data module which uses global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import the actual functions (no Supabase dependency)
// We need to import after mocking fetch
const { fetchMarineConditions } = await import('@/lib/marineData');

describe('Marine Data Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── OPEN METEO MARINE API ─────────────────────────────────
  describe('fetchMarineConditions - Marine API', () => {
    it('should call correct marine API URL with params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.5, wave_height: 1.8 },
          hourly: {
            time: ['2024-01-15T00:00', '2024-01-15T01:00'],
            sea_level_height: [0.5, 0.8],
          },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 15, wind_direction_10m: 45 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      // Verify marine API was called
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const marineCall = mockFetch.mock.calls[0][0] as string;
      expect(marineCall).toContain('marine-api.open-meteo.com/v1/marine');
      expect(marineCall).toContain('latitude=-33.89');
      expect(marineCall).toContain('longitude=151.27');
      expect(marineCall).toContain('wave_height');
      expect(marineCall).toContain('swell_wave_height');
      expect(marineCall).toContain('sea_level_height');
    });

    it('should call correct weather API URL with params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.5 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 15, wind_direction_10m: 90 },
        }),
      });

      await fetchMarineConditions(-33.89, 151.27);

      const weatherCall = mockFetch.mock.calls[1][0] as string;
      expect(weatherCall).toContain('api.open-meteo.com/v1/forecast');
      expect(weatherCall).toContain('latitude=-33.89');
      expect(weatherCall).toContain('longitude=151.27');
      expect(weatherCall).toContain('wind_speed_10m');
      expect(weatherCall).toContain('wind_direction_10m');
    });

    it('should parse swell height from current data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 2.3, wave_height: 2.5 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 180 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.swellHeight).toBe(2.3);
      expect(result.swell).toBe('2.3m');
    });

    it('should fallback to wave_height when swell_wave_height is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wave_height: 1.8 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 180 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.swellHeight).toBe(1.8);
      expect(result.swell).toBe('1.8m');
    });

    it('should convert wind speed from km/h to knots', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.0 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 20, wind_direction_10m: 90 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      // 20 km/h * 0.539957 ≈ 10.8 → rounds to 11
      expect(result.windSpeed).toBe(Math.round(20 * 0.539957));
      expect(result.wind).toContain('kt');
    });

    it('should convert wind direction degrees to cardinal', async () => {
      const testCases = [
        { deg: 0, expected: 'N' },
        { deg: 45, expected: 'NE' },
        { deg: 90, expected: 'E' },
        { deg: 135, expected: 'SE' },
        { deg: 180, expected: 'S' },
        { deg: 225, expected: 'SW' },
        { deg: 270, expected: 'W' },
        { deg: 315, expected: 'NW' },
      ];

      for (const { deg, expected } of testCases) {
        vi.clearAllMocks();

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            current: { swell_wave_height: 1.0 },
            hourly: { time: [], sea_level_height: [] },
          }),
        }).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            current: { wind_speed_10m: 10, wind_direction_10m: deg },
          }),
        });

        const result = await fetchMarineConditions(0, 0);
        expect(result.windDirection).toBe(expected);
      }
    });

    it('should return N/A when marine API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 90 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.swellHeight).toBeNull();
      expect(result.swell).toBe('N/A');
      expect(result.tideStage).toBeNull();
      expect(result.tide).toBe('N/A');
    });

    it('should return N/A for wind when weather API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.5 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.windSpeed).toBeNull();
      expect(result.wind).toBe('N/A');
    });

    it('should handle both APIs failing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      }).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.swell).toBe('N/A');
      expect(result.wind).toBe('N/A');
      expect(result.tide).toBe('N/A');
      expect(result.swellHeight).toBeNull();
      expect(result.windSpeed).toBeNull();
    });

    it('should return coordinates in result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      }).mockResolvedValueOnce({
        ok: false,
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.lat).toBe(-33.89);
      expect(result.lon).toBe(151.27);
    });

    it('should handle network error (fetch rejection)', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetchMarineConditions(-33.89, 151.27)
      ).rejects.toThrow();
    });

    it('should handle missing current data from marine API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          // No 'current' field
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 90 },
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.swellHeight).toBeNull();
      expect(result.swell).toBe('N/A');
    });

    it('should handle missing current data from weather API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.5 },
          hourly: { time: [], sea_level_height: [] },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          // No 'current' field
        }),
      });

      const result = await fetchMarineConditions(-33.89, 151.27);

      expect(result.windSpeed).toBeNull();
      expect(result.wind).toBe('N/A');
    });
  });

  // ─── TIDE STAGE CALCULATION ────────────────────────────────
  describe('tide stage calculation', () => {
    it('should return a valid tide stage string', async () => {
      // The getTideStage function classifies based on position in the range
      // and whether the next values are higher or lower than current.
      // With hourly data, the closest index to "now" determines the result.
      const heights = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6];
      const times = heights.map((_, i) =>
        new Date(Date.now() - (heights.length - 1 - i) * 3600000).toISOString()
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.0 },
          hourly: { time: times, sea_level_height: heights },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 0 },
        }),
      });

      const result = await fetchMarineConditions(0, 0);

      // Should return a non-null tide stage
      expect(result.tideStage).toBeTruthy();
      // Should contain a valid stage keyword
      expect(result.tideStage).toMatch(/Rising|Falling|High|Mid|Low/);
      expect(result.tide).not.toBe('N/A');
    });

    it('should return tide string containing -Tide suffix', async () => {
      const heights = [1.6, 1.4, 1.2, 1.0, 0.8, 0.6, 0.4, 0.2];
      const times = heights.map((_, i) =>
        new Date(Date.now() - (heights.length - 1 - i) * 3600000).toISOString()
      );

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { swell_wave_height: 1.0 },
          hourly: { time: times, sea_level_height: heights },
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          current: { wind_speed_10m: 10, wind_direction_10m: 0 },
        }),
      });

      const result = await fetchMarineConditions(0, 0);

      expect(result.tideStage).toBeTruthy();
      expect(result.tideStage).toContain('-Tide');
    });
  });
});
