import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

// Memory cache for catalog
let catalogCache: any = null;
let catalogCacheTime = 0;

const PRIMARY_CATALOG_URL = 'https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@2bb6da8/gl-sports/catalogo.json';
const FALLBACK_CATALOG_URL = 'https://cdn.jsdelivr.net/gh/ferribrokers-eng/claude@2bb6da8/gl-sports/catalogo.json';

async function fetchCatalogData() {
  try {
    const resPrimary = await fetch(PRIMARY_CATALOG_URL);
    if (resPrimary.ok) {
      return await resPrimary.json();
    }
  } catch (e) {
    console.warn('Falha no link primário do catálogo, tentando secundário...', e);
  }

  try {
    const resFallback = await fetch(FALLBACK_CATALOG_URL);
    if (resFallback.ok) {
      return await resFallback.json();
    }
  } catch (e) {
    console.error('Falha nos dois links do catálogo:', e);
  }

  throw new Error('Não foi possível carregar o catálogo de nenhuma das fontes');
}

// API: Catalog
app.get('/api/catalog', async (req, res) => {
  try {
    const now = Date.now();
    if (catalogCache && (now - catalogCacheTime < 1000 * 60 * 30)) {
      return res.json(catalogCache);
    }
    const data = await fetchCatalogData();
    catalogCache = data;
    catalogCacheTime = now;
    return res.json(data);
  } catch (err: any) {
    console.error('Error fetching catalog:', err);
    if (catalogCache) return res.json(catalogCache);
    return res.status(502).json({ error: 'Não foi possível carregar o catálogo', details: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`GL Sports server running on http://localhost:${PORT}`);
  });
}

startServer();
