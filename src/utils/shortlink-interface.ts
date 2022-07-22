import { generateHash } from "./hash";
import {
  insertURLtoDB,
  retrieveURLIfExists,
  updateAccessCounter,
  openDB,
  deleteURL,
} from "./sqlite-interface";

// Use Hashtable ?
export const valid_characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const checkValidHashFormat = (hash: string) => {
    return /^[A-Za-z0-9 -]*$/.test(hash);
}

export const createNewShortenedURL = async (url: string): Promise<string> => {
  await openDB();
  let uniqueHash = false;
  let hash = url;
  const epoch = Math.round(Date.now() / 1000); // seconds epoch time
  while (!uniqueHash) {
    hash = generateHash(hash);
    const retrievedURL = await retrieveURLIfExists(hash);
    if (retrievedURL === null) {
      uniqueHash = true;
    } else if (retrievedURL === url) {
      // URL already exists
      break;
    } else {
      // uniqueHash = 
      await insertURLtoDB(hash, url, epoch);
      // console.log(uniqueHash)
      uniqueHash = true
    }
    console.log(hash)
  }
  console.log(hash)
  return hash;
};

export const resolveShortURL = async (
  hash: string
): Promise<undefined | string> => {
    await openDB();
   const validHash =  checkValidHashFormat(hash);
   if(!validHash){
    return undefined;
   }
  const retrievedURL = await retrieveURLIfExists(hash);
  if (retrievedURL === null) {
    return undefined;
  } else {
    await updateAccessCounter(hash);
    return retrievedURL;
  }
};

export const deleteShortURL = async (
  hash: string
): Promise<undefined | boolean> => {
    await openDB();
   const validHash =  checkValidHashFormat(hash);
   if(!validHash){
    return undefined;
   }
  const retrievedURL = await retrieveURLIfExists(hash);
  if (retrievedURL === null) {
    return undefined;
  } else {
    // return true;
    return await deleteURL(hash);
  }
};