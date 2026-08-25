/**
 * Utility to check if the current runtime is in Google AI Studio, 
 * local development, preview iframe, or dev container, 
 * versus live public production domain (baeksongeng.com).
 */
export function isDevOrStudioEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname.toLowerCase();

  // 1. Explicit production domains -> NEVER show dev tools to public visitors
  const isProductionDomain =
    hostname === 'baeksongeng.com' ||
    hostname === 'www.baeksongeng.com' ||
    hostname === 'baeksongeng.co.kr' ||
    hostname === 'www.baeksongeng.co.kr';

  if (isProductionDomain) {
    // Only show if explicit secret devmode query param is set: ?devmode=true
    try {
      const search = window.location.search.toLowerCase();
      return search.includes('devmode=true') || search.includes('studio=true');
    } catch {
      return false;
    }
  }

  // 2. Google AI Studio, Cloud Run Dev Containers, or Localhost
  const isStudioOrDevHost =
    hostname.includes('ais-dev-') ||
    hostname.includes('ais-pre-') ||
    hostname.includes('run.app') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('webcontainer') ||
    hostname.includes('google') ||
    hostname.includes('github.dev') ||
    hostname.includes('ngrok');

  // 3. Inside iframe (AI Studio preview iframe)
  let isInsideIframe = false;
  try {
    isInsideIframe = window.self !== window.top;
  } catch {
    isInsideIframe = true;
  }

  return isStudioOrDevHost || isInsideIframe;
}
