const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
const SCRIPT_ID = "recaptcha-enterprise";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

let loadPromise: Promise<void> | null = null;

export function loadRecaptcha(): Promise<void> {
  if (loadPromise) return loadPromise;
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  loadPromise = promise;

  if (document.getElementById(SCRIPT_ID)) {
    resolve();
    return loadPromise;
  }

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
  s.async = true;
  s.defer = true;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
  document.head.appendChild(s);

  return loadPromise;
}

export async function getRecaptchaToken(action: string): Promise<string> {
  try {
    await loadRecaptcha();
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    if (!window.grecaptcha) {
      reject(new Error("grecaptcha unavailable"));
      return await promise;
    }

    window.grecaptcha.enterprise.ready(async () => {
      try {
        resolve(await window.grecaptcha!.enterprise.execute(SITE_KEY, { action }));
      } catch (e) {
        reject(e);
      }
    });

    return await promise;
  } catch {
    return "";
  }
}
