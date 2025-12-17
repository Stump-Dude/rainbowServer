import path from 'path';
import express from 'express';
import connection from './db.js';

const app = express();
const port = 3307;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const enableCORS = true; 
const enableWasmMultithreading = true;

// Serve the current working directory 
// Note: this makes the current working directory visible to all computers over the network.
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

// app.use(session({
//     secret: "mycoolsecretkey", // This is the secret key used to sign the session ID cookie.
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         maxAge: 1000 * 60 * 60 // 1 hour in milliseconds
//     }
// }))

// useless crap starts -----------------------------------------------
// stuff from Unity page...
app.use((req, res, next) => {
    var path = req.url;

    // Provide COOP, COEP and CORP headers for SharedArrayBuffer
    if (enableWasmMultithreading &&
        (
            path == '/' ||
            path.includes('.js') ||
            path.includes('.html') ||
            path.includes('.htm')
        )
    ) {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }

    // Set CORS headers
    if (enableCORS) {
        res.set('Access-Control-Allow-Origin', '*');
    }    

    // Set content encoding depending on compression
    if (path.endsWith('.br')) {
        res.set('Content-Encoding', 'br');
    } else if (path.endsWith('.gz')) {
        res.set('Content-Encoding', 'gzip');
    }
    // Explicitly set content type. Files can have wrong content type if build uses compression.
    if (path.includes('.wasm')) {
        res.set('Content-Type', 'application/wasm');
    } else if (path.includes('.js')) {
        res.set('Content-Type', 'application/javascript');
    } else if (path.includes('.json')) {
        res.set('Content-Type', 'application/json');
    } else if (
    path.includes('.data') ||
    path.includes('.bundle') ||
    path.endsWith('.unityweb')
    ) {
        res.set('Content-Type', 'application/octet-stream');
    }
    // Ignore cache-control: no-cache 
    // when if-modified-since or if-none-match is set
    // because Unity Loader will cache and revalidate manually
    if (req.headers['cache-control'] == 'no-cache' &&
    (
        req.headers['if-modified-since'] ||
        req.headers['if-none-match']
    )
    ) {       
        delete req.headers['cache-control'];
    }        
    next();
});

// useless crap ends -----------------------------------------------

app.use('/', express.static(unityBuildPath, { immutable: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
})


// port -> 3000 if local test...
// if you want to make it with Web Service, try 3307 (check db.js & package.json) 

app.listen(port, () => {
  console.log('🦄 Server is running on port -> ' + port);
})
// app.listen(3000, "0.0.0.0", () => {
//   console.log("🦄 Server running")
// });

// Unity stuff ---------------------
// server.addListener('error', (error) => {
//     console.error(error);
// });

// server.addListener('close', () => {
//     console.log('Server stopped.');
//     process.exit();
// });
// Unity stuff ---------------------


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

