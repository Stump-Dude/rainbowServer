import express from 'express';
import connection from './db.js';

const app = express();


// IF YOU WANT TO HAVE LOCAL HOST - UNCOMMENT THIS
// const port = 3307;


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const enableCORS = true; 
const enableWasmMultithreading = true;

// Serve the current working directory 
// const unityBuildPath = __dirname;
const unityBuildPath = process.cwd();

    //  Connect to the database
connection.connect((err) => {
    if (err) {
        console.log("Error connecting to DB : " + err)
        return
    }
    console.log("🚩Connected to database!")
})

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "rainbowServer" });
});

app.get("/db-check", (req, res) => {
  connection.query("SELECT 1 AS ok", (err, rows) => {
    if (err) {
      res.status(500).json({ ok: false, error: err.message });
      return;
    }
    res.json({ ok: true, result: rows[0] });
  });
});


app.use('/', express.static(unityBuildPath, { immutable: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
})

// LOCAL-------------------------
// app.listen(port, "0.0.0.0", () => {
//   console.log('🦄 Server running on port -> ' + port)
// });

// ONLINE------------------------
let port = 10000; // to open it for Unity
if (process.env.PORT) {
  port = parseInt(process.env.PORT, 10);
}

app.listen(port, "0.0.0.0", () => {
  console.log("🦄 Server listening on port " + port);
});


// --- REGISTER ---
app.post("/register", (req, res) => {
  console.log("REGISTER BODY:", req.body);
  
  const name = req.body.name;
  const password = req.body.password;

  if (!name || !password) {
    res.status(400).json({ ok: false, message: "Missing name/password" });
    return;
  }

  // Store plaintext password temporarily in password_hash column (NOT secure, but simple)
  connection.query(
    "INSERT INTO users (name, password_hash) VALUES (?, ?)",
    [name, password],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(409).json({ ok: false, message: "Username already exists" });
          return;
        }

        res.status(500).json({ ok: false, message: err.message });
        return;
      }

      const userId = result.insertId;

      // Initialize progress row (defaults)
      connection.query(
        "INSERT INTO user_progress (user_id) VALUES (?)",
        [userId],
        (err2) => {
          if (err2) {
            res.status(500).json({
              ok: false,
              message: "User created, but progress init failed",
              userId: userId,
              error: err2.message
            });
            return;
          }

          res.status(201).json({ ok: true, userId: userId, name: name });
        }
      );
    }
  );
});
// --- LOGIN ---
// POST /login { "name": "user", "password": "123" }
app.post("/login", (req, res) => {
  console.log("LOGIN BODY:", req.body);
  
  const name = req.body.name;
  const password = req.body.password;

  if (!name || !password) {
    res.status(400).json({ ok: false, message: "Missing name or password" });
    return;
  }

  connection.query(
    "SELECT id, password_hash FROM users WHERE name = ? LIMIT 1",
    [name],
    (err, rows) => {
      if (err) {
        res.status(500).json({ ok: false, message: err.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(404).json({ ok: false, message: "User not found" });
        return;
      }

      const user = rows[0];

      // English comments inside code as requested
      // Plaintext comparison (NOT secure, but simple)
      if (user.password_hash !== password) {
        res.status(401).json({ ok: false, message: "Wrong password" });
        return;
      }

      res.json({ ok: true, userId: user.id, name: name });
    }
  );
});

app.get("/progress/:userId", (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (!userId) {
    res.status(400).json({ ok: false, message: "Invalid userId" });
    return;
  }

  connection.query(
    "SELECT sheet2_unlocked, sheet2_completed, updated_at FROM user_progress WHERE user_id = ? LIMIT 1",
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ ok: false, message: err.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(404).json({ ok: false, message: "Progress not found" });
        return;
      }

      res.json({ ok: true, userId: userId, progress: rows[0] });
    }
  );
});

// POST /collectable/picked
// Body: { "userId": 123 }
app.post("/collectable/picked", (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    res.status(400).json({ ok: false, message: "Missing userId" });
    return;
  }

  connection.query(
    "UPDATE user_progress SET sheet2_unlocked = 1 WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        res.status(500).json({ ok: false, message: err.message });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ ok: false, message: "User progress not found" });
        return;
      }

      res.json({ ok: true, userId: userId, sheet2_unlocked: 1 });
    }
  );
});

// POST /sheet2/completed
// Body: { "userId": 123 }
app.post("/sheet2/completed", (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    res.status(400).json({ ok: false, message: "Missing userId" });
    return;
  }

  connection.query(
    "UPDATE user_progress SET sheet2_completed = 1 WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        res.status(500).json({ ok: false, message: err.message });
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).json({ ok: false, message: "User progress not found" });
        return;
      }

      res.json({ ok: true, userId: userId, sheet2_completed: 1 });
    }
  );
});