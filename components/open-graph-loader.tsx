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
 * Fetches Open Graph data from a URL (uncached).
 * Use readOpenGraphData for cached + Suspense-compatible version.
 */
const fetchOpenGraphData = async (url: string): Promise<OpenGraphData> => {
  console.log("letsgo start", url);
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    console.log("letsgo failed", url);
    throw new Error(`Failed to fetch Open Graph data for ${url}`);
  }

  const html = await response.text();

  const title =
    getMetaContent(html, "og:title") ??
    getMetaContent(html, "twitter:title") ??
    getTitleTag(html);

  const description =
    getMetaContent(html, "og:description") ??
    getMetaContent(html, "twitter:description") ??
    getMetaContent(html, "description");

  const siteName =
    getMetaContent(html, "og:site_name") ?? getHostname(url) ?? undefined;

  const imageURL =
    resolveToAbsoluteUrl(
      getMetaContent(html, "og:image") ??
        getMetaContent(html, "og:image:secure_url") ??
        getMetaContent(html, "twitter:image"),
      url,
    ) ?? undefined;

  console.log("letsgo", title, description, siteName);
  return {
    title: title ? decodeEntities(title) : undefined,
    description: description ? decodeEntities(description) : undefined,
    siteName: siteName ? decodeEntities(siteName) : undefined,
    imageURL,
  };
};

/**
 * Reads Open Graph data with caching and Suspense support.
 * Throws a promise if data is loading (for Suspense).
 * Returns cached data if available.
 */
function readOpenGraphData(url: string): LinkPreviewData {
  if (!cache.has(url)) {
    const promise = fetchOpenGraphData(url).then((ogData) => {
      const previewData: LinkPreviewData = {
        url,
        title: ogData.title,
        description: ogData.description,
        siteName: ogData.siteName,
        image: ogData.imageURL,
      };
      cache.set(url, previewData);
      return previewData;
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

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMetaContent = (html: string, key: string): string | undefined => {
  const metaRegex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]*>`,
    "i",
  );
  const match = html.match(metaRegex);
  if (!match) {
    return undefined;
  }

  const contentMatch = match[0].match(/content=["']([^"']+)["']/i);
  return contentMatch ? contentMatch[1].trim() : undefined;
};

const getTitleTag = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : undefined;
};

const decodeEntities = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");

const getHostname = (rawUrl: string): string | undefined => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
};

const resolveToAbsoluteUrl = (
  value: string | undefined,
  baseUrl: string,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("data:")) {
    return value;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
};

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
