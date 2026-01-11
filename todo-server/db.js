// Импортируем установленные библиотеки
const pg = require('pg');
require('dotenv').config();

// Создаем пул соединений
const pool = new pg.Pool ({
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

module.exports = pool;