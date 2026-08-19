const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const dirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace วัสดุ with พัสดุ
  content = content.replace(/วัสดุ/g, 'พัสดุ');
  
  // Replace สินค้า with พัสดุ
  content = content.replace(/สินค้า/g, 'พัสดุ');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

async function run() {
  console.log("Replacing words in source files...");
  for (const dir of dirs) {
    walkDir(dir);
  }
  
  console.log("Updating database categories...");
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
  try {
    const result = await sql`
      UPDATE categories 
      SET name = REPLACE(name, 'วัสดุ', 'พัสดุ')
      WHERE name LIKE '%วัสดุ%'
    `;
    console.log(`Database updated: ${result.count} rows changed.`);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit(0);
  }
}

run();
