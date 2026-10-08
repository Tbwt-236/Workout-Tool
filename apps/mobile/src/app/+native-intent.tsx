// Native-only boundary, before Router parses URL/query data. No external query data is used by 001.
// Keep the upstream decoder advisory open until dependencies themselves are upgraded.
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }): string | null {
  const fallback = initial ? '/history' : null;
  if (typeof path !== 'string' || path.length > 1024 || /[%?#\\\s]/.test(path)) return fallback;
  let route = path;
  if (route.startsWith('fitquest://')) route = route.slice('fitquest://'.length);
  else if (/^exps?:\/\//.test(route)) route = route.split('/--/')[1] ?? '';
  else if (!route.startsWith('/')) return fallback;
  if (!route || route === '/') return '/history';
  if (!route.startsWith('/')) route = '/' + route;
  if (route === '/history' || route === '/workout/active') return route;
  const match = /^\/(?:history|workout\/complete)\/([1-9]\d{0,15})$/.exec(route);
  return match && Number.isSafeInteger(Number(match[1])) ? route : fallback;
}
