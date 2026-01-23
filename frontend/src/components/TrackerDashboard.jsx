import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, History, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TrackerDashboard = ({ history, onStart, t }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    const totalFootprint = history.reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0);

    // Group by date (mocking date since we just have the item) or just show recent items in chart
    // For simplicity, showing last 7 items in chart
    const chartData = history.slice(-7).map((item, index) => ({
        name: item.item_name.substring(0, 10), // Truncate for label
        value: item.water_footprint_liters || 0
    }));

    const analyzeHabits = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/analyze-habits', { items: history });
            setInsights(response.data);
        } catch (error) {
            console.error("Error analyzing habits", error);
        } finally {
            setLoading(false);
        }
    };

    if (history.length === 0) {
        return (
            <div className="dashboard-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <History size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>{t.noHistory}</h3>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>{t.startTrackingMsg}</p>
                <button
                    className="btn-primary"
                    onClick={onStart}
                >
                    {t.startTrackingBtn}
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-card">
                <div className="card-header">
                    <h3><TrendingUp size={20} /> {t.trackerTitle}</h3>
                </div>

                <div className="split-row">
                    <div className="info-block">
                        <span className="sub-label">{t.totalFootprint}</span>
                        <h2>{totalFootprint.toFixed(0)} <span style={{ fontSize: '1rem' }}>{t.liters}</span></h2>
                        <span className="meta">Across {history.length} {t.itemsCount}</span>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', height: '250px' }}>
                    <h4 style={{ marginBottom: '1rem' }}>{t.usageTrend}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" fill="#00bcd4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="card-header" style={{ justifyContent: 'space-between' }}>
                    <h3><Lightbulb size={20} /> {t.aiTitle}</h3>
                    <button
                        className="btn-primary"
                        onClick={analyzeHabits}
                        disabled={loading}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                    >
                        {loading ? <Loader2 className="spin" size={16} /> : t.analyzeBtn}
                    </button>
                </div>

                {insights && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="ai-insights"
                        style={{ marginTop: '1rem' }}
                    >
                        <div className="info-box" style={{ marginBottom: '1rem' }}>
                            <span className="label" style={{ color: '#facc15' }}><AlertTriangle size={14} style={{ display: 'inline', marginRight: '5px' }} /> {t.highConsumption}</span>
                            <p>{insights.most_consuming.join(', ')}</p>
                        </div>

                        <div className="info-box" style={{ marginBottom: '1rem' }}>
                            <span className="label">{t.usagePattern}</span>
                            <p>{insights.usage_pattern}</p>
                        </div>

                        <ul className="rec-list">
                            {insights.recommendations.map((rec, i) => (
                                <li key={i} style={{ color: '#a5f3fc' }}>{rec}</li>
                            ))}
                        </ul>
                    </motion.div>
                )}
                {!insights && !loading && (
                    <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {t.clickToAnalyze}
                    </p>
                )}
            </div>

            <div className="dashboard-card">
                <h3>{t.recentScans}</h3>
                <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {history.slice().reverse().slice(0, 5).map((item, i) => ( // Show last 5
                        <div key={i} className="comp-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div>
                                <span style={{ fontWeight: '600', display: 'block' }}>{item.item_name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                            <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{item.water_footprint_liters} L</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrackerDashboard;
