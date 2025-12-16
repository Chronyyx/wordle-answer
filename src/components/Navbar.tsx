import { useEffect, useState } from 'react';

import blackBgLogo from '/WRDL_black_bg.svg';
import whiteBgLogo from '/WRDL_white_bg.svg';
import { ThemeToggle } from './ThemeToggle';
import './Navbar.css';

export function Navbar() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });

    useEffect(() => {
        // Update HTML attribute
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update Favicon
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
            // Dark theme needs black logo
            // Light theme needs white logo
            link.href = theme === 'dark' ? blackBgLogo : whiteBgLogo;
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <header className="app-header">
            <a href="/" className="home-link">
                <img
                    src={theme === 'dark' ? blackBgLogo : whiteBgLogo}
                    className="logo"
                    alt="Wordle Viewer Logo"
                />
            </a>
            <a href="/" className="today-link">Today</a>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>
    );
}
