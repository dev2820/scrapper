import { Suspense } from "react";

type OpenGraphData = {
  title?: string;
  description?: string;
  siteName?: string;
  imageURL?: string;
};

type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
};

// Cache for Open Graph data
const cache = new Map<string, Promise<LinkPreviewData> | LinkPreviewData>();

/**
 * Fetches Open Graph data from a URL using api.ogfetch.com
 * Use readOpenGraphData for cached + Suspense-compatible version.
 */
const fetchOpenGraphData = async (url: string): Promise<OpenGraphData> => {
  const apiUrl = `https://api.ogfetch.com/preview?url=${encodeURIComponent(url)}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OG API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    title: data.title || data.ogTitle || undefined,
    description: data.description || data.ogDescription || undefined,
    siteName: data.siteName || data.ogSiteName || undefined,
    imageURL: data.image || data.ogImage || undefined,
  };
};

/**
 * Reads Open Graph data with caching and Suspense support.
 * Throws a promise if data is loading (for Suspense).
 * Returns cached data if available.
 */
function readOpenGraphData(url: string): LinkPreviewData {
  if (!cache.has(url)) {
    const promise = fetchOpenGraphData(url)
      .then((ogData) => {
        const previewData: LinkPreviewData = {
          url,
          title: ogData.title,
          description: ogData.description,
          siteName: ogData.siteName,
          image: ogData.imageURL,
        };
        cache.set(url, previewData);
        return previewData;
      })
      .catch((error) => {
        // Remove failed fetch from cache to allow retry
        cache.delete(url);

        // Log error in development
        if (__DEV__) {
          console.log(`[OpenGraph] Failed to fetch preview for ${url}:`, error.message);
        }

        // Return fallback data instead of crashing
        const fallbackData: LinkPreviewData = {
          url,
          title: undefined,
          description: undefined,
          siteName: undefined,
          image: undefined,
        };
        cache.set(url, fallbackData);
        return fallbackData;
      });
    cache.set(url, promise);
    throw promise;
  }

  const cached = cache.get(url)!;

  if (cached instanceof Promise) {
    throw cached;
  }

  return cached;
}

type OpenGraphLoaderProps = {
  url: string;
  fallback: React.ReactNode;
  children: (og: LinkPreviewData) => React.ReactNode;
};

function OpenGraphContent({
  url,
  children,
}: Omit<OpenGraphLoaderProps, "fallback">) {
  const og = readOpenGraphData(url);
  return <>{children(og)}</>;
}

export function OpenGraphLoader({
  url,
  fallback,
  children,
}: OpenGraphLoaderProps) {
  return (
    <Suspense fallback={fallback}>
      <OpenGraphContent url={url}>{children}</OpenGraphContent>
    </Suspense>
  );
}
