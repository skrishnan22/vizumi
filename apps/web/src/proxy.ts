import { type NextRequest, NextResponse } from 'next/server';
import { DEFAULT_MODELS, FREE_MODELS, HEADERS } from '@/lib/constants';

// CORS headers for API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-OpenRouter-Key, X-Model',
};

/**
 * Proxy handles:
 * 1. CORS preflight requests (OPTIONS) for all API routes
 * 2. API key and model access validation for LLM routes
 *
 * Rules:
 * - User has key → allow any model
 * - No key → only allow free tier models
 */
export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Proxy validation only for LLM routes
  if (
    path.startsWith('/api/note') ||
    path.startsWith('/api/canvas') ||
    path.startsWith('/api/deep-dive') ||
    path.startsWith('/api/render-d2')
  ) {
    const hasUserKey = !!request.headers.get(HEADERS.API_KEY);
    const requestedModel = request.headers.get(HEADERS.MODEL);

    if (!hasUserKey) {
      const freeModelIds = new Set(FREE_MODELS.map((m) => m.id));
      const defaultModel = path.startsWith('/api/deep-dive')
        ? DEFAULT_MODELS.deepDive
        : path.startsWith('/api/render-d2')
          ? DEFAULT_MODELS.d2Fix
          : DEFAULT_MODELS.generate;
      const modelToCheck = requestedModel ?? defaultModel;

      if (modelToCheck && !freeModelIds.has(modelToCheck)) {
        return new NextResponse(
          JSON.stringify({
            error: {
              code: 'MODEL_REQUIRES_KEY',
              message: `Model "${modelToCheck}" requires an API key. Add your OpenRouter key in settings or choose a free model.`,
              retryable: false,
            },
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    }
  }

  // Add CORS headers to the response
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
