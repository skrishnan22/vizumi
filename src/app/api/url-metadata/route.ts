import { processUrlMetadata, UrlProcessingError } from '@/lib/url-processor';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return Response.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const metadata = await processUrlMetadata(url);

    return Response.json({
      title: metadata.title,
      ogImage: metadata.ogImage,
      url: url
    });

  } catch (error) {
    if (error instanceof UrlProcessingError) {
      return Response.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error('URL metadata processing error:', error);
    return Response.json(
      { error: 'Failed to process URL' },
      { status: 500 }
    );
  }
}
