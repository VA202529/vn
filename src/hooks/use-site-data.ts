import { useEffect, useState } from "react";
import { type InfiniteData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInitialSiteData,
  getPortfolioDetail,
  getPortfolioPage,
  getPortfolioImagesForItem,
  getProductDetail,
  getProductsPage,
  getProductImagesForItem,
  getQuoteOptions,
  type PageResult,
  type PortfolioItem,
  type ProductItem,
  type QuoteOption,
  type SiteData,
} from "@/lib/api";

const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

const sharedQueryOptions = {
  staleTime: FIVE_MINUTES,
  gcTime: FIFTEEN_MINUTES,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  retry: 1,
} as const;

export function useSiteData() {
  const mounted = useMounted();
  const query = useQuery<SiteData>({
    queryKey: ["site-initial"],
    queryFn: getInitialSiteData,
    enabled: mounted,
    ...sharedQueryOptions,
  });

  usePersistedPublicData("vanappiah_site_initial", query.data);
  return hideDataUntilMounted(query, mounted);
}

export function useProductsPage(offset: number, limit: number) {
  const mounted = useMounted();
  const query = useQuery<PageResult<ProductItem>>({
    queryKey: ["products-page", offset, limit],
    queryFn: () => getProductsPage(offset, limit),
    enabled: mounted,
    ...sharedQueryOptions,
  });
  return hideDataUntilMounted(query, mounted);
}

export function usePortfolioPage(offset: number, limit: number) {
  const mounted = useMounted();
  const query = useQuery<PageResult<PortfolioItem>>({
    queryKey: ["portfolio-page", offset, limit],
    queryFn: () => getPortfolioPage(offset, limit),
    enabled: mounted,
    ...sharedQueryOptions,
  });
  return hideDataUntilMounted(query, mounted);
}

export function useProductsInfinite(limit = 6) {
  const mounted = useMounted();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery<PageResult<ProductItem>, Error, InfiniteData<PageResult<ProductItem>>, ["products"], number>({
    queryKey: ["products"],
    queryFn: ({ pageParam = 0 }) => getProductsPage(pageParam, limit),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.nextOffset ?? allPages.reduce((total, page) => total + page.items.length, 0);
    },
    initialData: () =>
      productsFromInitialCache(queryClient.getQueryData<SiteData>(["site-initial"]), limit),
    enabled: mounted,
    ...sharedQueryOptions,
  });

  const hasItems = hasInfiniteItems(query.data);
  useEffect(() => {
    if (hasItems) return;
    const stored =
      readStoredInfinite<ProductItem>("vanappiah_products_infinite") ||
      productsFromInitialCache(readStored<SiteData>("vanappiah_site_initial"), limit);
    if (stored) queryClient.setQueryData(["products"], stored);
  }, [hasItems, limit, queryClient]);

  usePersistedPublicData("vanappiah_products_infinite", query.data);
  return hideDataUntilMounted(query, mounted);
}

export function usePortfolioInfinite(limit = 6) {
  const mounted = useMounted();
  const queryClient = useQueryClient();
  const query = useInfiniteQuery<PageResult<PortfolioItem>, Error, InfiniteData<PageResult<PortfolioItem>>, ["portfolio"], number>({
    queryKey: ["portfolio"],
    queryFn: ({ pageParam = 0 }) => getPortfolioPage(pageParam, limit),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.nextOffset ?? allPages.reduce((total, page) => total + page.items.length, 0);
    },
    initialData: () =>
      portfolioFromInitialCache(queryClient.getQueryData<SiteData>(["site-initial"]), limit),
    enabled: mounted,
    ...sharedQueryOptions,
  });

  const hasItems = hasInfiniteItems(query.data);
  useEffect(() => {
    if (hasItems) return;
    const stored =
      readStoredInfinite<PortfolioItem>("vanappiah_portfolio_infinite") ||
      portfolioFromInitialCache(readStored<SiteData>("vanappiah_site_initial"), limit);
    if (stored) queryClient.setQueryData(["portfolio"], stored);
  }, [hasItems, limit, queryClient]);

  usePersistedPublicData("vanappiah_portfolio_infinite", query.data);
  return hideDataUntilMounted(query, mounted);
}

