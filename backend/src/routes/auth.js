import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { dbGet } from '../db/index.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler } from '../lib/async-handler.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await dbGet('SELECT id, username, password, role FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  })
);

export default router;
