const DEFAULT_NEW_SITE_URL = "https://geheeldigitaal.nl";

export const NEW_SITE_URL = (
  import.meta.env.VITE_NEW_SITE_URL ||
  import.meta.env.VITE_GEHEEL_DIGITAAL_URL ||
  DEFAULT_NEW_SITE_URL
).replace(/\/$/, "");

export const OLD_SITE_HOSTS = new Set(["vanappiah.com", "www.vanappiah.com"]);

export const MIGRATION_REDIRECTS: Record<string, string> = {
  "/": "/",
  "/contact": "/contact",
  "/diensten": "/diensten",
  "/portfolio": "/portfolio",
  "/offerte": "/contact",
  "/producten": "/diensten",
};

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function buildNewSiteUrl(pathname = "/", search = "", newSiteUrl = NEW_SITE_URL): string {
  const targetBase = new URL(newSiteUrl);
  const targetPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const target = new URL(targetPath, `${targetBase.origin}/`);
  target.search = search;
  return target.toString();
}

export function getRedirectPath(pathname: string): string | undefined {
  return MIGRATION_REDIRECTS[normalizePathname(pathname)];
}

export function shouldRedirectHost(hostname: string, newSiteUrl = NEW_SITE_URL): boolean {
  const normalizedHost = hostname.toLowerCase();
  const newHost = new URL(newSiteUrl).hostname.toLowerCase();
  return OLD_SITE_HOSTS.has(normalizedHost) && normalizedHost !== newHost;
}
