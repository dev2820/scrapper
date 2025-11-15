import { Suspense } from "react";
import type { LinkPreviewData } from "./link-preview-card";

type OpenGraphLoaderProps = {
  url: string;
  fallback: React.ReactNode;
  children: (og: LinkPreviewData) => React.ReactNode;
};

// Cache to store promises and results
const cache = new Map<string, Promise<LinkPreviewData> | LinkPreviewData>();

// Placeholder fetch function - will be implemented later
async function fetchOpenGraphData(url: string): Promise<LinkPreviewData> {
  // TODO: Implement actual OG fetching logic
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    url,
    title: "Sample Title",
    description: "Sample Description",
    siteName: "Sample Site",
  };
}

function readOpenGraphData(url: string): LinkPreviewData {
  if (!cache.has(url)) {
    const promise = fetchOpenGraphData(url).then((data) => {
      cache.set(url, data);
      return data;
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
