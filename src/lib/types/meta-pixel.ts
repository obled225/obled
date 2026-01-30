/**
 * Shared Meta Pixel type definitions
 */

export type FbqCommand = 'init' | 'track' | 'trackSingle' | 'trackCustom';

export interface FbqFunction {
  (command: FbqCommand, ...args: unknown[]): void;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
  }
}
