import React, { useState } from 'react';
import { Leaf, Factory, BarChart2, Lightbulb, Scale, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DetailedAnalysis = ({ data, t }) => {
    const [activeTab, setActiveTab] = useState('impact');

    const tabs = [
        { id: 'impact', label: t ? t.tabImpact : 'Environmental Impact', icon: Leaf },
        { id: 'efficiency', label: t ? t.efficiencyTab || 'Smart Efficiency' : 'Smart Efficiency', icon: TrendingUp },
        { id: 'recommendations', label: t ? t.waysToReduce || 'Ways to Reduce' : 'Ways to Reduce', icon: ShieldCheck },
        { id: 'production', label: t ? t.tabProduction : 'Production Insights', icon: Factory },
        { id: 'comparison', label: t ? t.tabComparison : 'Comparisons', icon: Scale },
    ];

    return (
        <div className="detailed-analysis">
            <h2 className="section-title"><BarChart2 className="icon" size={24} /> {t ? t.detailedAnalysis : "Detailed Analysis"}</h2>

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
                                        <span className={`severity-badge ${data.severity?.toLowerCase()}`}>{data.severity}</span>
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

                        {activeTab === 'efficiency' && (
                            <div className="efficiency-container">
                                <div className="efficiency-header">
                                    <TrendingUp className="icon-blue" size={24} />
                                    <h4>{t ? t.yieldOptimizationHeader || "Reducing Usage, Maintaining Yield" : "Reducing Usage, Maintaining Yield"}</h4>
                                </div>
                                <div className="efficiency-content">
                                    <div className="info-card gold-border">
                                        <p className="yield-text">{data.yield_optimization || "Analyzing optimization patterns..."}</p>
                                    </div>
                                    <div className="best-practices mt-4">
                                        <h5><ShieldCheck size={16} /> {t ? t.bestPractices : "Efficiency Strategy"}</h5>
                                        <div className="strategy-tags">
                                            <span className="tag">Drip Irrigation</span>
                                            <span className="tag">Recycling</span>
                                            <span className="tag">Process Control</span>
                                        </div>
                                    </div>
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
                                {data.regional_comparison?.map((r, i) => (
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
                            <div className="recommendations-container">
                                <div className="recommendations-header">
                                    <Lightbulb className="icon-gold" size={20} />
                                    <h4>{t ? t.waysToReduce || "Ways to Reduce Consumption" : "Ways to Reduce Consumption"}</h4>
                                </div>
                                <ul className="rec-list">
                                    {data.recommendations?.map((rec, i) => (
                                        <li key={i}>
                                            <span className="list-bullet">🌱</span>
                                            {rec}
                                        </li>
                                    ))}
                                    {data.tips?.map((tip, i) => (
                                        <li key={`tip-${i}`}>
                                            <span className="list-bullet">💡</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                                <div className="ai-badge">
                                    <ShieldCheck size={14} /> AI Verified Suggestions
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DetailedAnalysis;

