# Wordle Answer Revealer

A full-stack application that fetches, caches, and archives official Wordle solutions. It allows users to view the answer for any given date and provides a rich preview for social media sharing.

## Features

- **Historical Archive**: specific navigation to view Wordle answers for any date (past or future).
- **Answer Reveal**: "Spoiler-free" by default; blurring the answer until revealed.
- **Smart Caching**: Minimizes requests to the NYT API by caching results in a local SQLite database.
- **Social Sharing**: Server-side injection of "Yesterday's Answer" into OpenGraph tags for dynamic link previews on Discord and Twitter.
- **Rate Limiting & Security**: Built-in protection against abuse with rate limiting and security headers.
- **Dark Mode**: Toggle between light and dark themes.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Vanilla CSS
- **Backend**: Node.js, Express, Better-SQLite3
- **Database**: SQLite (`wordle.db`)

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd wordle-answer
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

## Running Locally

To run the full application in development mode, you need to start both the backend server and the frontend client.

1.  **Start the Backend Server:**
    Open a terminal, navigate to the `server` directory, and run:
    ```bash
    cd server
    npm run dev
    ```
    This runs the server at `http://localhost:3000`.

2.  **Start the Frontend Client:**
    Open a *new* terminal, navigate to the project root, and run:
    ```bash
    npm run dev
    ```
    This runs the client at `http://localhost:5173` (proxies API requests to port 3000).

## Building for Production

1.  **Build the Frontend:**
    ```bash
    npm run build
    ```
    This compiles the React app into the `dist` folder.

2.  **Start the Production Server:**
    ```bash
    cd server
    npm start
    ```
    The server will serve the static files from `../dist` and handle API requests.

## API Endpoints

-   `GET /api/word/:date`
    -   Fetches the Wordle data for a specific date (YYYY-MM-DD).
    -   Returns: `{ solution, print_date, days_since_launch }`.

## License

MIT
