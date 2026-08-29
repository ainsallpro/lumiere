import fs from 'fs';
import path from 'path';

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const srcDir = 'd:/Furniter_ain/src';
const files = findFiles(srcDir, /\.(tsx|ts)$/);

const urlRegex = /https?:\/\/[^\s"'`]+/g;
const uniqueUrls = new Set();
const urlLocations = {};

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0];
    uniqueUrls.add(url);
    if (!urlLocations[url]) {
      urlLocations[url] = [];
    }
    urlLocations[url].push(file.replace(/\\/g, '/').replace('d:/Furniter_ain/', ''));
  }
}

console.log(JSON.stringify(urlLocations, null, 2));
