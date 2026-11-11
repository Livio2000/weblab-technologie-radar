/** @jest-config-loader esbuild-register */

import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets/index.js';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // Coverage: only app source, not spec/env/entry files.
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
  // Measured after the first 8 spec suites (~42% statements). Sits slightly
  // below the real number so refactors don't break CI, but any NET loss of
  // coverage now fails the pipeline. Ratchet up as more specs are added.
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 25,
      functions: 25,
      lines: 40,
    },
  },
} satisfies Config;
