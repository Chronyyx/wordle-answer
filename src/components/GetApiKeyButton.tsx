import { useState } from 'react';
import { createApiKey } from '../lib/api';

export function GetApiKeyButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleOpen = async () => {
        setIsOpen(true);
        setLoading(true);
        setError(null);
        setApiKey(null);
        setCopied(false);

        try {
            const data = await createApiKey();
            setApiKey(data.api_key);
        } catch (err) {
            setError('Failed to generate API key');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleCopy = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            <button onClick={handleOpen} className="get-api-key-btn">
                Get API Key
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleClose}>
                            &times;
                        </button>
                        <h2>API Key Generated</h2>

                        {loading && <p>Generating key...</p>}

                        {error && <p className="error-text">{error}</p>}

                        {apiKey && (
                            <div className="api-key-display">
                                <p>Your API Key:</p>
                                <div className="key-box">
                                    <code>{apiKey}</code>
                                    <button onClick={handleCopy} className="copy-btn">
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="modal-note">Keep this key safe!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
