const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function init() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3300,
    user: 'root',
    password: '',
    multipleStatements: true
  });
  console.log('Connected to MySQL server.');

  const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
  console.log('Executing schema.sql...');
  await connection.query(schemaSql);
  console.log('schema.sql executed successfully.');

  const seedSql = fs.readFileSync(path.join(__dirname, '../database/seed.sql'), 'utf8');
  console.log('Executing seed.sql...');
  await connection.query(seedSql);
  console.log('seed.sql executed successfully.');

  await connection.end();
  console.log('Database initialized successfully!');
}

init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
