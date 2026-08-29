import fs from 'fs';
import path from 'path';
import https from 'https';

const SRC_DIR = './src';
const PUBLIC_DIR = './public/images';

// Helper to ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ensure base directories exist
['products', 'hero', 'categories', 'team', 'about'].forEach(d => ensureDir(path.join(PUBLIC_DIR, d)));

// Helper to find files recursively
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

// Download image from URL and save to path
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(); // Skip if already downloaded
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// A dictionary to store unique URL to Local Path mappings
const urlMap = {};
const counters = {
  product: 1,
  category: 1,
  hero: 1,
  team: 1,
  about: 1,
  misc: 1
};

function getCategoryPath(file, url) {
  let cat = 'misc';
  let folder = '';
  
  const fName = path.basename(file).toLowerCase();
  
  if (fName === 'products.ts') { cat = 'product'; folder = 'products'; }
  else if (fName === 'categoriespage.tsx') { cat = 'category'; folder = 'categories'; }
  else if (fName === 'aboutpage.tsx') { 
    if (url.includes('w=400') || url.includes('w=80')) { cat = 'team'; folder = 'team'; } // heuristic for avatars
    else { cat = 'about'; folder = 'about'; }
  }
  else if (fName === 'productdetailpage.tsx') { cat = 'team'; folder = 'team'; }
  else if (fName === 'homepage.tsx') { cat = 'hero'; folder = 'hero'; }
  
  if (!folder) folder = 'misc';
  
  return { cat, folder };
}

async function run() {
  console.log('Scanning files...');
  const files = findFiles(SRC_DIR, /\.(tsx|ts)$/);
  const urlRegex = /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g;

  // 1. Gather all URLs and assign local paths
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const url = match[0];
      if (!urlMap[url]) {
        const { cat, folder } = getCategoryPath(file, url);
        const ext = '.jpg';
        const filename = `${cat}-${counters[cat]++}${ext}`;
        const localRelPath = `/images/${folder}/${filename}`;
        const absoluteDest = path.join(PUBLIC_DIR, folder, filename);
        
        ensureDir(path.dirname(absoluteDest));
        urlMap[url] = { localRelPath, absoluteDest };
      }
    }
  }

  const urls = Object.keys(urlMap);
  console.log(`Found ${urls.length} unique external images to download.`);

  // 2. Download all images
  console.log('Downloading images (this may take a minute)...');
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const dest = urlMap[url].absoluteDest;
    try {
      await downloadImage(url, dest);
      process.stdout.write('.');
    } catch (e) {
      console.error(`\nError downloading ${url}:`, e.message);
    }
  }
  console.log('\nDownloads complete.');

  // 3. Replace in files
  console.log('Updating source files...');
  let replacedCount = 0;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    for (const url of urls) {
      if (content.includes(url)) {
        // use split join to replace all occurrences in the file
        content = content.split(url).join(urlMap[url].localRelPath);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      replacedCount++;
    }
  }

  console.log(`Updated ${replacedCount} files with local image paths.`);
  console.log('Migration completed successfully!');
}

run().catch(console.error);
