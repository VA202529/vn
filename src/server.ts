import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  buildNewSiteUrl,
  getRedirectPath,
  NEW_SITE_URL,
  shouldRedirectHost,
} from "./lib/migration";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function configuredNewSiteUrl(env: unknown): string {
  if (env && typeof env === "object") {
    const vars = env as Record<string, unknown>;
    const value = vars.NEW_SITE_URL || vars.VITE_NEW_SITE_URL || vars.VITE_GEHEEL_DIGITAAL_URL;
    if (typeof value === "string" && value.trim()) {
      return value.trim().replace(/\/$/, "");
    }
  }

  return NEW_SITE_URL;
}

function migrationRedirectResponse(request: Request, env: unknown): Response | undefined {
  const url = new URL(request.url);
  const newSiteUrl = configuredNewSiteUrl(env);

  if (!shouldRedirectHost(url.hostname, newSiteUrl)) {
    return undefined;
  }

  const redirectPath = getRedirectPath(url.pathname);
  if (!redirectPath) {
    return undefined;
  }

  return Response.redirect(buildNewSiteUrl(redirectPath, url.search, newSiteUrl), 308);
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const redirect = migrationRedirectResponse(request, env);
      if (redirect) return redirect;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
