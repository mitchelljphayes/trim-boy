
import { z } from 'zod';
import { insertLogSchema, insertUserSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    getOrCreate: {
      method: 'POST' as const,
      path: '/api/users',
      input: z.object({ name: z.string().min(1).max(8) }),
      responses: {
        200: z.object({ id: z.number(), name: z.string() }),
        201: z.object({ id: z.number(), name: z.string() }),
      },
    },
  },
  logs: {
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.object({ id: z.number(), category: z.string() }),
      },
    },
    getWeekly: {
      method: 'GET' as const,
      path: '/api/logs/weekly/:userId',
      responses: {
        200: z.object({
          strengthCount: z.number(),
          runCount: z.number(),
          habits: z.array(z.object({
            date: z.string(),
            surf: z.boolean(),
            maint: z.boolean(),
            breath: z.boolean(),
          })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
