import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ChatBot = ({ t, language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m AquaBot 💧. Ask me anything about saving water or your daily footprint!' }
    ]);
    const [input, setInput] = useState('');
    const [itemLoading, setItemLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setItemLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: userMsg,
                language: language
            });
            setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I lost connection to the water source! Try again later." }]);
        } finally {
            setItemLoading(false);
        }
    };

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support voice input. Please use Chrome or Edge.");
            return;
        }

        if (isListening) {
            setIsListening(false);
            window.recognition?.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        window.recognition = recognition;

        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN',
            'malayalam': 'ml-IN',
            'kannada': 'kn-IN'
        };
        recognition.lang = langMap[language] || 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                className="chat-fab"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <MessageCircle />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chat-window"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <div className="chat-header">
                            <div className="chat-title">
                                <Bot size={20} />
                                <span>{t.chatTitle}</span>
                            </div>
                            <button className="chat-close" onClick={() => setIsOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message ${msg.role}`}>
                                    <div className="msg-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {itemLoading && (
                                <div className="message bot">
                                    <div className="msg-bubble loading">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder={t.chatPlaceholder}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`mic-btn ${isListening ? 'listening' : ''}`}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isListening ? '#ef4444' : 'var(--text-secondary)',
                                    padding: '0 0.5rem'
                                }}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <button type="submit" disabled={!input.trim() || itemLoading}>
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
