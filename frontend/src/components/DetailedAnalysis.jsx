import React, { useState } from 'react';
import { Leaf, Factory, BarChart2, Lightbulb, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailedAnalysis = ({ data, t }) => {
    const activeTabState = useState('impact');
    const activeTab = activeTabState[0];
    const setActiveTab = activeTabState[1];

    const tabs = [
        { id: 'impact', label: t ? t.tabImpact : 'Environmental Impact', icon: Leaf },
        { id: 'production', label: t ? t.tabProduction : 'Production Insights', icon: Factory },
        { id: 'comparison', label: t ? t.tabComparison : 'Comparisons', icon: Scale },
        { id: 'recommendations', label: t ? t.tabRecs : 'Recommendations', icon: Lightbulb },
        { id: 'metrics', label: t ? t.tabMetrics : 'More Metrics', icon: BarChart2 },
    ];

    return (
        <div className="detailed-analysis">
            <h2 className="section-title"><BarChart2 className="icon" /> {t ? t.detailedAnalysis : "Detailed Analysis"}</h2>

            <div className="tabs-header">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'impact' && (
                            <div className="grid-2">
                                <div className="info-box">
                                    <span className="label">{t ? t.severityScore : "Severity Score"}</span>
                                    <div className="value-row">
                                        <span className={`severity-badge ${data.severity.toLowerCase()}`}>{data.severity}</span>
                                    </div>
                                </div>
                                <div className="info-box">
                                    <span className="label">{t ? t.carbonFootprint : "Carbon Footprint"}</span>
                                    <p className="highlight">{data.carbon_footprint}</p>
                                </div>
                                <div className="info-box">
                                    <span className="label">{t ? t.landUse : "Land Use"}</span>
                                    <p className="highlight">{data.land_use}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'production' && (
                            <div className="text-content">
                                <p>{data.production_insights}</p>
                            </div>
                        )}

                        {activeTab === 'comparison' && (
                            <div className="comparison-list">
                                <p>Regional usage varies significantly based on climate.</p>
                                {data.regional_comparison.map((r, i) => (
                                    <div key={i} className="comp-row">
                                        <span>{r.region}</span>
                                        <div className="bar-container">
                                            <div className="bar-fill" style={{ width: `${(r.value / 1000) * 100}%` }}></div>
                                        </div>
                                        <span>{r.value} L/kg</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'recommendations' && (
                            <ul className="rec-list">
                                {data.recommendations?.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        )}

                        {activeTab === 'metrics' && (
                            <div className="text-content">
                                <p>Sample additional metrics would go here.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DetailedAnalysis;
