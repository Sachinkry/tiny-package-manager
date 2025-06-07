export function logInfo(message: string): void {
    console.log(`[INFO] ${message}`);
  }
  
export function logError(message: string, error?: Error): void {
console.error(`[ERROR] ${message}${error ? `: ${error.message}` : ''}`);
}

// TODO: progress bar

