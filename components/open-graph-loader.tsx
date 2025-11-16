import { useOpenGraph } from "@/hooks/use-open-graph";
import { Suspense } from "react";

type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
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
  const { data: og } = useOpenGraph(url);

  const { title, description, siteName, image } = og;
  return <>{children({ url, title, description, siteName, image })}</>;
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
