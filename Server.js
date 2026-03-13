const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
user: 'postgres',
host: 'localhost',
database: 'project',
password: 'cranbrook1',
port: 5432
});
app.get('/api/achievements', async (req, res) => {
try {
const result = await pool.query(`
SELECT achievements.*,
players.player_id,
players.name as player_name,
players.user_name,
games.title as game_title,
games.developer,
games.platform
FROM achievements
LEFT JOIN players ON achievements.player_id = players.player_id
LEFT JOIN games ON achievements.game_id = games.game_id
`);
res.json(result.rows);
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

app.post('/api/players', async (req, res) => {
try {
const { name, user_name } = req.body;
const result = await pool.query(
'INSERT INTO players (name, user_name) VALUES ($1, $2) RETURNING *',
[name, user_name]
);
res.json(result.rows[0]);
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.post('/api/achievements', async (req, res) => {

try {

const { achievement_name, game_id, difficulty, completed_date } = req.body;

const result = await pool.query(
`INSERT INTO achievements (achievement_name, game_id, difficulty, completed_date)
VALUES ($1,$2,$3,$4)
RETURNING *`,
[achievement_name, game_id, difficulty, completed_date]
);

res.json(result.rows[0]);

} catch (err) {
res.status(500).json({ error: err.message });
}

});

app.post('/api/assign-player', async (req, res) => {

try {

const { achievement_id, player_id } = req.body;

const result = await pool.query(
'UPDATE achievements SET player_id = $1 WHERE achievement_id = $2 RETURNING *',
[player_id, achievement_id]
);

res.json(result.rows[0]);

} catch (err) {
res.status(500).json({ error: err.message });
}

});

app.get('/api/players', async (req, res) => {
try {
const result = await pool.query('SELECT * FROM players');
res.json(result.rows);
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.delete('/api/achievements/:id', async (req, res) => {
try {
const bookId = req.params.id;
const result = await pool.query(
'DELETE FROM achievements WHERE achievement_id = $1 RETURNING *',
[bookId]
);
if (result.rows.length === 0) {
res.status(404).json({ error: 'Achievement not found' });
} else {
res.json({ message: 'Achievement deleted', book: result.rows[0] });
}
} catch (err) {
res.status(500).json({ error: err.message });
}
});

app.get('/api/games', async (req, res) => {
try {

const result = await pool.query('SELECT * FROM games');

res.json(result.rows);

} catch (err) {
res.status(500).json({ error: err.message });
}
});
