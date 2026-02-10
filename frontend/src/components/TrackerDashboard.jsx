import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, History, Loader2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TrackerDashboard = ({ history, onStart, t }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // Controls the currently viewed month
    const [expandedDate, setExpandedDate] = useState(null); // Controls which date is expanded

    // Overall Totals (All Time)
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

    // Helper to format date key YYYY-MM-DD
    const getDateKey = (isoString) => {
        if (!isoString) return new Date().toISOString().split('T')[0];
        try {
            return new Date(isoString).toISOString().split('T')[0];
        } catch (e) {
            return new Date().toISOString().split('T')[0];
        }
    };

    // Filter history by selected month/year
    const filteredHistory = history.filter(item => {
        const d = new Date(item.timestamp || new Date());
        return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    });

    const monthlyTotal = filteredHistory.reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0);

    // Group filtered history by date
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        const key = getDateKey(item.timestamp);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    // Sort dates within the month descending
    const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

    // Prepare chart data for the selected month
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const chartData = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
        const key = d.toISOString().split('T')[0];

        let val = 0;
        if (groupedHistory[key]) {
            val = groupedHistory[key].reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0);
        }

        // Only push if it's not in the future (or include all days for a full month view)
        // For aesthetics, let's include all days but only highlight up to today if current month
        chartData.push({
            name: i.toString(),
            value: val,
            fullDate: key
        });
    }

    const changeMonth = (offset) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
        setExpandedDate(null); // Collapse all on month change
    };

    const toggleDate = (dateKey) => {
        setExpandedDate(expandedDate === dateKey ? null : dateKey);
    };

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
            {/* Summary Card */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3><TrendingUp size={20} /> {t.trackerTitle}</h3>
                </div>

                <div className="split-row">
                    <div className="info-block">
                        <span className="sub-label">{t.totalFootprint || "Total (All Time)"}</span>
                        <h2>{totalFootprint.toFixed(0)} <span style={{ fontSize: '1rem' }}>{t.liters}</span></h2>
                        <span className="meta">Across {history.length} {t.itemsCount}</span>
                    </div>

                    <div className="info-block" style={{ textAlign: 'right' }}>
                        <span className="sub-label">{t.sustainabilityScore || "Sustainability Score"}</span>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: '0.5rem' }}>
                            <h2 style={{ color: getGradeColor(grade), margin: 0 }}>{grade}</h2>
                        </div>
                        <span className="meta">{getGradeText(grade, t)}</span>
                    </div>
                </div>

                {/* Badges Row */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {badges.map((badge, index) => (
                        <div key={index} title={badge.name} style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{badge.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t.usageTrend || "Monthly Overview"}</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Total: <span style={{ color: 'var(--primary)' }}>{monthlyTotal.toFixed(0)} L</span>
                        </div>
                    </div>

                    <div className="month-nav">
                        <button onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
                        <span className="month-label">
                            {viewDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
                    </div>
                </div>

                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={daysInMonth > 20 ? 2 : 0}
                            />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                                formatter={(value) => [`${value} L`, 'Water Footprint']}
                                labelFormatter={(label) => `${viewDate.toLocaleDateString(undefined, { month: 'long' })} ${label}`}
                            />
                            <Bar dataKey="value" fill="#00bcd4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Analysis */}
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

                {insights ? (
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
                ) : (
                    !loading && (
                        <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                            {t.clickToAnalyze}
                        </p>
                    )
                )}
            </div>

            {/* Date-wise History List */}
            <div className="dashboard-card">
                <h3><History size={20} style={{ marginRight: '0.5rem' }} /> {t.history || "Daily History"}</h3>

                <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {filteredHistory.length > 0 ? (
                        sortedDates.map((dateKey) => {
                            const dayTotal = groupedHistory[dateKey].reduce((sum, item) => sum + (item.water_footprint_liters || 0), 0);
                            const isExpanded = expandedDate === dateKey;

                            return (
                                <div
                                    key={dateKey}
                                    className="history-item"
                                >
                                    <div
                                        onClick={() => toggleDate(dateKey)}
                                        className={`history-header ${isExpanded ? 'expanded' : ''}`}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="date-badge">
                                                <span className="day">{new Date(dateKey).getDate()}</span>
                                                <span className="weekday">{new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>
                                                    {new Date(dateKey).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                                </h5>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {groupedHistory[dateKey].length} items
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{dayTotal.toFixed(0)} L</span>
                                            {isExpanded ? <ChevronDown size={18} color="#94a3b8" /> : <ChevronRight size={18} color="#94a3b8" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="history-content"
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {groupedHistory[dateKey].map((item, i) => (
                                                    <div key={i} className="history-row">
                                                        <div>
                                                            <span style={{ fontWeight: '500', display: 'block', color: '#f1f5f9', fontSize: '0.95rem' }}>{item.item_name}</span>
                                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                                                                <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {item.category && (
                                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {item.category}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span style={{ color: '#22d3ee', fontWeight: 'bold', fontSize: '1rem' }}>{item.water_footprint_liters} L</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <p style={{ margin: 0 }}>No records for this month</p>
                            <button
                                onClick={onStart}
                                style={{
                                    marginTop: '1rem',
                                    background: 'transparent',
                                    border: '1px solid var(--primary)',
                                    color: 'var(--primary)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Add manual entry
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackerDashboard;
