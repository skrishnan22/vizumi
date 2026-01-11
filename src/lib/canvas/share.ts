import { z } from 'zod';
import { CanvasEdgeSchema, LayoutTypeSchema, ProcessedCardSchema } from './schemas-v2';

const CanvasSharePayloadSchema = z.object({
  version: z.literal(1),
  title: z.string(),
  url: z.string(),
  layoutType: LayoutTypeSchema,
  cards: z.array(ProcessedCardSchema),
  edges: z.array(CanvasEdgeSchema),
});

export type CanvasSharePayload = z.infer<typeof CanvasSharePayloadSchema>;

export function encodeSharePayload(payload: CanvasSharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeSharePayload(encoded: string): CanvasSharePayload {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const json = new TextDecoder().decode(bytes);
  const data = JSON.parse(json);

  return CanvasSharePayloadSchema.parse(data);
}
