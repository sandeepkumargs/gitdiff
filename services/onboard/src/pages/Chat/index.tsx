import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';  // Import the plugin
import chatLoading from '../../assets/chatLoading.json'
import Lottie from 'lottie-react';
import { Tooltip } from 'primereact/tooltip';  // Import Tooltip
import { CopyToClipboard } from 'react-copy-to-clipboard';  // Import CopyToClipboard
import { Toast } from 'primereact/toast';  // Import Toast

const BASE_URL = process.env.BASE_URL


const ChatBot: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<Array<{ user: string; bot: string }>>([]);
    const [sanitizedResponse, setSanitizedResponse] = useState<string>(''); // State for <p> tag
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);  // State to manage copy status
    const chatLogEndRef = useRef<HTMLDivElement | null>(null);
    const toastRef = useRef<Toast | null>(null);  // Ref for Toast

    const sanitizeForMarkdown = (output: string) => {
        return output
            .replace(/\\n\\n/g, '\n\n')
            .replace(/\\t/g, '\t')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
    };

    const handleSend = async () => {
        if (userInput.trim() === '') return;

        const newChat = { user: userInput, bot: '' };
        setChatHistory([...chatHistory, newChat]);
        setLoading(true);
        setError(null);
        setUserInput('');

        try {
            const response = await fetch(`http://49.249.95.65:4061/api/vllm/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            let fullResponse = '';

            while (true) {
                const { done, value } = await reader?.read()!;
                if (done) break;

                fullResponse += decoder.decode(value, { stream: true });
            }

            // Convert single \n to Markdown line breaks (two spaces at the end for line break in markdown)
            fullResponse = sanitizeForMarkdown(fullResponse);
            console.log(fullResponse)

            setSanitizedResponse(fullResponse);

            setChatHistory((prevHistory) =>
                prevHistory.map((entry, index) =>
                    index === prevHistory.length - 1 ? { ...entry, bot: fullResponse } : entry
                )
            );
        } catch (error) {
            setError('Error fetching response');
            setChatHistory((prevHistory) =>
                prevHistory.map((entry, index) =>
                    index === prevHistory.length - 1 ? { ...entry, bot: 'Error fetching response' } : entry
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            handleSend();
        }
    };

    useEffect(() => {
        if (chatLogEndRef.current) {
            chatLogEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [chatHistory]);

    // Show Toast notification when text is copied
    const showToast = () => {
        if (toastRef.current) {
            toastRef.current.show({
                severity: 'success',
                summary: 'Copied!',
                detail: 'The text has been copied to your clipboard.',
                life: 3000, // Toast duration in milliseconds
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-screen bg-blue-50 to-indigo-50 w-full">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 mb-6 sm:mb-10 shadow-sm">
                Demo Chat Bot
            </h1>

            {/* PrimeReact Toast component */}
            <Toast ref={toastRef} />

            <Card className="w-full max-w-2xl sm:max-w-4xl p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 border border-gray-200">
                <div className="flex flex-col space-y-4 sm:space-y-6">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className="flex flex-col space-y-3 sm:space-y-4">
                            {/* User message */}
                            <div className="bg-indigo-600 text-white text-lg px-4 sm:px-6 py-3 sm:py-4 rounded-2xl self-end max-w-xs sm:max-w-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-102">
                                {chat.user}
                            </div>
                            {/* Bot message */}
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl self-start max-w-xs sm:max-w-2xl shadow-lg transform transition-all duration-300 ease-in-out hover:scale-102 relative">
                                {loading && !chat.bot ? (
                                    <div className="flex items-center justify-center">
                                        <Lottie
                                            animationData={chatLoading}
                                            loop
                                            className="w-24 h-16"  // Set appropriate size
                                        />
                                    </div>
                                ) : error ? (
                                    <div className="text-red-600 font-medium">{error}</div>
                                ) : (
                                    <>
                                       <ReactMarkdown
    children={chat.bot}
    remarkPlugins={[remarkBreaks]}
    components={{
        p: ({ children }) => (
            <p className="text-gray-800 text-base sm:text-lg leading-relaxed mb-3">
                {children}
            </p>
        ),
        strong: ({ children }) => (
            <strong className="font-bold text-black">{children}</strong>
        ),
        em: ({ children }) => (
            <em className="italic text-black">{children}</em>
        ),
        code: ({ children }) => (
            <span className="bg-gray-800 text-white font-mono text-sm rounded px-2">
                {children}
            </span>
        ),
        pre: ({ children }) => (
            <div className="relative">
                <pre className="bg-gray-800 text-white p-4 rounded-lg font-mono overflow-x-auto whitespace-pre-wrap">
                    {children}
                </pre>
            </div>
        ),
        ul: ({ children }) => (
            <ul className="list-disc pl-5 text-gray-800 text-base sm:text-lg mb-3">
                {children}
            </ul>
        ),
        li: ({ children }) => (
            <li className="mb-1">{children}</li>
        ),
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:text-black"
            >
                {children}
            </a>
        ),
    }}
/>
                                        {/* Copy button */}
                                        <CopyToClipboard text={sanitizedResponse} onCopy={() => { setCopied(true); showToast(); }}>
                                            <button
                                                className="p-2 rounded-full bg-transparent border-0 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                                title={copied ? 'Copied!' : 'Copy to clipboard'}
                                            >
                                                <span className="pi pi-copy text-lg"></span>
                                            </button>
                                        </CopyToClipboard>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatLogEndRef} /> {/* Invisible element to scroll into view */}
                </div>
            </Card>

            <div className="w-full max-w-2xl sm:max-w-4xl flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <InputText
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow px-4 py-3 sm:px-6 sm:py-4 rounded-full border border-gray-300 shadow-sm text-base sm:text-lg focus:outline-none focus:ring focus:border-blue-400" 
                    onKeyDown={handleKeyDown} /> 
                    <Button label="Send" 
                    onClick={handleSend} disabled={loading} className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md transition-transform transform active:scale-95" /> 
                    </div> 
                    </div>
                    );
};

export default ChatBot;
