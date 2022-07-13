import * as sqlite3 from "sqlite3";
import { open } from "sqlite";

import { generateHash } from "../utils/hash";

let db: any;

async function openDB() {
  db = await open({
    filename: "link-shortener.db",
    driver: sqlite3.cached.Database,
  });
}

const createDB = async () => {
  await db.exec(`CREATE TABLE IF NOT EXISTS shortened (
        hash TEXT PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        epoch INTEGER NOT NULL
    )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS access (
        hash TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        FOREIGN KEY(hash) REFERENCES shortened(hash)
    )`);
};

const createNewShortenedURL = async (url: string) => {
  let uniqueHash = false;
  let hash = url;
  const epoch = Math.round(Date.now() / 1000); // seconds epoch time
  while (!uniqueHash) {
    hash = generateHash(hash);
    const retrievedURL = await retrieveHashIfExists(hash);
    if (retrievedURL === null) {
      uniqueHash = true;
    } else if (retrievedURL === url) {
      // URL already exists
      break;
    } else {
      uniqueHash = await insertURLtoDB(hash, url, epoch);
    }
  }
  return hash;
};

const insertURLtoDB = async (hash: string, url: string, epoch: number) => {
  try {
    const results = await db.run(
      `INSERT INTO shortened 
                    (hash, url, epoch)
                    VALUES 
                    (?, ?, ?)`,
      hash,
      url,
      epoch
    );
  } catch (e: any) {
    if (e.errno === 19) {
      // Hash exists
      return false;
    }
  }
  return true;
};

const retrieveHashIfExists = async (
  hash: string
): Promise<string | undefined> => {
  const result = await db.get(
    `SELECT shortened.url FROM shortened WHERE hash = :hash`,
    { ":hash": hash }
  );
  if (result === undefined) {
    return undefined;
  } else {
    return result.url;
  }
};

const closeDB = async () => {
  await db.close();
};

module.exports = { createNewShortenedURL, retrieveHashIfExists, closeDB, openDB };

const seed = async (): Promise<void> => {
  await openDB();
  await createDB();
  console.log(await createNewShortenedURL("http://google.com"));
  console.log(
    await retrieveHashIfExists("qiI5wXYJsh66A0xWSvh48+7IzoPtDydoWX0rwv1OTaU==")
  );
  await closeDB();
};

if (require.main === module) {
  seed();
}
