#!/usr/bin/env node

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const host = '127.0.0.1';
const port = 1999;
const publicRoot = path.resolve(__dirname, 'public');

app.use(express.static(publicRoot, { extensions: ['html'], index: 'index.html' }));

app.get('/', (_request, response) => {
  response.redirect('/demo-typewriter/');
});

app.listen(port, host, () => {
  console.log(`Demo server running at http://${host}:${port}/demo-typewriter/`);
});
