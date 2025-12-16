const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getWordByDate, saveWord } = require('./db');

const app = express();
app.set('trust proxy', 1); // Trust first proxy
const PORT = 3000;

// Security headers
app.use((req, res, next) => {
    // Basic hardening
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    // Adjust if you ever load external scripts/fonts/CDNs
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'"
    );

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature-Policy)
    res.setHeader(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), fullscreen=(self)'
    );

    next();
});

// CORS configuration - restrict in production
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN : '*',
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' })); // Limit payload size

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 500; // 500 requests per minute

// Rate limiting middleware
const rateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }

    const record = rateLimitMap.get(ip);

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }

    if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    record.count++;
    next();
};

// Date validation
const isValidDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
};

// Get word by date
app.get('/api/word/:date', rateLimit, async (req, res) => {
    try {
        const { date } = req.params;

        // Input validation
        if (!isValidDate(date)) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Check database first
        let cached;
        try {
            cached = getWordByDate(date);
        } catch (dbError) {
            console.error('Database error during read:', dbError);
            // Fall through to fetch from NYT
        }

        if (cached) {
            console.log(`Cache hit for ${date}`);
            // Return only necessary data
            return res.json({
                solution: cached.solution,
                print_date: cached.print_date,
                days_since_launch: cached.days_since_launch
            });
        }

        // Fetch from NYT API
        console.log(`Cache miss for ${date}, fetching from NYT...`);
        const response = await fetch(`https://www.nytimes.com/svc/wordle/v2/${date}.json`);

        if (!response.ok) {
            return res.status(404).json({ error: 'Word not found' });
        }

        const data = await response.json();

        // Save to database
        saveWord(date, data);
        console.log(`Saved ${date} to database`);

        // Return only necessary data (minimize exposure)
        res.json({
            solution: data.solution,
            print_date: data.print_date,
            days_since_launch: data.days_since_launch
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 404 handler
// Serve static files from dist, but ignore index.html so we can serve it dynamically
app.use(express.static(path.join(__dirname, '../dist'), { index: false }));

// Helper to get yesterday's date string YYYY-MM-DD
// Helper to get yesterday's date string YYYY-MM-DD in New York time (Wordle's timezone)
function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

// Catch-all handler for index.html (SPA support + OpenGraph injection)
app.get('*', async (req, res) => {
    try {
        // Tell social bots (Discord, Twitter) to cache this for only 1 hour
        // This ensures that when the day changes, they fetch the new word relatively quickly
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const yesterday = getYesterdayDate();
        let solution = 'UNKNOWN';

        // Try DB first
        let cached;
        try {
            cached = getWordByDate(yesterday);
        } catch (dbError) {
            console.error('Database error during OG tag generation:', dbError);
            // Fall through to fetch from NYT
        }

        if (cached) {
            solution = cached.solution;
        } else {
            // Try fetching from NYT
            try {
                const response = await fetch(`https://www.nytimes.com/svc/wordle/v2/${yesterday}.json`);
                if (response.ok) {
                    const data = await response.json();
                    saveWord(yesterday, data);
                    solution = data.solution;
                }
            } catch (e) {
                console.error('Failed to fetch word for OG tag:', e);
            }
        }

        // Read index.html template
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(indexPath)) {
            let html = fs.readFileSync(indexPath, 'utf8');
            html = html.replace('{{YESTERDAY_WORDLE}}', solution.toUpperCase());
            res.send(html);
        } else {
            res.status(404).send('index.html not found. Run build first.');
        }
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
