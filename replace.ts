import fs from 'fs';
import path from 'path';

function replaceInDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/clearmark/g, 'troodoo');
      content = content.replace(/ClearMark/g, 'Troodoo');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

replaceInDirectory('./app');
console.log('Replacement complete.');
