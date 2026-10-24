import { BASE_PATH } from './course';

/** Accept only this course's known pages; query strings/fragments are never events. */
export function analyticsPagePath(path: string, basePath: string = BASE_PATH): string | null {
  const localPath = basePath
    ? path === basePath ? '/' : path.startsWith(basePath + '/') ? path.slice(basePath.length) : null
    : path;
  if (localPath === null || !/^\/(?:kaart|oefenen|over|impressum|privacy|diploma|les\/(?:[0-9]|1[0-9]|2[0-5])|regio\/(?:grot|dorp|velden|woud|toppen|zee|kasteel))?\/?$/.test(localPath)) return null;
  return path;
}

/** Keep only the HTTP(S) referring domain; never forward credentials, ports or URL contents. */
export function analyticsReferrerOrigin(referrer: unknown): string | null {
  if (typeof referrer !== 'string' || !referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return null;
  }
}
