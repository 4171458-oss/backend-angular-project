import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: 'taskId required' });
  const rows = db.prepare('SELECT c.*, u.name as author_name FROM comments c JOIN users u ON u.id = c.user_id WHERE task_id = ? ORDER BY c.created_at ASC').all(taskId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { taskId, body } = req.body || {};
  if (!taskId || !body) return res.status(400).json({ error: 'taskId and body required' });
  const info = db.prepare('INSERT INTO comments (task_id, user_id, body) VALUES (?,?,?)').run(taskId, req.user.id, body);
  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

export default router;
