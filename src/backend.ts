import * as http from "http";
import * as https from "https";
import url from "url";
import fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import {
  createNewShortenedURL,
  deleteShortURL,
  resolveShortURL,
} from "./utils/shortlink-interface";
const hostname = "0.0.0.0";

const http_port = 80;
const dev_port = 8080;
const https_port = 443;
const port = dev_port;

// IncomingMessage
// ServerResponse
// "url": `${hostname}/api/${version}/shorten`,

// const ssl_certificates = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

const routeRequest = async (
  req: http.IncomingMessage,
  res: http.ServerResponse
) => {
  const requestURL = req.url!;
  if (requestURL.startsWith("/api/v1/")) {
    if (requestURL.startsWith("/api/v1/shorten")) {
      shorten(req, res);
    } else if (requestURL.startsWith("/api/v1/resolve")) {
      resolve(req, res);
    } else if (requestURL.startsWith("/api/v1/delete")) {
      deleteLink(req, res);
    } else {
      const versionInfo = {
        version: 1,
        url: requestURL,
      };
      res.end(JSON.stringify(versionInfo));
    }
  } else if (requestURL.startsWith("/resolve/")) {
    await redirect(req, res);
  } else if (requestURL.startsWith("/manage")) {
    res.writeHead(200, { "content-type": "text/html" });
    fs.createReadStream("src/static/manage.html").pipe(res);
  } else if (requestURL.startsWith("/baller")) {
    // For TAP - ACE
    if (requestURL === "/baller/solution") {
      res.setHeader(
        "Content-disposition",
        "attachment; filename=football-ranking.xlsx"
      );
      res.writeHead(200, {
        "content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.createReadStream("src/static/xlsx/football-ranking.xlsx").pipe(res);
    }else if(requestURL === "/baller/static/code.js"){
        res.writeHead(200, { "content-type": "text/javascript" });
        fs.createReadStream("src/static/js/football/code.js").pipe(res);
    }else{
        res.writeHead(200, { "content-type": "text/html" });
        fs.createReadStream("src/static/football.html").pipe(res);
    }
  } else if (requestURL === "/") {
    res.writeHead(302, {
      location: "/manage",
    });
    res.end();
  } else {
    res.end("Invalid Request");
  }
};

const deleteLink = async (req: IncomingMessage, res: ServerResponse) => {
  const reqURL = req.url!;
  const queryObject = url.parse(reqURL, true).query;
  if (typeof queryObject["hash"] !== "string") {
    res.end(JSON.stringify({ error: "Invalid hash" }));
  }
  const hash = queryObject.hash as string;
  const status = await deleteShortURL(hash);
  if (status === undefined) {
    res.end(JSON.stringify({ error: "Invalid Short link" }));
  } else {
    res.end(JSON.stringify({ success: status }));
  }
  return;
}

// TODO: Vanity URL
const shorten = async (req: IncomingMessage, res: ServerResponse) => {
  const reqURL = req.url!;
  const queryObject = url.parse(reqURL, true).query;
  if (typeof queryObject["url"] !== "string") {
    res.end(JSON.stringify({ error: "Invalid url" }));
  }
  const submittedURL = queryObject.url as string;
  const shortenedURL = await createNewShortenedURL(submittedURL);
  res.end(JSON.stringify({ url: shortenedURL }));
  return;
};
const resolve = async (req: IncomingMessage, res: ServerResponse) => {
  const reqURL = req.url!;
  const queryObject = url.parse(reqURL, true).query;
  if (typeof queryObject["hash"] !== "string") {
    res.end(JSON.stringify({ error: "Invalid hash" }));
  }
  const hash = queryObject.hash as string;
  const resolvedURL = await resolveShortURL(hash);
  if (resolvedURL === undefined) {
    res.end(JSON.stringify({ error: "Invalid Short link" }));
  } else {
    res.end(JSON.stringify({ url: resolvedURL }));
  }
  return;
};

const redirect = async (req: IncomingMessage, res: ServerResponse) => {
  const reqURL = req.url!;
  const hash = reqURL.substring(reqURL.indexOf("/resolve/") + 9);
  const resolvedURL = await resolveShortURL(hash);
  if (resolvedURL === undefined) {
    res.end("Invalid Short link");
  } else {
    res.writeHead(302, {
      location: resolvedURL,
    });
    res.end();
  }
  return;
};

const server = http.createServer();

// TODO: HTTPS web host
// const server = https.createServer();
// server.setSecureContext(ssl_certificates)

server.on("request", async (req, res) => {
  await routeRequest(req, res);
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
