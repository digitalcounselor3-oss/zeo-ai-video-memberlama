// Application Configuration & Branding
// Centralized for ZEO v1.0

export const APP_VERSION = 'ZEO v1.0';
export const APP_NAME = 'ZEO';
export const APP_SUBTITLE = 'AI Video Studio';
export const APP_CREATOR = 'Ms. Inggid';
export const APP_DESCRIPTION =
  'AI Video Prompt Studio untuk affiliate, seller, creator, guru, edukasi, storytelling, dan berbagai kebutuhan kreatif.';

export const GOOGLE_AI_STUDIO_URL = 'https://aistudio.google.com/app/apikey';

/**
 * Mask an API key for safe display in UI if ever needed.
 * Never outputs the full key. Example: ••••••••••••1234
 */
export function maskApiKey(key?: string | null): string {
  if (!key || typeof key !== 'string') return '••••••••••••';
  const clean = key.trim();
  if (clean.length < 8) return '••••••••••••';
  return '••••••••••••' + clean.slice(-4);
}
