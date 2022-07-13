import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
const hostname = '127.0.0.1';
const port = 3000;

// IncomingMessage
// ServerResponse
// "url": `${hostname}/api/${version}/shorten`,

const routeRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
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
    else if (!requestURL.startsWith("/resolve/")) {
        redirect(req, res);
    }
    else {
        res.end("Invalid Request");
    }
};
const retrieveURL = (hash: string, req: IncomingMessage) => {
};
const shorten = (req: IncomingMessage, res: ServerResponse) => {
    // console.log(res)
};
const resolve = (req: IncomingMessage, res: ServerResponse) => {
    // console.log(res)
};
const redirect = (req: IncomingMessage, res: ServerResponse) => {
    // console.log(res)
};
const server = http.createServer();
server.on('request', async (req, res) => {
    await routeRequest(req, res);
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/plain');
    // res.end('Hello World');
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
