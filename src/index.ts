import { downloadTarball } from "./core/downloader";
import { extractTarball } from "./core/extractor";
import { getPackageMetadata } from "./core/registry";
import { verifyIntegrity } from "./core/verifier";
import { ensureDirectories, TARBALL_DIR } from "./utils/fs";
import { logInfo } from "./utils/logger";


export async function downloadPackage(packageName: string): Promise<string> {
  ensureDirectories();
  const metadata = await getPackageMetadata(packageName);
  const { name, version, dist } = metadata;
  const outFilePath = `${TARBALL_DIR}/${name}-${version}.tgz`;
  logInfo(`Downloading ${name}@${version}...`);
  await downloadTarball(dist.tarball, outFilePath);
  logInfo(`Verifying integrity of ${name}@${version}...`);
  await verifyIntegrity(outFilePath, dist.integrity);
  logInfo(`Extracting ${name}@${version}...`);
  const extractedDir = await extractTarball(outFilePath, name);
  console.log(`✅ Package downloaded to ${extractedDir}`);
  return extractedDir;
}

// Temporary entry point for testing
downloadPackage('smallest')
  .then((path) => console.log(`Package downloaded to ${path}`))
  .catch((err) => console.error('Error downloading package:', err));