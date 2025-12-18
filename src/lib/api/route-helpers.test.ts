import { describe, it, expect, vi } from 'vitest';
import { getApiKey, getModel, getOpenRouterClient } from './route-helpers';
import { HEADERS, DEFAULT_MODELS } from '@/lib/constants';


vi.mock('@/env', () => ({
  env: {
    OPENROUTER_API_KEY: 'system-fallback-key',
  },
}));

vi.mock('./openrouter', () => ({
  createOpenRouterClient: vi.fn((apiKey: string) => ({
    apiKey,
    _mockClient: true,
  })),
}));

// Type for our mocked client (the real OpenAIProvider doesn't expose apiKey)
type MockedClient = { apiKey: string; _mockClient: boolean };

describe('route-helpers', () => {
  const createMockRequest = (headers: Record<string, string> = {}): Request => {
    const headersList = new Headers(headers);
    return {
      headers: headersList,
    } as Request;
  };

  describe('getApiKey', () => {
    it('should return user API key when provided', () => {
      const userKey = 'user-api-key-123';
      const request = createMockRequest({
        [HEADERS.API_KEY]: userKey,
      });

      const result = getApiKey(request);
      expect(result).toBe(userKey);
    });

    it('should return system fallback key when user key not provided', () => {
      const request = createMockRequest({});

      const result = getApiKey(request);
      expect(result).toBe('system-fallback-key');
    });

    it('should prefer user key over system key', () => {
      const userKey = 'user-key';
      const request = createMockRequest({
        [HEADERS.API_KEY]: userKey,
      });

      const result = getApiKey(request);
      expect(result).toBe(userKey);
      expect(result).not.toBe('system-fallback-key');
    });
  });

  describe('getModel', () => {
    it('should return model from header when provided', () => {
      const requestedModel = 'openai/gpt-4o';
      const request = createMockRequest({
        [HEADERS.MODEL]: requestedModel,
      });

      const result = getModel(request, 'generate');
      expect(result).toBe(requestedModel);
    });

    it('should return default generate model when header not provided', () => {
      const request = createMockRequest({});

      const result = getModel(request, 'generate');
      expect(result).toBe(DEFAULT_MODELS.generate);
    });

    it('should return default deepDive model when header not provided', () => {
      const request = createMockRequest({});

      const result = getModel(request, 'deepDive');
      expect(result).toBe(DEFAULT_MODELS.deepDive);
    });

    it('should return default d2Fix model when header not provided', () => {
      const request = createMockRequest({});

      const result = getModel(request, 'd2Fix');
      expect(result).toBe(DEFAULT_MODELS.d2Fix);
    });

    it('should prefer header model over default', () => {
      const customModel = 'anthropic/claude-sonnet-4.5';
      const request = createMockRequest({
        [HEADERS.MODEL]: customModel,
      });

      const result = getModel(request, 'generate');
      expect(result).toBe(customModel);
      expect(result).not.toBe(DEFAULT_MODELS.generate);
    });

    it('should handle different features correctly', () => {
      const request = createMockRequest({});

      const generateModel = getModel(request, 'generate');
      const deepDiveModel = getModel(request, 'deepDive');
      const d2FixModel = getModel(request, 'd2Fix');

      expect(generateModel).toBe(DEFAULT_MODELS.generate);
      expect(deepDiveModel).toBe(DEFAULT_MODELS.deepDive);
      expect(d2FixModel).toBe(DEFAULT_MODELS.d2Fix);
    });
  });

  describe('getOpenRouterClient', () => {
    it('should create client with user API key', () => {
      const userKey = 'user-key-456';
      const request = createMockRequest({
        [HEADERS.API_KEY]: userKey,
      });

      const client = getOpenRouterClient(request) as unknown as MockedClient;
      expect(client.apiKey).toBe(userKey);
    });

    it('should create client with system fallback key when no user key', () => {
      const request = createMockRequest({});

      const client = getOpenRouterClient(request) as unknown as MockedClient;
      expect(client.apiKey).toBe('system-fallback-key');
    });

    it('should create a client object', () => {
      const userKey = 'test-key';
      const request = createMockRequest({
        [HEADERS.API_KEY]: userKey,
      });

      const client = getOpenRouterClient(request) as unknown as MockedClient;

      expect(client).toBeDefined();
      expect(client.apiKey).toBe(userKey);
    });
  });
});
