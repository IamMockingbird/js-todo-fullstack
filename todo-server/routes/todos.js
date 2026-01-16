const express = require('express');
const router = express.Router();
const pool = require('../db.js');

router.get ('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasklist ORDER BY position ASC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }
});

router.post('/', async (req,res) => {

    try {
        const {text} = req.body
        const postTask = await pool.query('INSERT INTO tasklist (text, done, position) values ($1, $2, (SELECT COALESCE(MIN(position), 0) - 1 FROM tasklist) ) RETURNING *;', [text, false]);
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

router.patch ('/:id/moving', async (req,res) =>{

    try {
        const idToMoving = req.params.id;
        const newPosition = req.body.position;
        const DataWhithOldPosition = await pool.query('SELECT position FROM tasklist WHERE id = $1;', [idToMoving]);
        const oldPosition = DataWhithOldPosition.rows[0].position;

        if (newPosition > oldPosition) {
           const ifPosDown = await pool.query('UPDATE tasklist SET position = position - 1 WHERE position > $1 AND position <= $2', [oldPosition, newPosition]);
        }else{
           const ifPosUp = await pool.query('UPDATE tasklist SET position = position + 1 WHERE position < $1 AND position >= $2', [oldPosition, newPosition]);
        }

        const updatePos = await pool.query('UPDATE tasklist SET position = $1 WHERE id = $2', [newPosition, idToMoving]);

        console.log (idToMoving, newPosition);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка сервера');
    }

});

module.exports = router;