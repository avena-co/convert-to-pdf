const http = require('http');
const puppeteer = require('puppeteer');
const url = require('url');

const server = http.createServer(async (req, res) => {
    // set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    // handle pre-flight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // handle favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, { 'Content-Type': 'image/x-icon' });
        res.end();
        return;
    }

    try {
        const { query } = url.parse(req.url, true);
        console.log(url);

        // create a browser instance
        const browser = await puppeteer.launch({ headless: 'new' });

        // create a new page
        const page = await browser.newPage();

        // Open URL in current page
        await page.goto(query.url, { waitUntil: 'networkidle0' });

        // To reflect CSS used for screens instead of print
        await page.emulateMediaType('screen');

        // generate pdf
        const data = await page.pdf({
            printBackground: true,
            format: 'A4',
            scale: 0.8,
        });

        // close the browser instance
        await browser.close();

        // write the response
        res.writeHead(200, { 'Content-Type': 'application/pdf' });
        res.end(data);
    }
    catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
