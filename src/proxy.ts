import { type NextRequest, NextResponse } from 'next/server';
import { FREE_TIER_MODELS, HEADERS } from '@/lib/constants';

/**
 * Proxy validates API key and model access before requests reach route handlers
 *
 * Rules:
 * - User has key → allow any model
 * - No key → only allow free tier models
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only check API routes that use LLM
  if (
    !path.startsWith('/api/generate') &&
    !path.startsWith('/api/deep-dive') &&
    !path.startsWith('/api/render-d2')
  ) {
    return NextResponse.next();
  }

  const hasUserKey = !!request.headers.get(HEADERS.API_KEY);
  const requestedModel = request.headers.get(HEADERS.MODEL);

  if (hasUserKey) {
    return NextResponse.next();
  }

  if (requestedModel && !(FREE_TIER_MODELS as readonly string[]).includes(requestedModel)) {
    return Response.json(
      {
        error: {
          code: 'MODEL_REQUIRES_KEY',
          message: `Model "${requestedModel}" requires an API key. Add your OpenRouter key in settings or choose a free model.`,
          retryable: false,
        },
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

// export const config = {
//   matcher: '/api/generate',
// };
