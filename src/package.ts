// 1. get metadata from npm 
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import https from "https";
import { writeFile } from "fs/promises";
import crypto from 'crypto';
import zlib from 'zlib';
import * as tar from 'tar';


const npm_registry_url = "https://registry.npmjs.org";
const DIST_DIR = "./dist";
// const TARBALL_DIR = "./dist/tarballs";
const PACKAGE_DIR = "./dist/packages";

interface PackageMetadata {
    name: string;
    version: string;
    dist: {
        tarball: string;
        shasum: string;
        integrity: string;
    },
    repository: {
        type: string;
        url: string;
    },
    author: string | { name: string } | undefined;
    license?: string;
    homepage?: string;
    keywords?: string[];
    dependencies?: {
        [key: string]: string;
    }
}

const ensureDistDir = () => {
    if (!existsSync(DIST_DIR)) {
        mkdirSync(DIST_DIR);
    }
};

const ensurePackageDir = () => {
    if (!existsSync(PACKAGE_DIR)) {
        mkdirSync(PACKAGE_DIR);
    }
}

const getPackageMetadata = async (packageName: string): Promise<PackageMetadata> => {
    try {
        const response = await fetch(`${npm_registry_url}/${packageName}`);
        if (!response.ok) throw new Error(`Failed to fetch metadata for ${packageName}`);

        const data = await response.json();

        const {"dist-tags": dist_tags, versions} = data;
        const latestVersionNum = dist_tags.latest;
        const latestVersion = versions[latestVersionNum]

        console.log(`Fetched metadata for ${packageName}@${latestVersion.version}`);
        await writeFile(`./dist/${packageName}-metadata.json`, JSON.stringify(latestVersion, null, 2));

        return latestVersion;

    } catch (error){
        console.log("Failed to get metadata for the package: ", packageName);
        console.error(`Error getting metadata for ${packageName}:`, error);
        throw error;
    }
}


const downloadTarball = async (tarball_url: string, filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        https.get(tarball_url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download tarball: HTTP ${res.statusCode}`));
                return;
            }
            const fileStream = createWriteStream(filePath);
            res.pipe(fileStream)

            fileStream.on("finish", () => {
                resolve();
            });
    
            fileStream.on("error", (err) => {
                reject(new Error(`Stream error while writing tarball: ${err.message}`));
            });
        }).on("error", reject);
    });
}

const verifyHash = async (filePath: string, shasum: string): Promise<void> => {
    const hash = crypto.createHash("sha1");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => {
        hash.update(chunk);
    });
    stream.on("end", () => {
        const calculatedHash = hash.digest("hex");
        if (calculatedHash === shasum) {
            console.log('Integrity check passed.');
            // Next: extract
          } else {
            console.error('Integrity check failed!');
          }
    });
}

const extractTarball = (filePath: string, packageName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const packageExtractedDir = `${PACKAGE_DIR}/${packageName}`;
        if (!existsSync(packageExtractedDir)) {
            mkdirSync(packageExtractedDir, { recursive: true });
        }

        const extractStream = tar.x({ 
            C: packageExtractedDir,
            strip: 1,
        });

        createReadStream(filePath)
            .pipe(zlib.createGunzip())
            .pipe(extractStream)
            .on("finish", () => {
                console.log(`✅ Extracted ${filePath} to ${PACKAGE_DIR}`);
                resolve(packageExtractedDir);
            })
            .on("error", (err) => {
                console.error(`❌ Error extracting tarball: ${err.message}`);
                reject(err);
            });
    });
};



const downloadPackage = async (packageName: string): Promise<string> => {
    ensureDistDir();
    // get metadata
    const {name, version, dist} = await getPackageMetadata(packageName);
    const {tarball, shasum, integrity} = dist;

    const outFilePath = `./dist/${name}-${version}.tgz`;
    console.log({name, version, tarball, shasum, integrity});

    // download tarball
    console.log(`Downloading ${name}@${version}...`);
    await downloadTarball(tarball, outFilePath);
    // verify integrity
    console.log(`Verifying integrity of ${name}@${version}...`);
    await verifyHash(outFilePath, shasum);
    // extract
    console.log(`Extracting ${name}@${version}...`);
    const extractedDir = await extractTarball(outFilePath, name);
    console.log(`Extracted to ${extractedDir}`);
    // save to dist
    // return the path to the extracted package
    return extractedDir;
}

downloadPackage("lodash")
   .then(path => console.log(`Package downloaded to ${path}`))
   .catch(err => console.error("Error downloading package:", err));