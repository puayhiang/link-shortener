import * as http from 'http';
import url from 'url';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { createNewShortenedURL, resolveShortURL } from './utils/shortlink-interface';
const hostname = '127.0.0.1';
const port = 3000;

// IncomingMessage
// ServerResponse
// "url": `${hostname}/api/${version}/shorten`,

const routeRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const requestURL = req.url!;
    if (requestURL.startsWith("/api/v1/")) {
        if (requestURL.startsWith("/api/v1/shorten")) {
            shorten(req, res);
        }
        else if (requestURL.startsWith("/api/v1/resolve")) {
            resolve(req, res);
        }
        else {
            const versionInfo = {
                "version": 1,
                "url": requestURL
            };
            res.end(JSON.stringify(versionInfo));
        }
    }
    else if (requestURL.startsWith("/resolve/")) {
        await redirect(req, res);
    }else if(requestURL.startsWith("/manage")){
        res.writeHead(200, { 'content-type': 'text/html' })
        fs.createReadStream('index.html').pipe(res)
    }else if(requestURL.startsWith("/")){
        res.writeHead(302, {
            location: '/manage',
        });
        res.end();
    }else {
        res.end("Invalid Request");
    }
};

const shorten = async (req: IncomingMessage, res: ServerResponse) => {
    const reqURL = req.url!;
    const queryObject = url.parse(reqURL, true).query;
    if(typeof queryObject['url'] !== 'string'){
        res.end(JSON.stringify({"error": "Invalid url"}))
    }
    const submittedURL = queryObject.url as string;
    const shortenedURL = await createNewShortenedURL(submittedURL)
    res.end(JSON.stringify({"url": shortenedURL}))
    return;
};
const resolve = async (req: IncomingMessage, res: ServerResponse) => {
    const reqURL = req.url!;
    const queryObject = url.parse(reqURL, true).query;
    if(typeof queryObject['hash'] !== 'string'){
        res.end(JSON.stringify({"error": "Invalid hash"}))
    }
    const hash = queryObject.hash as string;
    const resolvedURL = await resolveShortURL(hash)
    if(resolvedURL === undefined){
        res.end("Invalid Short link")
    }else{
        res.end(JSON.stringify({"url": resolvedURL}))
    }
    return;
};

const redirect = async (req: IncomingMessage, res: ServerResponse) => {
    const reqURL = req.url!;
    const hash = reqURL.substring(reqURL.indexOf('/resolve/') + 9);
    const resolvedURL = await resolveShortURL(hash)
    if(resolvedURL === undefined){
        res.end("Invalid Short link")
    }else{
        res.writeHead(302, {
            location: resolvedURL,
        });
        res.end();
    }
    return;
};

const server = http.createServer();
server.on('request', async (req, res) => {
    await routeRequest(req, res);
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
