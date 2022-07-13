import { createHash } from "crypto";

// https://stackoverflow.com/questions/4567089/hash-function-that-produces-short-hashes

export const generateHash = (url: string): string => {
    //TODO Convert B64 to B62
    const hash = createHash('sha256');
    hash.update(url);
    return hash.digest('hex').substring(0,5);
}

