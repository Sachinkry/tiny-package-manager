import { downloadTarball } from "./core/downloader.js";
import { extractTarball } from "./core/extractor.js";
import { getPackageMetadata } from "./core/registry.js";
import { verifyIntegrity } from "./core/verifier.js";
import { ensureDirectories, TARBALL_DIR } from "./utils/fs.js";
import { logInfo } from "./utils/logger.js";


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
if (require.main === module) {
  downloadPackage('lodash')
    .then((path) => console.log(`Package downloaded to ${path}`))
    .catch((err) => console.error('Error downloading package:', err));
}