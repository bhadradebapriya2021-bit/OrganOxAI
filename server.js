import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './server/api.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const production = process.argv.includes('--production');
const app = express();

app.disable('x-powered-by');
app.use('/api', createApiRouter());

if (production) {
  const distributionDirectory = path.join(currentDirectory, 'dist');
  app.use(express.static(distributionDirectory));
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distributionDirectory, 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    root: currentDirectory,
    configLoader: 'runner',
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  const mode = production ? 'production' : 'development';
  console.log(`Organ
  OxAI ${mode} server listening at http://localhost:${port}`);
  console.log(`ML testing dashboard: http://localhost:${port}/model-testing`);
});
