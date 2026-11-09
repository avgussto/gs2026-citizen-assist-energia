import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

test('CSS resolve ao lado do HTML quando aberto como arquivo', () => {
  const htmlPath = resolve('index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const href = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
  assert.ok(href, 'link de CSS ausente');
  const stylesheet = fileURLToPath(new URL(href, pathToFileURL(htmlPath)));
  assert.ok(existsSync(stylesheet), `${href} resolve para ${stylesheet}, que não existe`);
});

test('scripts do cálculo resolvem ao abrir o HTML como arquivo', () => {
  const htmlPath = resolve('index.html');
  const html = readFileSync(htmlPath, 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(scripts, ['./src/calculator.js', './src/assistant.js', './src/main.js']);
  for (const source of scripts) {
    const scriptPath = fileURLToPath(new URL(source, pathToFileURL(htmlPath)));
    assert.ok(existsSync(scriptPath), `${source} resolve para ${scriptPath}, que não existe`);
  }
});
