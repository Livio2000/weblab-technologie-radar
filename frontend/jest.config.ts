/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/main.ts',
    '!src/app/app.config.ts',
    '!src/app/app.routes.ts',
    '!src/**/environments/**',
    '!src/**/*.spec.ts',
    '!src/**/*.model.ts',
  ],
  coverageReporters: ['text-summary', 'html', 'lcov'],
  // floor sits below the measured coverage so refactors don't break CI — ratchet up as specs grow
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 25,
      functions: 25,
      lines: 40,
    },
  },
} satisfies Config;
