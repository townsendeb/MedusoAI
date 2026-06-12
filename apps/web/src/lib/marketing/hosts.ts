export const MARKETING_HOSTS = ["medusoai.com", "www.medusoai.com", "localhost"] as const;

export const APP_HOSTS = ["app.medusoai.com"] as const;

export const MARKETING_ROUTES = ["/", "/privacy", "/terms"] as const;

export function isMarketingHost(hostname: string): boolean {
  return (MARKETING_HOSTS as readonly string[]).includes(hostname);
}

export function isAppHost(hostname: string): boolean {
  return (APP_HOSTS as readonly string[]).includes(hostname);
}

export function isMarketingRoute(pathname: string): boolean {
  return (MARKETING_ROUTES as readonly string[]).includes(pathname);
}

export function getHostname(hostHeader: string | null): string {
  return (hostHeader ?? "localhost").split(":")[0] ?? "localhost";
}
