import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWordOfDay, type WordOfDay } from '../lib/api';
import './WordlePage.css';

export function WordlePage() {
    const { date: urlDate } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<WordOfDay | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentDate, setCurrentDate] = useState<Date>(() => {
        if (urlDate) {
            // Parse date in UTC to avoid timezone issues
            const [year, month, day] = urlDate.split('-').map(Number);
            const parsed = new Date(year, month - 1, day);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }
        return new Date();
    });
    const [isRevealed, setIsRevealed] = useState(false);

    // Update URL when date changes
    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        navigate(`/wordle/${dateStr}`, { replace: true });
    }, [currentDate, navigate]);

    // Fetch data when date changes
    useEffect(() => {
        setLoading(true);
        setError(false);
        setIsRevealed(false);
        fetchWordOfDay(currentDate)
            .then(setData)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [currentDate]);

    const [yesterdayData, setYesterdayData] = useState<WordOfDay | null>(null);

    useEffect(() => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        fetchWordOfDay(yesterday)
            .then(setYesterdayData)
            .catch(console.error);
    }, []);

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    return (
        <main className="wordle-page">
            {loading && <div className="loading">Loading...</div>}

            {error && <div className="error-message">Failed to load Word of the Day</div>}

            {data && (
                <div className="word-display">
                    <div className="wordle-number">Wordle #{data.days_since_launch}</div>

                    <div className="date-navigation">
                        <button onClick={handlePrevDay} className="nav-btn" aria-label="Previous day">
                            ←
                        </button>
                        <div className="date-text">{data.print_date}</div>
                        <button
                            onClick={handleNextDay}
                            className="nav-btn"
                            aria-label="Next day"
                        >
                            →
                        </button>
                    </div>

                    <div className="solution-container">
                        <h1 className={`word-text ${!isRevealed ? 'blurred' : ''}`}>
                            {data.solution}
                        </h1>
                        {!isRevealed && (
                            <button
                                className="reveal-btn"
                                onClick={() => setIsRevealed(true)}
                            >
                                Reveal Answer
                            </button>
                        )}
                    </div>

                    {yesterdayData && (
                        <div className="yesterday-word">
                            Yesterday's word: {yesterdayData.solution.toUpperCase()}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
