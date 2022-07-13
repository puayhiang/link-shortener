import { createHash } from "node:crypto";

export const generateHash = (url: string): string => {
    //TODO Convert B64 to B62
    const hash = createHash('sha256');
    hash.update(url);
    return hash.digest('base64');
}

