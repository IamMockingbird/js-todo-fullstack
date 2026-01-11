const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get ('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasklist ORDER BY created_at DESC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/', async (req,res) => {

    try {
        const {text} = req.body
        const postTask = await pool.query('INSERT INTO tasklist (text, done) values ($1, $2) RETURNING *;', [text, false]);
        res.json(postTask.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }

});

router.delete('/:id', async (req, res) => {

    try {
        const idToRemove = req.params.id;
    const del = await pool.query('delete from tasklist where id = $1 RETURNING *;', [idToRemove]);
    res.json(del.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.patch('/:id', async (req, res) =>{

    try {
        const idToUpdate = req.params.id;
        const update = await pool.query('update tasklist set done = not done where id = $1 RETURNING *;', [idToUpdate]);
        res.json(update.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }

});

module.exports = router;