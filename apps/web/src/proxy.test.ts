import { describe, it, expect } from 'vitest';
import { type NextRequest, NextResponse } from 'next/server';
import proxy from './proxy';
import { HEADERS } from '@/lib/constants';

describe('proxy', () => {
  const createMockRequest = (
    pathname: string,
    headers: Record<string, string> = {},
    method: string = 'POST'
  ): NextRequest => {
    const headersList = new Headers(headers);

    return {
      nextUrl: { pathname },
      headers: headersList,
      method,
    } as NextRequest;
  };

  describe('Non-LLM routes', () => {
    it('should allow non-LLM API routes without checking', () => {
      const request = createMockRequest('/api/some-other-route');
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should allow non-API routes', () => {
      const request = createMockRequest('/some-page');
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe('LLM routes with user API key', () => {
    it('should allow /api/note with user API key and any model', () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.API_KEY]: 'user-key',
        [HEADERS.MODEL]: 'openai/gpt-4',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should allow /api/deep-dive with user API key', () => {
      const request = createMockRequest('/api/deep-dive', {
        [HEADERS.API_KEY]: 'user-key',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should allow /api/render-d2 with user API key', () => {
      const request = createMockRequest('/api/render-d2', {
        [HEADERS.API_KEY]: 'user-key',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe('LLM routes without user API key', () => {
    it('should allow free tier models without API key', async () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.MODEL]: 'google/gemini-2.0-flash-exp:free',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should reject non-free models without API key', async () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.MODEL]: 'openai/gpt-4',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error.code).toBe('MODEL_REQUIRES_KEY');
      expect(body.error.message).toContain('requires an API key');
      expect(body.error.retryable).toBe(false);
    });

    it('should reject request without model header when default is paid', async () => {
      const request = createMockRequest('/api/note', {});
      const response = proxy(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error.code).toBe('MODEL_REQUIRES_KEY');
    });

    it('should reject paid model on /api/deep-dive without API key', async () => {
      const request = createMockRequest('/api/deep-dive', {
        [HEADERS.MODEL]: 'anthropic/claude-sonnet-4.5',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error.code).toBe('MODEL_REQUIRES_KEY');
    });

    it('should reject paid model on /api/render-d2 without API key', async () => {
      const request = createMockRequest('/api/render-d2', {
        [HEADERS.MODEL]: 'openai/gpt-4o',
      });
      const response = proxy(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(403);
    });
  });

  describe('Error message details', () => {
    it('should include model name in error message', async () => {
      const modelName = 'x-ai/grok-4-fast';
      const request = createMockRequest('/api/note', {
        [HEADERS.MODEL]: modelName,
      });
      const response = proxy(request);

      const body = await response.json();
      expect(body.error.message).toContain(modelName);
      expect(body.error.message).toContain('requires an API key');
    });

    it('should suggest adding API key or choosing free model', async () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.MODEL]: 'openai/gpt-4',
      });
      const response = proxy(request);

      const body = await response.json();
      expect(body.error.message).toContain('Add your OpenRouter key in settings');
      expect(body.error.message).toContain('choose a free model');
    });
  });

  describe('CORS preflight handling', () => {
    it('should respond to OPTIONS with 204 and CORS headers', () => {
      const request = createMockRequest('/api/note', {}, 'OPTIONS');
      const response = proxy(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-OpenRouter-Key');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-Model');
    });

    it('should handle OPTIONS for url-metadata route', () => {
      const request = createMockRequest('/api/url-metadata', {}, 'OPTIONS');
      const response = proxy(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should add CORS headers to successful responses', () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.API_KEY]: 'user-key',
      });
      const response = proxy(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should add CORS headers to error responses', async () => {
      const request = createMockRequest('/api/note', {
        [HEADERS.MODEL]: 'openai/gpt-4',
      });
      const response = proxy(request);

      expect(response.status).toBe(403);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });
});
