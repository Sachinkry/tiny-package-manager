import { createReadStream, existsSync, mkdirSync } from 'fs';
import * as tar from 'tar';
import { PACKAGE_DIR } from '../utils/fs';
import { logError, logInfo } from '../utils/logger';
import zlib from 'zlib';

export async function extractTarball(filePath: string, packageName: string): Promise<string> {
  const packageExtractedDir = `${PACKAGE_DIR}/${packageName}`;
  if (!existsSync(packageExtractedDir)) {
    mkdirSync(packageExtractedDir, { recursive: true });
  }
  return new Promise((resolve, reject) => {
    const extractStream = tar.x({
      C: packageExtractedDir,
      strip: 1,
    });
    createReadStream(filePath)
      .pipe(zlib.createGunzip())
      .pipe(extractStream)
      .on('finish', () => {
        logInfo(`Extracted ${filePath} to ${packageExtractedDir}`);
        resolve(packageExtractedDir);
      })
      .on('error', (err) => {
        logError(`Error extracting tarball`, err);
        reject(err);
      });
  });
}