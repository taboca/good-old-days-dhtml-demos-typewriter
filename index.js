#!/usr/bin/env node

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const host = '127.0.0.1';
const port = 1999;
const demoRoot = path.resolve(__dirname, 'demo-typewriter');
const netscapeRoot = path.resolve(__dirname, 'netscape-6-welcome');

app.use('/demo-typewriter', express.static(demoRoot, { extensions: ['html'], index: 'index.html' }));
app.use('/netscape-6-welcome', express.static(netscapeRoot, { extensions: ['html'], index: 'index.html' }));

app.get('/', (_request, response) => {
  response.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Demo server running at http://${host}:${port}/demo-typewriter/`);
  console.log(`Netscape 6 welcome demo running at http://${host}:${port}/netscape-6-welcome/`);
});