export function useProductDetail(slug: string, initialData?: ProductItem) {
  const mounted = useMounted();
  const query = useQuery<ProductItem | undefined>({
    queryKey: ["product-detail", slug],
    queryFn: () => getProductDetail(slug),
    initialData,
    enabled: mounted,
    ...sharedQueryOptions,
  });
  return hideDataUntilMounted(query, mounted);
}

export function usePortfolioDetail(slug: string, initialData?: PortfolioItem) {
  const mounted = useMounted();
  const query = useQuery<PortfolioItem | undefined>({
    queryKey: ["portfolio-detail", slug],
    queryFn: () => getPortfolioDetail(slug),
    initialData,
    enabled: mounted,
    ...sharedQueryOptions,
  });
  return hideDataUntilMounted(query, mounted);
}

export function useQuoteOptions() {
  const mounted = useMounted();
  const query = useQuery<QuoteOption[]>({
    queryKey: ["quote-options"],
    queryFn: getQuoteOptions,
    enabled: mounted,
    ...sharedQueryOptions,
  });
  return hideDataUntilMounted(query, mounted);
}

export function useProductImages(id?: string, folderId?: string, enabled = true) {
  const mounted = useMounted();
  return useQuery({
    queryKey: ["product-images", id || "", folderId || ""],
    queryFn: () => getProductImagesForItem(id, folderId),
    enabled: mounted && enabled && Boolean(id || folderId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
}

export function usePortfolioImages(id?: string, folderId?: string, enabled = true) {
  const mounted = useMounted();
  return useQuery({
    queryKey: ["portfolio-images", id || "", folderId || ""],
    queryFn: () => getPortfolioImagesForItem(id, folderId),
    enabled: mounted && enabled && Boolean(id || folderId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
}

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function hideDataUntilMounted<T extends { data: unknown }>(query: T, mounted: boolean): T {
  if (mounted) return query;
  return {
    ...query,
    data: undefined,
    isError: false,
    isLoading: true,
    isPending: true,
  } as T;
}

function readStored<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
}

function readStoredInfinite<T>(key: string): InfiniteData<PageResult<T>> | undefined {
  const data = readStored<InfiniteData<PageResult<T>>>(key);
  return hasInfiniteItems(data) ? data : undefined;
}

function hasInfiniteItems<T>(data: InfiniteData<PageResult<T>> | undefined): boolean {
  return Boolean(data?.pages?.some((page) => Array.isArray(page.items) && page.items.length > 0));
}

function usePersistedPublicData<T>(key: string, data: T | undefined) {
  useEffect(() => {
    if (typeof window === "undefined" || !data) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Public cache is an optional speed boost.
    }
  }, [key, data]);
}

function productsFromInitialCache(data: SiteData | undefined, limit: number): InfiniteData<PageResult<ProductItem>> | undefined {
  const items = data?.producten?.slice(0, limit) || [];
  if (!items.length) return undefined;
  return {
    pageParams: [0],
    pages: [sliceCachedPage(items, 0, limit)],
  };
}

function portfolioFromInitialCache(data: SiteData | undefined, limit: number): InfiniteData<PageResult<PortfolioItem>> | undefined {
  const items = data?.portfolio?.slice(0, limit) || [];
  if (!items.length) return undefined;
  return {
    pageParams: [0],
    pages: [sliceCachedPage(items, 0, limit)],
  };
}

function sliceCachedPage<T>(items: T[], offset: number, limit: number): PageResult<T> {
  return {
    ok: true,
    items,
    offset,
    limit,
    total: items.length,
    hasMore: items.length > 0,
    nextOffset: items.length > 0 ? offset + items.length : undefined,
  };
}
