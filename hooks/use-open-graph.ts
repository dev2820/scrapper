import { useSuspenseQuery } from "@tanstack/react-query";
import { decode } from "html-entities";

type OpenGraphData = {
  url?: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
  favicon?: string;
  author?: string;
  date?: string;
  publisher?: string;
  logo?: string;
};
// 1 day in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;

async function fetchOpenGraph(url: string): Promise<OpenGraphData> {
  const apiUrl = `https://api.ogfetch.com/preview?url=${encodeURIComponent(url)}`;

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  return await response.json();
}

export function useOpenGraph(url: string) {
  return useSuspenseQuery({
    queryKey: ["openGraph", url],
    queryFn: () => fetchOpenGraph(url),
    select: (data) => {
      return {
        ...data,
        title: decode(data.title),
        image: decode(data.image),
        description: decode(data.description),
      };
    },
    staleTime: ONE_DAY,
  });
}
