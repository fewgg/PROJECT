const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace variations
  let newContent = content
    .replace(/ระบบคลังพัสดุ NMC/g, 'ระบบคลังพัสดุ')
    .replace(/NMC Inventory System/g, 'Inventory System')
    .replace(/NMC INVENTORY/g, 'INVENTORY SYSTEM')
    .replace(/ระบบบริหารจัดการคลังพัสดุ NMC/g, 'ระบบบริหารจัดการคลังพัสดุ')
    .replace(/ระบบคลังพัสดุ NMC\./g, 'ระบบคลังพัสดุ.');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'app'));
walkDir(path.join(__dirname, 'components'));
console.log('Done replacing NMC.');
