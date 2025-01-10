import path from 'path';
import fetch from 'node-fetch';
import * as fs from 'fs/promises';

const CACHE_DIR = path.join(process.cwd(), '.lygia-cache');

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function getCachedFile(url) {
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


async function resolveLygia(source, filePath, visited = new Set()) {
  await ensureCacheDir();
  
  if (visited.has(filePath)) {
    throw new Error(`Circular dependency detected: ${filePath}`);
  }
  visited.add(filePath);

  const lines = source.split(/\r?\n/);
  const resolvedLines = await Promise.all(
    lines.map(async (line) => {
      const line_trim = line.trim();
      if (line_trim.startsWith('#include "')) {
        const includePath = line_trim.substring(9).replace(/\"|\;|\s/g, '');
        
        if (includePath.startsWith('lygia')) {
          const include_url = 'https://lygia.xyz' + 
            includePath.substring(5);
          const content = await getCachedFile(include_url);
          // Recursively resolve any includes in the lygia file
          return await resolveLygia(content, include_url, new Set(visited));
        } else {
          // Resolve local path relative to the current shader file
          // For local files, resolve path and read directly
          const localPath = path.resolve(path.dirname(filePath), includePath);
          const content = await fs.readFile(localPath, 'utf8');
          // Recursively resolve any includes in the local file
          return await resolveLygia(content, localPath, new Set(visited));
        }
      }
      return line;
    })
  );

  return resolvedLines.join('\n');
}

export default function lygiaPlugin() {
  return {
    name: 'lygia',
    setup(build) {
      // Handle .glsl, .vert, and .frag files
      build.onLoad({ filter: /\.(glsl|vert|frag)$/ }, async (args) => {
        const source = await fs.readFile(args.path, 'utf8');
        const contents = await resolveLygia(source, args.path);
        
        return {
          contents,
          loader: 'text'
        };
      });
    }
  };
}
