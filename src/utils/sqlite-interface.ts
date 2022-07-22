import * as sqlite3 from "sqlite3";
import { open } from "sqlite";

let db: any;

export async function openDB() {
  db = await open({
    filename: "link-shortener.sqlite",
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

export const insertURLtoDB = async (hash: string, url: string, epoch: number) => {
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
    console.log(e)
    if (e.errno === 19) {
      // Hash exists
      return false;
    }
  }
  return true;
};

export const updateAccessCounter = async (
  hash: string
) => {
  // SET TableField = TableField + 1
  // UPDATE TableName SET TableField = TableField + 1 WHERE SomeFilterField = @ParameterID
  // const result = await db.get(
    
  //   `SELECT shortened.url FROM shortened WHERE hash = :hash`,
  //   { ":hash": hash }
  // );
  // if (result === undefined) {
  //   return undefined;
  // } else {
  //   return result.url;
  // }
}

export const retrieveURLIfExists = async (
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

export const deleteURL = async (
  hash: string
): Promise<boolean | undefined> => {
  const result = await db.run(
    `DELETE FROM shortened WHERE hash = :hash`,
    { ":hash": hash }
  );
  if (result === undefined) {
    return undefined;
  } else {
    return result.changes === 1;
  }
};

export const closeDB = async () => {
  await db.close();
};

const seed = async (): Promise<void> => {
  await openDB();
  await createDB();
  console.log(await insertURLtoDB("qiI5wXYJsh66A0xWSvh48+7IzoPtDydoWX0rwv1OTaU==","http://google.com",1));
  console.log(
    await retrieveURLIfExists("qiI5wXYJsh66A0xWSvh48+7IzoPtDydoWX0rwv1OTaU==")
  );
  console.log(
    await deleteURL("qiI5wXYJsh66A0xWSvh48+7IzoPtDydoWX0rwv1OTaU==")
  );
  await closeDB();
};

if (require.main === module) {
  seed();
}
