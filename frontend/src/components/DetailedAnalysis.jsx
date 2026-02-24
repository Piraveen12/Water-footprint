import React, { useState } from 'react';
import { Leaf, Factory, BarChart2, Lightbulb, Scale, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DetailedAnalysis = ({ data, t }) => {
    const [activeTab, setActiveTab] = useState('impact');

    const tabs = [
        { id: 'impact', label: t ? t.tabImpact : 'Environmental Impact', icon: Leaf },
        { id: 'projection', label: t ? t.projectionTitle || 'Day-wise Projection' : 'Day-wise Projection', icon: TrendingUp },
        { id: 'recommendations', label: t ? t.waysToReduce || 'Ways to Reduce' : 'Ways to Reduce', icon: ShieldCheck },
        { id: 'production', label: t ? t.tabProduction : 'Production Insights', icon: Factory },
        { id: 'comparison', label: t ? t.tabComparison : 'Comparisons', icon: Scale },
    ];

    // Generate 7-day projection data
    const generateProjectionData = () => {
        const baseValue = data.water_footprint_liters || 0;
        return Array.from({ length: 7 }, (_, i) => ({
            day: `Day ${i + 1}`,
            value: Math.round(baseValue * (i + 1))
        }));
    };

    const projectionData = generateProjectionData();

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

                        {activeTab === 'projection' && (
                            <div className="projection-container">
                                <div className="projection-header">
                                    <h4>{t ? t.dayWiseImpact || "7-Day Usage Projection" : "7-Day Usage Projection"}</h4>
                                    <p className="sub-text">{t ? t.projectionDesc || "Cumulative water requirement if consumed daily." : "Cumulative water requirement if consumed daily."}</p>
                                </div>
                                <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={projectionData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}L`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#3b82f6' }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="projection-footer">
                                    <div className="projection-stat">
                                        <span>7-Day Total:</span>
                                        <strong style={{ color: '#3b82f6', fontSize: '1.5rem', marginLeft: '0.5rem' }}>{projectionData[6].value} Liters</strong>
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

