const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Tabloyu oluşturan ve bekleten fonksiyon
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS playlist (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Neon Veritabanı tabloları hazır.");
  } catch (err) {
    console.error("Veritabanı tablo oluşturma hatası:", err);
  }
}

// Sunucu başlamadan önce tablonun oluşmasını tetikle
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
};