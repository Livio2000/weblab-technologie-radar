import { jest } from '@jest/globals';

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
});

Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    };
  },
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

HTMLCanvasElement.prototype.getContext = <typeof HTMLCanvasElement.prototype.getContext>jest.fn();
