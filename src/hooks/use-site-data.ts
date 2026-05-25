import { useEffect } from "react";
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
  const query = useQuery<SiteData>({
    queryKey: ["site-initial"],
    queryFn: getInitialSiteData,
    initialData: () => readStored<SiteData>("vanappiah_site_initial"),
    ...sharedQueryOptions,
  });

  usePersistedPublicData("vanappiah_site_initial", query.data);
  return query;
}

export function useProductsPage(offset: number, limit: number) {
  return useQuery<PageResult<ProductItem>>({
    queryKey: ["products-page", offset, limit],
    queryFn: () => getProductsPage(offset, limit),
    ...sharedQueryOptions,
  });
}

export function usePortfolioPage(offset: number, limit: number) {
  return useQuery<PageResult<PortfolioItem>>({
    queryKey: ["portfolio-page", offset, limit],
    queryFn: () => getPortfolioPage(offset, limit),
    ...sharedQueryOptions,
  });
}

export function useProductsInfinite(limit = 6) {
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
      readStoredInfinite<ProductItem>("vanappiah_products_infinite") ||
      productsFromInitialCache(queryClient.getQueryData<SiteData>(["site-initial"]), limit),
    ...sharedQueryOptions,
  });

  usePersistedPublicData("vanappiah_products_infinite", query.data);
  return query;
}

export function usePortfolioInfinite(limit = 6) {
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
      readStoredInfinite<PortfolioItem>("vanappiah_portfolio_infinite") ||
      portfolioFromInitialCache(queryClient.getQueryData<SiteData>(["site-initial"]), limit),
    ...sharedQueryOptions,
  });

  usePersistedPublicData("vanappiah_portfolio_infinite", query.data);
  return query;
}

export function useProductDetail(slug: string, initialData?: ProductItem) {
  return useQuery<ProductItem | undefined>({
    queryKey: ["product-detail", slug],
    queryFn: () => getProductDetail(slug),
    initialData,
    ...sharedQueryOptions,
  });
}

export function usePortfolioDetail(slug: string, initialData?: PortfolioItem) {
  return useQuery<PortfolioItem | undefined>({
    queryKey: ["portfolio-detail", slug],
    queryFn: () => getPortfolioDetail(slug),
    initialData,
    ...sharedQueryOptions,
  });
}

export function useQuoteOptions() {
  return useQuery<QuoteOption[]>({
    queryKey: ["quote-options"],
    queryFn: getQuoteOptions,
    ...sharedQueryOptions,
  });
}

export function useProductImages(id?: string, folderId?: string, enabled = true) {
  return useQuery({
    queryKey: ["product-images", id || "", folderId || ""],
    queryFn: () => getProductImagesForItem(id, folderId),
    enabled: enabled && Boolean(id || folderId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
}

export function usePortfolioImages(id?: string, folderId?: string, enabled = true) {
  return useQuery({
    queryKey: ["portfolio-images", id || "", folderId || ""],
    queryFn: () => getPortfolioImagesForItem(id, folderId),
    enabled: enabled && Boolean(id || folderId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
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
  const hasItems = data?.pages?.some((page) => Array.isArray(page.items) && page.items.length > 0);
  return hasItems ? data : undefined;
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
