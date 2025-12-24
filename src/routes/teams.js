import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const teams = db.prepare(
    `SELECT t.*, (
        SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id
     ) as members_count
     FROM teams t
     JOIN team_members tm ON tm.team_id = t.id
     WHERE tm.user_id = ?
     GROUP BY t.id`
  ).all(req.user.id);
  res.json(teams);
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = db.prepare('INSERT INTO teams (name) VALUES (?)').run(name);
  db.prepare('INSERT INTO team_members (team_id, user_id, role) VALUES (?,?,?)').run(info.lastInsertRowid, req.user.id, 'owner');
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(team);
});

router.post('/:teamId/members', (req, res) => {
  const { teamId } = req.params;
  const { userId, role = 'member' } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const membership = db.prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ?').get(teamId, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Not a team member' });
  if (!['owner','admin'].includes(membership.role)) return res.status(403).json({ error: 'Requires owner/admin role' });
  db.prepare('INSERT OR IGNORE INTO team_members (team_id, user_id, role) VALUES (?,?,?)').run(teamId, userId, role);
  res.status(204).end();
});

export default router;
