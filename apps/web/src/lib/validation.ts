export type UrlValidationResult =
  | { valid: true; url: string }
  | { valid: false; error: string };

export function validateUrl(input: string): UrlValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter a URL' };
  }

  // Auto-add https:// if protocol is missing
  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Validate URL format
  try {
    const parsed = new URL(url);

    // Must have a valid hostname with at least one dot (e.g., example.com, not just "example")
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
    }

    return { valid: true, url };
  } catch {
    return { valid: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
  }
}
