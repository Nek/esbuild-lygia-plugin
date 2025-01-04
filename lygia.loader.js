const path = require('path');

const CACHE_DIR = path.join(process.cwd(), '.lygia-cache');
const PROJECT_ROOT = process.cwd();

async function importDeps() {
  const [{ default: fetch }, fs] = await Promise.all([
    import('node-fetch'),
    import('fs/promises')
  ]);
  return { fetch, fs };
}

async function ensureCacheDir() {
  const { fs } = await importDeps();
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function getCachedFile(url) {
  const { fetch, fs } = await importDeps();
  const filename = path.join(CACHE_DIR, Buffer.from(url).toString('base64'));
  try {
    return await fs.readFile(filename, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const content = await response.text();
    await fs.writeFile(filename, content);
    return content;
  }
}

async function getLocalFile(filepath) {
  const { fs } = await importDeps();
  try {
    return await fs.readFile(filepath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read local file ${filepath}: ${err.message}`);
  }
}

async function resolveLygia(source, resourcePath) {
  await ensureCacheDir();
  
  const lines = source.split(/\r?\n/);
  const resolvedLines = await Promise.all(
    lines.map(async (line) => {
      const line_trim = line.trim();
      if (line_trim.startsWith('#include "')) {
        const includePath = line_trim.substring(9).replace(/\"|\;|\s/g, '');
        
        if (includePath.startsWith('lygia')) {
          const include_url = 'https://lygia.xyz' + 
            includePath.substring(5);
          return await getCachedFile(include_url);
        } else {
          // Resolve local path relative to the current shader file
          const localPath = path.resolve(path.dirname(resourcePath), includePath);
          return await getLocalFile(localPath);
        }
      }
      return line;
    })
  );

  return resolvedLines.join('\n');
}

module.exports = async function(source) {
  const callback = this.async();
  try {
    const result = await resolveLygia(source, this.resourcePath);
    callback(null, result);
  } catch (err) {
    callback(err);
  }
};
