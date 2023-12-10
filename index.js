const express = require('express');
const puppeteer = require('puppeteer');
const url = require('url');

const app = express();

// Enable CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

app.get('/convert-to-pdf', async (req, res) => {
    const { source } = req.query;

    if (!source) {
        return res.status(400).json({ error: 'Missing source query parameter' });
    }

    try {
        const { query } = url.parse(req.url, true);

        // create a browser instance
        const browser = await puppeteer.launch({ headless: 'new' });

        // create a new page
        const page = await browser.newPage();

        // Open URL in current page
        await page.goto(query.source, { waitUntil: 'networkidle0' });

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

        res.setHeader('Content-Type', 'application/pdf');
        res.send(data);
    }
    catch (error) {
        console.error('Error converting to PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
