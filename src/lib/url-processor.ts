import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { z } from 'zod';
import { logger } from './logger';

const UrlSchema = z.url();

export class UrlProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlProcessingError';
  }
}

export async function processUrl(url: string) {
  const validationResult = UrlSchema.safeParse(url);
  if (!validationResult.success) {
    throw new UrlProcessingError('Invalid URL provided.');
  }

  try {
    // Use a standard User-Agent to avoid basic bot blocking
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new UrlProcessingError(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new UrlProcessingError(
        `Invalid content type: ${contentType}. Only text/html is supported.`
      );
    }

    const html = await response.text();

    const dom = new JSDOM(html, { url });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content) {
      throw new UrlProcessingError('Could not extract content from the page.');
    }

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    turndownService.remove(['script', 'style', 'iframe', 'noscript']);

    const markdown = turndownService.turndown(article.content);

    if (!markdown.trim()) {
      throw new UrlProcessingError('Resulting markdown content is empty.');
    }

    const metadata = `Source: ${url}\nTitle: ${article.title}\n\n`;
    return metadata + markdown;
  } catch (error) {
    if (error instanceof UrlProcessingError) {
      throw error;
    }
    logger.error({ error }, 'Error processing URL');
    throw new UrlProcessingError('An unexpected error occurred while processing the URL.');
  }
}

export interface UrlMetadata {
  title: string;
  ogImage?: string;
}

/**
 * Extract metadata (title, OG image) from a URL without processing full content
 */
export async function processUrlMetadata(url: string): Promise<UrlMetadata> {
  const validationResult = UrlSchema.safeParse(url);
  if (!validationResult.success) {
    throw new UrlProcessingError('Invalid URL provided.');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new UrlProcessingError(
        `Failed to fetch URL: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
      throw new UrlProcessingError(
        `Invalid content type: ${contentType}. Only text/html is supported.`
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract title: try og:title first, then regular title
    const title =
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
      document.querySelector('title')?.textContent ||
      'Untitled';

    // Extract OG image
    const ogImage =
      document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
      document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
      undefined;

    return {
      title: title.trim(),
      ogImage,
    };
  } catch (error) {
    if (error instanceof UrlProcessingError) {
      throw error;
    }
    logger.error({ error }, 'Error processing URL metadata');
    throw new UrlProcessingError('An unexpected error occurred while processing the URL.');
  }
}
