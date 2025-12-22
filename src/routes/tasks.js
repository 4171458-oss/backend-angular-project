import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const { projectId } = req.query;
  let rows;
  if (projectId) {
    rows = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY order_index ASC, created_at DESC').all(projectId);
  } else {
    rows = db.prepare(`
      SELECT t.* FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN team_members tm ON tm.team_id = p.team_id
      WHERE tm.user_id = ?
      ORDER BY t.created_at DESC`).all(req.user.id);
  }
  res.json(rows);
});

router.post('/', (req, res) => {
  const { projectId, title, description, status = 'todo', priority = 'normal', assigneeId = null, dueDate = null, orderIndex = 0 } = req.body || {};
  if (!projectId || !title) return res.status(400).json({ error: 'projectId and title required' });
  const info = db.prepare(`INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, due_date, order_index)
    VALUES (?,?,?,?,?,?,?,?)`).run(projectId, title, description || null, status, priority, assigneeId, dueDate, orderIndex);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(task);
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const allowed = ['title','description','status','priority','assignee_id','due_date','order_index'];
  const body = req.body || {};
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields' });
  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).end();
});

export default router;
