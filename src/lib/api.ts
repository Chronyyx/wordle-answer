export interface WordOfDay {
    solution: string;
    print_date: string;
    days_since_launch: number;
}

export interface ApiKeyResponse {
    api_key: string;
}

export async function fetchWordOfDay(date: Date = new Date()): Promise<WordOfDay> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const response = await fetch(`/api/word/${dateStr}`);
    if (!response.ok) {
        throw new Error('Failed to fetch Word of the Day');
    }
    return response.json();
}

export async function createApiKey(): Promise<ApiKeyResponse> {
    const response = await fetch('/api/api-keys', {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error('Failed to create API key');
    }
    return response.json();
}
