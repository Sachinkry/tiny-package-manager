import https from "https";
import { createWriteStream } from "fs";
import { logError, logInfo } from "../utils/logger.js";
import { cleanupFile } from "../utils/fs.js";

// TODO: add p-retry to handle network errors

export async function downloadTarball(tarballUrl: string, filePath: string): Promise<void>  {
    return new Promise((resolve, reject) => {
        https.get(tarballUrl, {timeout: 30000}, (res) => {
            if (res.statusCode !== 200) {
                cleanupFile(filePath);
                reject(new Error(`Failed to download tarball: HTTP ${res.statusCode}`));
                return;
            }

            const fileStream = createWriteStream(filePath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                logInfo(`Downloaded tarball to ${filePath}`);
                resolve();
            });
            fileStream.on('error', (err) => {
                cleanupFile(filePath);
                fileStream.close();
                logError(`Stream error while downloading tarball`, err);
                reject(err);
            });

        }).on('error', (err) => {
            cleanupFile(filePath);
            logError(`Failed to download tarball`, err);
            reject(err);
        });
    })
}