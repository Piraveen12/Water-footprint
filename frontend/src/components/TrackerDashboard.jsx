import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, History, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TrackerDashboard = ({ history, onStart, t }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);

    const totalFootprint = history.reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0);

    // Gamification Logic
    const averageFootprint = history.length > 0 ? totalFootprint / history.length : 0;

    let grade = 'A';
    if (averageFootprint > 3000) grade = 'C';
    else if (averageFootprint > 1000) grade = 'B';
    else grade = 'A';

    const getGradeColor = (g) => {
        if (g === 'A') return '#4ade80'; // Green
        if (g === 'B') return '#facc15'; // Yellow
        return '#ef4444'; // Red
    };

    const getGradeText = (g, t) => {
        if (g === 'A') return t.gradeA || "Water-efficient citizen 🌱";
        if (g === 'B') return t.gradeB || "Moderate usage";
        return t.gradeC || "High water footprint ⚠️";
    };

    // Badges
    const badges = [];
    if (history.length >= 1) badges.push({ name: t.badgeNovice || "Novice", icon: "🌱" });
    if (history.length >= 5) badges.push({ name: t.badgePro || "Tracker Pro", icon: "📊" });
    if (grade === 'A' && history.length >= 3) badges.push({ name: t.badgeSaver || "Water Saver", icon: "💧" });
    if (totalFootprint > 10000) badges.push({ name: t.badgeImpact || "Big Impact", icon: "🌊" });

    // Chart Data
    // Helper to format date key YYYY-MM-DD
    const getDateKey = (isoString) => {
        if (!isoString) return new Date().toISOString().split('T')[0];
        try {
            return new Date(isoString).toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    };

    // Group history by date
    const groupedHistory = history.reduce((acc, item) => {
        const key = getDateKey(item.timestamp);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Sort dates descending (newest first)
    const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

    // Daily totals for chart
    const dailyTotals = history.reduce((acc, item) => {
        const key = getDateKey(item.timestamp);
        if (!acc[key]) acc[key] = 0;
        acc[key] += (item.water_footprint_liters || 0);
        return acc;
    }, {});

    // Generate last 7 days for chart
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        last7DaysData.push({
            name: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
            value: dailyTotals[key] || 0,
            fullDate: key
        });
    }

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

                {/* Gamification Section */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <span className="sub-label" style={{ marginBottom: '0.5rem' }}>{t.sustainabilityScore || "Sustainability Score"}</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <h1 style={{ color: getGradeColor(grade), margin: 0, fontSize: '3rem' }}>{grade}</h1>
                                <span className="text-muted">{getGradeText(grade, t)}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="sub-label" style={{ marginBottom: '0.5rem', display: 'block' }}>{t.badgesEarned || "Badges Earned"}</span>
                            <div className="badges-container" style={{ display: 'flex', gap: '0.5rem' }}>
                                {badges.map((badge, index) => (
                                    <div key={index} title={badge.name} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '0.5rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        minWidth: '60px'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                                        <span style={{ fontSize: '0.6rem', marginTop: '0.2rem', color: 'var(--text-muted)' }}>{badge.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', height: '250px' }}>
                    <h4 style={{ marginBottom: '1rem' }}>{t.usageTrend}</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last7DaysData}>
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
                <h3>{t.history || "Date-wise History"}</h3>
                <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sortedDates.map((dateKey) => (
                        <div key={dateKey}>
                            <h5 style={{
                                color: '#94a3b8',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                paddingBottom: '0.5rem',
                                marginBottom: '0.8rem',
                                fontSize: '0.9rem'
                            }}>
                                {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                <span style={{ float: 'right', color: 'var(--primary)' }}>
                                    {groupedHistory[dateKey].reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0).toFixed(0)} L
                                </span>
                            </h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {groupedHistory[dateKey].map((item, i) => (
                                    <div key={i} className="comp-row" style={{ gridTemplateColumns: '1fr auto', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', display: 'block' }}>{item.item_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{item.water_footprint_liters} L</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <p className="text-muted">{t.noHistory}</p>}
                </div>
            </div>
        </div>
    );
};

export default TrackerDashboard;
