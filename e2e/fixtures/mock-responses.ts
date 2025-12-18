export const mockUrlMetadata = {
  title: 'Understanding React Server Components',
  ogImage: 'https://react.dev/images/og-learn.png',
  url: 'https://react.dev/blog/2023/03/22/react-labs',
};

/**
 * Mock response for /api/generate
 *
 * This matches the LLMNoteSchema structure.
 * The AI SDK's useObject hook expects this format.
 */
export const mockGenerateResponse = {
  blocks: [
    {
      id: 'block-1',
      title: 'React Server Components Overview',
      summary:
        '**Server Components** allow React to render components on the server, sending only the HTML to the client. This reduces bundle size and improves performance.',
      visualType: 'diagram',
      d2Code: `server: Server Components {
  shape: rectangle
  style.fill: "#e3f2fd"
}
client: Client Components {
  shape: rectangle
  style.fill: "#fff3e0"
}
server -> client: Sends HTML`,
    },
    {
      id: 'block-2',
      title: 'Benefits',
      summary:
        '**Smaller bundles** - Server Components don\'t include JavaScript in the client bundle.\n**Better performance** - Faster initial page loads.\n**Direct backend access** - Query databases directly.',
      visualType: 'icon',
      imageQuery: 'performance optimization speed',
    },
    {
      id: 'block-3',
      title: 'Use Cases',
      summary:
        'Use Server Components for:\n- Static content\n- Data fetching\n- Backend logic\n\nUse Client Components for:\n- **Interactivity** (onClick, useState)\n- Browser APIs\n- Real-time updates',
      visualType: 'diagram',
      d2Code: `static: Static Content -> server_comp: Server Component
interactive: Interactive UI -> client_comp: Client Component
server_comp.style.fill: "#e3f2fd"
client_comp.style.fill: "#fff3e0"`,
    },
  ],
};

/**
 * Mock SVG response for /api/render-d2
 */
export const mockD2Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect x="50" y="50" width="150" height="80" fill="#e3f2fd" stroke="#333" stroke-width="2" rx="4"/>
  <text x="125" y="95" text-anchor="middle" font-family="Arial" font-size="14">Server Components</text>
  <rect x="250" y="50" width="150" height="80" fill="#fff3e0" stroke="#333" stroke-width="2" rx="4"/>
  <text x="325" y="95" text-anchor="middle" font-family="Arial" font-size="14">Client Components</text>
  <path d="M 200 90 L 250 90" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="225" y="85" text-anchor="middle" font-family="Arial" font-size="12">Sends HTML</text>
</svg>`;

/**
 * Mock error response for /api/generate
 */
export const mockGenerateErrorResponse = {
  error: {
    code: 'URL_PROCESS_ERROR',
    message: 'Failed to fetch or process the URL. Please check the URL and try again.',
    retryable: true,
  },
};

/**
 * Mock 401 error (invalid API key)
 */
export const mockAuthErrorResponse = {
  error: {
    code: 'UNAUTHORIZED',
    message: 'Invalid API key. Please check your settings.',
    retryable: false,
  },
};

/**
 * Mock streaming response chunks for /api/generate
 *
 * The AI SDK streams partial objects as they're generated.
 * This simulates the streaming format.
 */
export const mockGenerateStreamChunks = [
  // First chunk - partial first block
  '{"blocks":[{"id":"block-1","title":"React Server Components Overview"}]}\n',

  // Second chunk - complete first block
  '{"blocks":[{"id":"block-1","title":"React Server Components Overview","summary":"**Server Components** allow React to render components on the server, sending only the HTML to the client. This reduces bundle size and improves performance.","visualType":"diagram","d2Code":"server: Server Components {\\n  shape: rectangle\\n  style.fill: \\"#e3f2fd\\"\\n}\\nclient: Client Components {\\n  shape: rectangle\\n  style.fill: \\"#fff3e0\\"\\n}\\nserver -> client: Sends HTML"}]}\n',

  // Third chunk - two blocks
  '{"blocks":[{"id":"block-1","title":"React Server Components Overview","summary":"**Server Components** allow React to render components on the server, sending only the HTML to the client. This reduces bundle size and improves performance.","visualType":"diagram","d2Code":"server: Server Components {\\n  shape: rectangle\\n  style.fill: \\"#e3f2fd\\"\\n}\\nclient: Client Components {\\n  shape: rectangle\\n  style.fill: \\"#fff3e0\\"\\n}\\nserver -> client: Sends HTML"},{"id":"block-2","title":"Benefits","summary":"**Smaller bundles** - Server Components don\'t include JavaScript in the client bundle.\\n**Better performance** - Faster initial page loads.\\n**Direct backend access** - Query databases directly.","visualType":"icon","imageQuery":"performance optimization speed"}]}\n',
];

/**
 * Alternative test URLs for different scenarios
 */
export const testUrls = {
  valid: 'https://react.dev/blog/2023/03/22/react-labs',
  invalid: 'not-a-valid-url',
  unreachable: 'https://this-domain-definitely-does-not-exist-12345.com/article',
  duplicate: 'https://react.dev/blog/2023/03/22/react-labs', // Same as valid for duplicate tests
};
