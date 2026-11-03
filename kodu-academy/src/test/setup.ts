import '@testing-library/jest-dom/vitest';
import { webcrypto } from 'node:crypto';

// jsdom não implementa estas APIs de navegador.
window.scrollTo = () => {};
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}
