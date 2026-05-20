import { useQuery } from "@tanstack/react-query";
import { loadSiteData, type SiteData } from "@/lib/api";

export function useSiteData() {
  return useQuery<SiteData>({
    queryKey: ["site-data"],
    queryFn: loadSiteData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
