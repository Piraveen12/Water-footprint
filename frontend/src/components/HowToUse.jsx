import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scan, LayoutDashboard, Languages, Sparkles } from 'lucide-react';

const HowToUse = ({ isOpen, onClose, t }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose}>
                    <motion.div
                        className="modal-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="close-modal" onClick={onClose}>
                            <X size={24} />
                        </button>

                        <h2 className="modal-title">How to Use the App</h2>

                        <div className="guide-section">
                            <div className="guide-icon"><Scan size={24} /></div>
                            <div className="guide-text">
                                <h3>1. Scan or Search</h3>
                                <p>Use the <strong>"Scan & Search"</strong> tab to take a photo or upload an image of any product. Or, simply type the name (e.g., "Cotton Shirt") in the search bar.</p>
                            </div>
                        </div>

                        <div className="guide-section">
                            <div className="guide-icon"><Languages size={24} /></div>
                            <div className="guide-text">
                                <h3>2. Select Your Language</h3>
                                <p>Choose your preferred language from the top-right dropdown (Hindi, Tamil, Malayalam, etc.) to get results in that language.</p>
                            </div>
                        </div>

                        <div className="guide-section">
                            <div className="guide-icon"><LayoutDashboard size={24} /></div>
                            <div className="guide-text">
                                <h3>3. Track Your Footprint</h3>
                                <p>Switch to the <strong>"My Tracker"</strong> tab. Here, every item you scan is automatically saved. You can see your total water footprint history.</p>
                            </div>
                        </div>

                        <div className="guide-section">
                            <div className="guide-icon"><Sparkles size={24} /></div>
                            <div className="guide-text">
                                <h3>4. Get AI Recommendations</h3>
                                <p>In the Tracker tab, click <strong>"Analyze My Habits"</strong>. Our AI will analyze your history and give you personalized tips to save water!</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default HowToUse;
