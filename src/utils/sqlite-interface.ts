// const sqlite3 = require('sqlite3').verbose();



// import  sqlite3  from 'sqlite3'
// sqlite3.verbose()

// const open = require('sqlite').open

import * as sqlite3 from "sqlite3";
import { open } from "sqlite";


import { generateHash } from '../utils/hash'

// const db = new sqlite3.Database(':memory:'); //Memory DB
// const db = new sqlite3.Database(':memory:'); //Disk DB, delete on close
// const db = new sqlite3.Database();

let db: any;

// open the database

// you would have to import / invoke this in another file
async function openDb() {
  db = await open({
    filename: "link-shortener.db",
    driver: sqlite3.cached.Database,
  });
}

// db = await open({
//     filename: "link-shortener.db",
//     driver: sqlite3.cached.Database,
// })

// openDb().then((db) => {

// })

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
  while (!uniqueHash) {
    hash = generateHash(hash);
    const retrievedURL = retrieveHashIfExists(hash);
    if (retrievedURL === null) {
      uniqueHash = true;
    }
  }
  const epoch = Date.now() / 1000; // seconds epoch time
  insertURLtoDB(hash, url, epoch);
};

const insertURLtoDB = async (hash: string, url: string, epoch: number) => {
  const results = await db.run(`INSERT INTO shortened 
                    (hash, url, epoch)
                    VALUES 
                    (?, ?, ?)`, hash, url, epoch);
  console.log(results);
  // })
};

const retrieveHashIfExists = async (hash: string): Promise<string | undefined> => {
  const result = await db.get(`SELECT shortened.url FROM shortened WHERE hash = :hash`, {':hash': hash});
  if( result === undefined){
    return undefined;
  }else{
    return result.url;
  }
};

const closeDB = async () => {
  await db.close();
};

module.exports = { createNewShortenedURL, retrieveHashIfExists, closeDB };

const seed = async (): Promise<void> => {
    await openDb();
    console.log("here")
    await createDB();console.log("here")
    // await insertURLtoDB("asd",'dsa',123);console.log("here")
    await retrieveHashIfExists("asdd");console.log("here")
    await closeDB();console.log("here")
    console.log("DB Created");
};

if (require.main === module) {
  seed()//.catch(console.error);
}
