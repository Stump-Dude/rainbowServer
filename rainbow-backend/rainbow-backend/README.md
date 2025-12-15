# Rainbow backend (Node.js + MySQL)

## Endpoints
- `POST /auth/register` (Unity only)
- `POST /auth/login` (Unity + Android)
- `POST /progress/unlock-sheet2` (Unity)
- `POST /progress/complete-sheet2` (Android)
- `GET /progress/status` (Unity)

## Environment variables
- `DB_HOST`
- `DB_PORT` (optional, default 3306)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

## Local run
```bash
npm install
npm start
```

## Create tables
Run `schema.sql` in your MySQL database.
