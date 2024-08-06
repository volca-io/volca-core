#!/usr/bin/env -S npx tsx
import esbuild from 'esbuild';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../esbuild.config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const watch = async () => {
  let ctx = await esbuild.context({ ...config, entryPoints: [path.join(__dirname, '../src/local-server.ts')] });

  await ctx.watch();
};

watch();
