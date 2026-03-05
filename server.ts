import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/beam-types', (req, res) => {
    try {
      const types = db.prepare('SELECT * FROM beam_types').all();
      res.json(types);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/beam-types', (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare('INSERT INTO beam_types (name) VALUES (?)').run(name);
      res.json({ id: info.lastInsertRowid, name });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/beam-types/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM beam_types WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/beam-profiles', (req, res) => {
    const { type_id } = req.query;
    try {
      let profiles;
      if (type_id) {
        profiles = db.prepare('SELECT * FROM beam_profiles WHERE type_id = ?').all(type_id);
      } else {
        profiles = db.prepare('SELECT * FROM beam_profiles').all();
      }
      res.json(profiles);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/beam-profiles', (req, res) => {
    const { type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO beam_profiles (type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p);
      res.json({ id: info.lastInsertRowid, type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/beam-profiles/:id', (req, res) => {
    const { id } = req.params;
    const { name, h, b, e, e1, a, ix, wx, iy, wy, p } = req.body;
    try {
      db.prepare(`
        UPDATE beam_profiles 
        SET name = ?, h = ?, b = ?, e = ?, e1 = ?, a = ?, ix = ?, wx = ?, iy = ?, wy = ?, p = ?
        WHERE id = ?
      `).run(name, h, b, e, e1, a, ix, wx, iy, wy, p, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/beam-profiles/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM beam_profiles WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/materials', (req, res) => {
    try {
      const materials = db.prepare('SELECT * FROM materials').all();
      res.json(materials);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/materials', (req, res) => {
    const { name, fy, e } = req.body;
    try {
      const result = db.prepare('INSERT INTO materials (name, fy, e) VALUES (?, ?, ?)').run(name, fy, e);
      res.json({ id: result.lastInsertRowid, name, fy, e });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/materials/:id', (req, res) => {
    const { id } = req.params;
    const { name, fy, e } = req.body;
    try {
      db.prepare('UPDATE materials SET name = ?, fy = ?, e = ? WHERE id = ?').run(name, fy, e, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/materials/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM materials WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/export', (req, res) => {
    try {
      const types = db.prepare('SELECT * FROM beam_types').all();
      const profiles = db.prepare('SELECT * FROM beam_profiles').all();
      const materials = db.prepare('SELECT * FROM materials').all();
      res.json({ types, profiles, materials });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
