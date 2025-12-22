import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.* FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE tm.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { teamId, name, description } = req.body || {};
  if (!teamId || !name) return res.status(400).json({ error: 'teamId and name required' });
  const member = db.prepare('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, req.user.id);
  if (!member) return res.status(403).json({ error: 'Not a team member' });
  const info = db.prepare('INSERT INTO projects (team_id, name, description) VALUES (?,?,?)').run(teamId, name, description || null);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(project);
});

export default router;
