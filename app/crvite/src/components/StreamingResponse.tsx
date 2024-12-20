import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { start_stream_query } from '@/api/api';
import { Chat } from '@/types/types';

interface StreamingResponseProps {
    query: string | undefined;
    chat?: Chat;
}

const StreamingResponse: React.FC<StreamingResponseProps> = ({ query, chat }) => {
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        start_stream_query(
            query,
            (chunk) => setResponse(prev => prev + chunk),
            chat
        )
        .catch((err) => {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }, [query, chat]);

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardContent className="p-4">
                {isLoading && <div className="text-blue-500">Generating response...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="whitespace-pre-wrap">{response}</div>
            </CardContent>
        </Card>
    );
};

export default StreamingResponse;