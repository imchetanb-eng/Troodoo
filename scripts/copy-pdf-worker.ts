import fs from 'fs';
import path from 'path';

const source = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const target = path.join(process.cwd(), 'public', 'pdf.worker.min.mjs');

console.log("Copying pdf worker from", source, "to", target);
try {
  fs.copyFileSync(source, target);
  console.log("Worker copied successfully.");
} catch (err) {
  console.error("Failed to copy worker:", err);
}
