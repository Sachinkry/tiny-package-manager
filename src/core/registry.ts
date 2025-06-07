import { writeFile } from "node:fs/promises";
import type { PackageMetadata } from "../types/index.js";
import { logError, logInfo } from "../utils/logger.js";

const NPM_REGISTRY_URL = "https://registry.npmjs.org";

// TODO: add semver check to resolve the latest version

export async function getPackageMetadata(packageName: string): Promise<PackageMetadata> {
    const encodedName = encodeURIComponent(packageName);
    const url = `${NPM_REGISTRY_URL}/${encodedName}`;

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const { 'dist-tags': distTags, versions } = data;
        const latestVersion = distTags.latest;
        const metadata = versions[latestVersion];

        if (!metadata) {
        throw new Error(`No metadata for version ${latestVersion}`);
        }
        logInfo(`Fetched metadata for ${packageName}@${metadata.version}`);
        await writeFile(`dist/${packageName}-metadata.json`, JSON.stringify(metadata, null, 2));
        return metadata;
    } catch (error) {
        logError(`Failed to fetch metadata for ${packageName}`, error as Error);
        throw error;
    }
}