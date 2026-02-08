import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleRouteError } from './error-handler';
import { APICallError } from 'ai';
import { logger } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('error-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleRouteError with APICallError', () => {
    it('should handle 401 Unauthorized error', async () => {
      const error = new APICallError({
        message: 'Invalid API key',
        statusCode: 401,
        url: 'https://api.example.com',
        requestBodyValues: {},
        isRetryable: false,
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(401);

      const body = await response.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toContain('Invalid API key');
      expect(body.error.retryable).toBe(false);
    });

    it('should handle 402 Payment Required error', async () => {
      const error = new APICallError({
        message: 'Insufficient credits',
        statusCode: 402,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(402);

      const body = await response.json();
      expect(body.error.code).toBe('PAYMENT_REQUIRED');
      expect(body.error.message).toContain('Insufficient credits');
    });

    it('should handle 403 Forbidden error', async () => {
      const error = new APICallError({
        message: 'Access denied',
        statusCode: 403,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error.code).toBe('FORBIDDEN');
      expect(body.error.message).toContain('Access denied');
    });

    it('should handle 404 Not Found error', async () => {
      const error = new APICallError({
        message: 'Model not found',
        statusCode: 404,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toContain('Model not found');
    });

    it('should handle 429 Rate Limited error as retryable', async () => {
      const error = new APICallError({
        message: 'Rate limit exceeded',
        statusCode: 429,
        url: 'https://api.example.com',
        requestBodyValues: {},
        isRetryable: true,
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(429);

      const body = await response.json();
      expect(body.error.code).toBe('RATE_LIMITED');
      expect(body.error.message).toContain('Too many requests');
      expect(body.error.retryable).toBe(true);
    });

    it('should handle 500 Server Error as retryable', async () => {
      const error = new APICallError({
        message: 'Internal server error',
        statusCode: 500,
        url: 'https://api.example.com',
        requestBodyValues: {},
        isRetryable: true,
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('SERVER_ERROR');
      expect(body.error.message).toContain('AI service error');
      expect(body.error.retryable).toBe(true);
    });

    it('should handle 502 Bad Gateway error as retryable', async () => {
      const error = new APICallError({
        message: 'Bad gateway',
        statusCode: 502,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(502);

      const body = await response.json();
      expect(body.error.code).toBe('BAD_GATEWAY');
      expect(body.error.message).toContain('Service temporarily unavailable');
      expect(body.error.retryable).toBe(true);
    });

    it('should handle 503 Service Unavailable error as retryable', async () => {
      const error = new APICallError({
        message: 'Service unavailable',
        statusCode: 503,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(503);

      const body = await response.json();
      expect(body.error.code).toBe('UNAVAILABLE');
      expect(body.error.message).toContain('Model at capacity');
      expect(body.error.retryable).toBe(true);
    });

    it('should handle unknown status code', async () => {
      const error = new APICallError({
        message: 'Unknown error',
        statusCode: 418, // I'm a teapot
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(418);

      const body = await response.json();
      expect(body.error.code).toBe('API_ERROR');
      expect(body.error.message).toBe('An API error occurred');
    });

    it('should default to status 500 when statusCode is null', async () => {
      const error = new APICallError({
        message: 'Error without status',
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      const response = handleRouteError(error);
      expect(response.status).toBe(500);
    });
  });

  describe('handleRouteError with standard Error', () => {
    it('should handle standard Error', async () => {
      const error = new Error('Something went wrong');

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('ERROR');
      expect(body.error.message).toBe('Something went wrong');
      expect(body.error.retryable).toBe(false);
    });

    it('should handle Error with empty message', async () => {
      const error = new Error('');

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('ERROR');
      expect(body.error.message).toBe('');
    });
  });

  describe('handleRouteError with unknown error types', () => {
    it('should handle string error', async () => {
      const error = 'String error message';

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('UNKNOWN');
      expect(body.error.message).toBe('An unexpected error occurred');
      expect(body.error.retryable).toBe(false);
    });

    it('should handle null error', async () => {
      const error = null;

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('UNKNOWN');
      expect(body.error.message).toBe('An unexpected error occurred');
    });

    it('should handle undefined error', async () => {
      const error = undefined;

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('UNKNOWN');
    });

    it('should handle object error', async () => {
      const error = { some: 'object' };

      const response = handleRouteError(error);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.error.code).toBe('UNKNOWN');
    });
  });

  describe('logging', () => {
    it('should log error with correct parameters', () => {
      const error = new APICallError({
        message: 'Test error',
        statusCode: 500,
        url: 'https://api.example.com',
        requestBodyValues: {},
      });

      handleRouteError(error);

      expect(logger.error).toHaveBeenCalledWith(
        { code: 'SERVER_ERROR', status: 500 },
        'Route error'
      );
    });

    it('should log standard error', () => {
      const error = new Error('Standard error');

      handleRouteError(error);

      expect(logger.error).toHaveBeenCalledWith({ code: 'ERROR', status: 500 }, 'Route error');
    });
  });

  describe('response format', () => {
    it('should always return consistent error structure', async () => {
      const error = new Error('Test');
      const response = handleRouteError(error);
      const body = await response.json();

      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(body.error).toHaveProperty('retryable');
    });

    it('should return Response instance', () => {
      const error = new Error('Test');
      const response = handleRouteError(error);

      expect(response).toBeInstanceOf(Response);
    });

    it('should set Content-Type to application/json', () => {
      const error = new Error('Test');
      const response = handleRouteError(error);

      expect(response.headers.get('Content-Type')).toContain('application/json');
    });
  });
});
