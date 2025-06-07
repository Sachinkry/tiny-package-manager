import { existsSync, mkdirSync, promises as fs } from 'fs';

export const DIST_DIR = './dist';
export const TARBALL_DIR = `${DIST_DIR}/tarballs`;
export const PACKAGE_DIR = `${DIST_DIR}/packages`;

export function ensureDirectories(): void {
  if (!existsSync(DIST_DIR)) {
    mkdirSync(DIST_DIR, { recursive: true });
  }
  if (!existsSync(TARBALL_DIR)) {
    mkdirSync(TARBALL_DIR, { recursive: true });
  }
  if (!existsSync(PACKAGE_DIR)) {
    mkdirSync(PACKAGE_DIR, { recursive: true });
  }
}

export async function cleanupFile(filePath: string): Promise<void> {
  if (existsSync(filePath)) {
    await fs.unlink(filePath).catch((err) => {
      console.error(`Failed to clean up ${filePath}: ${err.message}`);
    });
  }
}