const Database = require('better-sqlite3');
const path = require('path');

// Create or open database
const db = new Database(path.join(__dirname, 'wordle.db'));

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    date TEXT PRIMARY KEY,
    id INTEGER,
    solution TEXT,
    print_date TEXT,
    days_since_launch INTEGER,
    editor TEXT,
    json_response TEXT
  )
`);

// Get word by date
function getWordByDate(date) {
    const stmt = db.prepare('SELECT * FROM words WHERE date = ?');
    return stmt.get(date);
}

// Save word
function saveWord(date, wordData) {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO words (date, id, solution, print_date, days_since_launch, editor, json_response)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        date,
        wordData.id,
        wordData.solution,
        wordData.print_date,
        wordData.days_since_launch,
        wordData.editor,
        JSON.stringify(wordData)
    );
}

module.exports = {
    getWordByDate,
    saveWord
};
