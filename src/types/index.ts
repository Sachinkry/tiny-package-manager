export interface PackageMetadata {
    name: string;
    version: string;
    dist: {
      tarball: string;
      shasum?: string;
      integrity: string;
    };
    repository?: {
      type: string;
      url: string;
    };
    author?: string | { name?: string };
    license?: string;
    homepage?: string;
    keywords?: string[];
    dependencies?: Record<string, string>;
  }