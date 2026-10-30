/**
 * Domain Restriction Module
 *
 * Controls which email domains are allowed to access the app.
 *
 * Configuration via .env file:
 *   EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=*           → Allow ALL domains (for testing/development)
 *   EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=hbplus.fit   → Restrict to @hbplus.fit emails ONLY
 *   EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=gmail.com    → Restrict to @gmail.com emails ONLY
 *
 * For the HB+ assignment submission:
 *   Change to "hbplus.fit" to demonstrate domain restriction.
 *   Any non-@hbplus.fit email will see: "Access restricted. Please login using your official domain email."
 */

export const DOMAIN_RESTRICTED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

export function getAllowedEmailDomain() {
  // Change the fallback from '' to 'hbplus.fit' to enforce domain restriction by default
  return (process.env.EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '');
}

export function isAllowedEmail(email?: string | null) {
  if (!email) return false;
  const domain = getAllowedEmailDomain();
  // If domain is '*', empty, or 'all' → allow any email (development/testing mode)
  // If domain is 'hbplus.fit' → only @hbplus.fit emails are allowed
  if (!domain || domain === '*' || domain === 'all') return true;
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at < 0) return false;
  return normalized.slice(at + 1) === domain;
}
