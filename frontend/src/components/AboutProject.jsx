import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, ShieldCheck, Cpu, Globe, Activity, Lightbulb } from 'lucide-react';

const AboutProject = ({ isOpen, onClose, t }) => {
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
                        style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}
                    >
                        <button className="close-modal" onClick={onClose}>
                            <X size={24} />
                        </button>

                        <h2 className="modal-title">{t.aboutTitle}</h2>

                        <div className="grid-2" style={{ gap: '1.5rem' }}>
                            <div className="info-box">
                                <span className="label"><Cpu size={16} style={{ display: 'inline' }} /> {t.coreInnovation}</span>
                                <p><strong>{t.coreInnovation}:</strong> {t.coreDesc}</p>
                            </div>

                            <div className="info-box">
                                <span className="label"><Globe size={16} style={{ display: 'inline' }} /> {t.inclusivity}</span>
                                <p><strong>{t.inclusivity}:</strong> {t.inclusivityDesc}</p>
                            </div>

                            <div className="info-box">
                                <span className="label"><Activity size={16} style={{ display: 'inline' }} /> {t.smartTracking}</span>
                                <p><strong>{t.smartTracking}:</strong> {t.smartDesc}</p>
                            </div>

                            <div className="info-box">
                                <span className="label"><Database size={16} style={{ display: 'inline' }} /> {t.bigData}</span>
                                <p><strong>{t.bigData}:</strong> {t.bigDesc}</p>
                            </div>

                            <div className="info-box">
                                <span className="label"><ShieldCheck size={16} style={{ display: 'inline' }} /> {t.roadmap}</span>
                                <p><strong>{t.roadmap}:</strong> {t.roadmapDesc}</p>
                            </div>

                            <div className="info-box">
                                <span className="label"><Lightbulb size={16} style={{ display: 'inline' }} /> {t.impact}</span>
                                <p><strong>{t.impact}:</strong> {t.impactDesc}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.7, fontSize: '0.8rem' }}>
                            <p>{t.footer}</p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AboutProject;
