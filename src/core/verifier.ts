import { createReadStream } from 'fs';
import crypto from 'crypto';
import { logError, logInfo } from '../utils/logger';

export async function verifyIntegrity(filePath: string, integrity: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => {
      const calculatedHash = hash.digest('base64');
      const expectedHash = integrity.replace(/^sha512-/, '');
      if (calculatedHash === expectedHash) {
        logInfo('Integrity check passed');
        resolve();
      } else {
        logError('Integrity check failed');
        reject(new Error('Integrity check failed'));
      }
    });
    stream.on('error', (err) => {
      logError(`Error reading file for verification`, err);
      reject(err);
    });
  });
}