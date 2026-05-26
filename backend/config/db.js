const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'circuitops_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

const pool = mysql.createPool(dbConfig);

// Helper function to test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database: ' + dbConfig.database);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database!');
    console.error('Error Details:', error.message);
    console.warn('⚠️ Ensure your MySQL server is running and database configuration in the root .env is correct.');
    return false;
  }
}

// Global query wrapper helper
async function query(sql, params) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (err) {
    console.error(`Database query failed: ${sql}`, err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
