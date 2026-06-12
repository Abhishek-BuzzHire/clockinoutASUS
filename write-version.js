const fs = require('fs');
const path = require('path');

const version = Date.now().toString();
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'version.txt'), version);
console.log(`Version generated: ${version}`);
