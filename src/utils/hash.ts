import { createHash } from "crypto";

export const generateHash = (url: string): string => {
    //TODO Convert B64 to B62
    const hash = createHash('sha256');
    hash.update(url);
    return hash.digest('hex').substring(0,5);
}

