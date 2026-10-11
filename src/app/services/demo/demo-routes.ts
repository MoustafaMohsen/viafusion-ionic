/** Routes anyone may open in demo mode without being logged in */
export const DEMO_PUBLIC_ROUTES = ["/", "/auth/login", "/auth/otp", "/auth/login-with-pin"];

/**
 * Screens whose features are not simulated: placeholders of the original app, flows that need endpoints the demo
 * does not have, and the first-time registration steps (the demo user is already set up).
 */
export const DEMO_UNAVAILABLE_ROUTES = [
  "/payment",
  "/marketplace",
  "/cc/pcc",
  "/cc/iban",
  "/transaction/schedule-payment",
  "/transaction/internal-transaction",
  "/transaction/request-payment",
  "/verification",
  "/auth/fingerprint",
  "/auth/register-pin",
  "/auth/confirm-pin",
  "/checkout-test",
];

export function demo_path(url: string) {
  let path = (url || "/").split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function is_demo_public(url: string) {
  return DEMO_PUBLIC_ROUTES.indexOf(demo_path(url)) != -1;
}

export function is_demo_unavailable(url: string) {
  let path = demo_path(url);
  return DEMO_UNAVAILABLE_ROUTES.some(route => path == route || path.indexOf(route + "/") == 0);
}
