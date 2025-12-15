const mysql = require('mysql2/promise');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const pool = mysql.createPool({
  host: requireEnv('DB_HOST'),
  port: Number(process.env.DB_PORT || '3306'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

module.exports = { pool };
