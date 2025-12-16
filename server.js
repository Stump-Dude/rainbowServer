// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import cors from 'cors';
// import bcrypt from 'bcrypt';


// // const { pool } = require('./db');
// // const { signToken, authMiddleware } = require('./auth');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get('/health', async (req, res) => {
//   try {
//     const conn = await pool.getConnection();
//     try {
//       await conn.query('SELECT 1');
//       return res.json({ ok: true });
//     } finally {
//       conn.release();
//     }
//   } catch (e) {
//     return res.status(500).json({ ok: false, error: 'db_unreachable' });
//   }
// });

// // Unity only: register on first launch
// app.post('/auth/register', async (req, res) => {
//   const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
//   const password = (req.body && req.body.password) ? String(req.body.password) : '';

//   try {
//     const hash = await bcrypt.hash(password, 10);

//     const conn = await pool.getConnection();
//     try {
//       await conn.beginTransaction();

//       const [insertResult] = await conn.execute(
//         'INSERT INTO users (name, password_hash) VALUES (?, ?)',
//         [name, hash]
//       );

//       const userId = insertResult.insertId;

//       await conn.execute(
//         'INSERT INTO user_progress (user_id, sheet2_unlocked, sheet2_completed) VALUES (?, 0, 0)',
//         [userId]
//       );

//       await conn.commit();

//       const token = signToken({ userId });
//       return res.json({ id: userId, token, sheet2Unlocked: false, sheet2Completed: false });
//     } catch (e) {
//       await conn.rollback();

//       // Duplicate name
//       if (e && e.code === 'ER_DUP_ENTRY') {
//         return res.status(409).json({ error: 'Name already exists' });
//       }

//       return res.status(500).json({ error: 'register_failed' });
//     } finally {
//       conn.release();
//     }
//   } catch (e) {
//     return res.status(500).json({ error: 'register_failed' });
//   }
// });

// // Android + Unity: login
// app.post('/auth/login', async (req, res) => {
//   const name = (req.body && req.body.name) ? String(req.body.name).trim() : '';
//   const password = (req.body && req.body.password) ? String(req.body.password) : '';

//   if (!name || !password) {
//     return res.status(400).json({ error: 'Missing name or password' });
//   }

//   try {
//     const [rows] = await pool.execute(
//       'SELECT id, password_hash FROM users WHERE name = ? LIMIT 1',
//       [name]
//     );

//     if (!rows || rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = rows[0];
//     const ok = await bcrypt.compare(password, user.password_hash);

//     if (!ok) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const userId = user.id;

//     const [pRows] = await pool.execute(
//       'SELECT sheet2_unlocked, sheet2_completed FROM user_progress WHERE user_id = ? LIMIT 1',
//       [userId]
//     );

//     let sheet2Unlocked = false;
//     let sheet2Completed = false;

//     if (pRows && pRows.length > 0) {
//       sheet2Unlocked = pRows[0].sheet2_unlocked === 1;
//       sheet2Completed = pRows[0].sheet2_completed === 1;
//     }

//     const token = signToken({ userId });

//     return res.json({ id: userId, token, sheet2Unlocked, sheet2Completed });
//   } catch (e) {
//     return res.status(500).json({ error: 'login_failed' });
//   }
// });

// // Unity: collectable -> unlock sheet2
// app.post('/progress/unlock-sheet2', authMiddleware, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     await pool.execute(
//       'UPDATE user_progress SET sheet2_unlocked = 1 WHERE user_id = ?',
//       [userId]
//     );
//     return res.json({ sheet2Unlocked: true });
//   } catch (e) {
//     return res.status(500).json({ error: 'unlock_failed' });
//   }
// });

// // Android: after success run -> complete sheet2
// app.post('/progress/complete-sheet2', authMiddleware, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const [pRows] = await pool.execute(
//       'SELECT sheet2_unlocked FROM user_progress WHERE user_id = ? LIMIT 1',
//       [userId]
//     );

//     if (!pRows || pRows.length === 0) {
//       return res.status(404).json({ error: 'progress_missing' });
//     }

//     const unlocked = pRows[0].sheet2_unlocked === 1;
//     if (!unlocked) {
//       return res.status(403).json({ error: 'sheet2_not_unlocked' });
//     }

//     await pool.execute(
//       'UPDATE user_progress SET sheet2_completed = 1 WHERE user_id = ?',
//       [userId]
//     );

//     return res.json({ sheet2Completed: true });
//   } catch (e) {
//     return res.status(500).json({ error: 'complete_failed' });
//   }
// });

// // Unity: check status before ending
// app.get('/progress/status', authMiddleware, async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const [pRows] = await pool.execute(
//       'SELECT sheet2_unlocked, sheet2_completed FROM user_progress WHERE user_id = ? LIMIT 1',
//       [userId]
//     );

//     let sheet2Unlocked = false;
//     let sheet2Completed = false;

//     if (pRows && pRows.length > 0) {
//       sheet2Unlocked = pRows[0].sheet2_unlocked === 1;
//       sheet2Completed = pRows[0].sheet2_completed === 1;
//     }

//     return res.json({ sheet2Unlocked, sheet2Completed });
//   } catch (e) {
//     return res.status(500).json({ error: 'status_failed' });
//   }
// });



// const port = Number(process.env.PORT || '3000');
// app.listen(port, () => {
//   console.log(`Server listening on ${port}`);
// });




import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
})

app.listen(port, () => {
  console.log('Server is running on port' + port);
})