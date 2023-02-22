import mysql from "mysql2";

const pool = mysql.createPool({
  host: process.env.MY_SQL_DB_HOST,
  user: process.env.MY_SQL_DB_USER,
  password: process.env.MY_SQL_DB_PASSWORD,
  database: process.env.MY_SQL_DB_DATABASE,
  port: parseInt(process.env.MY_SQL_DB_PORT)
});

export const db = pool.promise();

