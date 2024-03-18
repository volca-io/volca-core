#!/usr/bin/env -S npx tsx
import esbuild from 'esbuild';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../esbuild.config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const build = async () => {
  await esbuild.build({ ...config, entryPoints: [path.resolve(__dirname, '../src/server.ts')] });
};

build();
