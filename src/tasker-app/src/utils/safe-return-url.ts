import { ROUTES, SAFE_RETURN_URL } from '../config/routes';

export { SAFE_RETURN_URL };

export function isSafeReturnUrl(url: string | undefined): url is string {
  return Boolean(url && SAFE_RETURN_URL.test(url) && !url.startsWith('//') && !url.startsWith('\\'));
}

export const DEFAULT_RETURN_URL = ROUTES.HOME;
