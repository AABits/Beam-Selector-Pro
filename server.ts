import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prepared statements for better performance
const statements = {
  getBeamTypes: db.prepare('SELECT * FROM beam_types'),
  insertBeamType: db.prepare('INSERT INTO beam_types (name) VALUES (?)'),
  deleteBeamType: db.prepare('DELETE FROM beam_types WHERE id = ?'),
  
  getBeamProfiles: db.prepare('SELECT * FROM beam_profiles'),
  getBeamProfilesByType: db.prepare('SELECT * FROM beam_profiles WHERE type_id = ?'),
  insertBeamProfile: db.prepare(`
    INSERT INTO beam_profiles (type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  updateBeamProfile: db.prepare(`
    UPDATE beam_profiles 
    SET name = ?, h = ?, b = ?, e = ?, e1 = ?, a = ?, ix = ?, wx = ?, iy = ?, wy = ?, p = ?
    WHERE id = ?
  `),
  deleteBeamProfile: db.prepare('DELETE FROM beam_profiles WHERE id = ?'),
  
  getMaterials: db.prepare('SELECT * FROM materials'),
  insertMaterial: db.prepare('INSERT INTO materials (name, fy, e) VALUES (?, ?, ?)'),
  updateMaterial: db.prepare('UPDATE materials SET name = ?, fy = ?, e = ? WHERE id = ?'),
  deleteMaterial: db.prepare('DELETE FROM materials WHERE id = ?'),
};

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    // If no password is set in environment, allow all for now (or block all?)
    // Better to block if it's meant to be secure but not configured.
    return next();
  }
  
  const providedPassword = req.headers['x-admin-password'];
  if (providedPassword === adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/beam-types', (req, res) => {
    try {
      res.json(statements.getBeamTypes.all());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/beam-types', authMiddleware, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
      const info = statements.insertBeamType.run(name);
      res.json({ id: info.lastInsertRowid, name });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/beam-types/:id', authMiddleware, (req, res) => {
    try {
      statements.deleteBeamType.run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/beam-profiles', (req, res) => {
    const { type_id } = req.query;
    try {
      if (type_id) {
        res.json(statements.getBeamProfilesByType.all(type_id));
      } else {
        res.json(statements.getBeamProfiles.all());
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/beam-profiles', authMiddleware, (req, res) => {
    const { type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p } = req.body;
    try {
      const info = statements.insertBeamProfile.run(type_id, name, h, b, e, e1, a, ix, wx, iy, wy, p);
      res.json({ id: info.lastInsertRowid, ...req.body });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/beam-profiles/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { name, h, b, e, e1, a, ix, wx, iy, wy, p } = req.body;
    try {
      statements.updateBeamProfile.run(name, h, b, e, e1, a, ix, wx, iy, wy, p, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/beam-profiles/:id', authMiddleware, (req, res) => {
    try {
      statements.deleteBeamProfile.run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/materials', (req, res) => {
    try {
      res.json(statements.getMaterials.all());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/materials', authMiddleware, (req, res) => {
    const { name, fy, e } = req.body;
    try {
      const result = statements.insertMaterial.run(name, fy, e);
      res.json({ id: result.lastInsertRowid, name, fy, e });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/materials/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const { name, fy, e } = req.body;
    try {
      statements.updateMaterial.run(name, fy, e, id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/materials/:id', authMiddleware, (req, res) => {
    try {
      statements.deleteMaterial.run(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/export', (req, res) => {
    try {
      res.json({ 
        types: statements.getBeamTypes.all(), 
        profiles: statements.getBeamProfiles.all(), 
        materials: statements.getMaterials.all() 
      });
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
