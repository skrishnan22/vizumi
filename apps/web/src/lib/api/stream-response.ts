import type { ObjectStreamPart } from 'ai';
import { logger } from '@/lib/logger';
import { getApiErrorPayload } from '@/lib/api/error-handler';

const TEXT_STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
};

export function serializeStreamError(error: unknown): string {
  const { status, payload } = getApiErrorPayload(error);
  logger.error({ code: payload.error.code, status }, 'Route stream error');
  return JSON.stringify(payload);
}

export function createErrorAwareTextStreamResponse<PARTIAL>(
  fullStream: ReadableStream<ObjectStreamPart<PARTIAL>>
): Response {
  const textStream = fullStream.pipeThrough(
    new TransformStream<ObjectStreamPart<PARTIAL>, string>({
      transform(part, controller) {
        if (part.type === 'text-delta') {
          controller.enqueue(part.textDelta);
          return;
        }
        if (part.type === 'error') {
          controller.error(new Error(serializeStreamError(part.error)));
        }
      },
    })
  );

  return new Response(textStream.pipeThrough(new TextEncoderStream()), {
    headers: TEXT_STREAM_HEADERS,
  });
}
