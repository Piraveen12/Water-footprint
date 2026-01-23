import React from "react";
import { motion } from "framer-motion";
import { Droplets, Info, Globe, Sprout, Leaf, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import DetailedAnalysis from "./DetailedAnalysis";

const WaterFootprintCard = ({ data, language, image, t }) => {
    if (!data) return null;

    const {
        item_name: default_item_name,
        category: default_category,
        description: default_description,
        tips: default_tips,
        recommendations: default_recommendations,
        production_insights: default_production_insights,
        scientific_name, confidence_score,
        water_footprint_liters, water_footprint_unit,
        breakdown, severity,
        regional_comparison,
        translation
    } = data;

    // Localization Logic
    const loc = translation && translation[language] ? translation[language] : null;

    // Helper to get localized or default text
    const getText = (key, defaultVal) => loc && loc[key] ? loc[key] : defaultVal;

    // Create localized data object to use in render
    const localizedData = {
        ...data,
        item_name: getText('item_name', default_item_name),
        category: getText('category', default_category),
        description: getText('description', default_description),
        tips: getText('tips', default_tips),
        recommendations: getText('recommendations', default_recommendations),
        production_insights: getText('production_insights', default_production_insights),
    };

    // Extract finalized values for use in JSX (shadowing/replacing original destructuring)
    const { item_name, category } = localizedData;

    // Charts Data
    const pieData = breakdown ? [
        { name: 'Green Water', value: breakdown.green_water, color: '#4ade80' },
        { name: 'Blue Water', value: breakdown.blue_water, color: '#3b82f6' },
        { name: 'Grey Water', value: breakdown.grey_water, color: '#a855f7' },
    ] : [];

    const barData = regional_comparison || [];

    return (
        <motion.div
            className="dashboard-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Section 1: Product Identification */}
            <div className="dashboard-card product-id">
                <div className="card-header">
                    <h3><Globe size={20} /> {t ? t.productId : "Product Identification"}</h3>
                </div>
                <div className="split-row" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {image && (
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '2px solid rgba(255,255,255,0.1)',
                            flexShrink: 0
                        }}>
                            <img
                                src={image}
                                alt="Analyzed Item"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1 }}>
                        <div className="info-block">
                            <span className="sub-label"><Leaf size={14} /> {t ? t.detectedProduct : "Detected Product"}</span>
                            <h2>{item_name}</h2>
                            <span className="meta">{t ? t.confidence : "Confidence"}: {confidence_score}%</span>
                        </div>
                        <div className="info-block">
                            <span className="sub-label">🏷️ {t ? t.category : "Category"}</span>
                            <h2>{category}</h2>
                            <span className="meta">{scientific_name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Water Footprint Analysis */}
            <div className="dashboard-card analysis-section">
                <div className="card-header">
                    <h3><Droplets size={20} /> {t ? t.wfAnalysis : "Water Footprint Analysis"}</h3>
                </div>

                <div className="severity-banner">
                    <span>{t ? t.overallSeverity : "Overall Water Footprint Severity"}:</span>
                    <h2 className={`severity-text ${severity?.toLowerCase()}`}>{severity}</h2>
                </div>

                <div className="stats-grid">
                    <div className="stat-card total">
                        <span className="stat-label"><Droplets size={16} /> {t ? t.totalFootprint : "Total Footprint"}</span>
                        <div className="stat-value">{water_footprint_liters}</div>
                        <span className="stat-unit">{water_footprint_unit}</span>
                    </div>
                    <div className="stat-card green">
                        <span className="stat-label">🌧️ {t ? t.greenWater : "Green Water"}</span>
                        <div className="stat-value">{breakdown?.green_water}</div>
                        <span className="stat-unit">{water_footprint_unit}</span>
                    </div>
                    <div className="stat-card blue">
                        <span className="stat-label">💧 {t ? t.blueWater : "Blue Water"}</span>
                        <div className="stat-value">{breakdown?.blue_water}</div>
                        <span className="stat-unit">{water_footprint_unit}</span>
                    </div>
                    <div className="stat-card grey">
                        <span className="stat-label">🧪 {t ? t.greyWater : "Grey Water"}</span>
                        <div className="stat-value">{breakdown?.grey_water}</div>
                        <span className="stat-unit">{water_footprint_unit}</span>
                    </div>
                </div>
            </div>

            {/* Section 3: Understanding & Charts */}
            <div className="dashboard-card visual-section">
                <div className="chart-row">
                    <div className="chart-box">
                        <h4>{t ? t.wfBreakdown : "Water Footprint Breakdown (%)"}</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="legend">
                            {pieData.map(d => (
                                <span key={d.name} style={{ color: d.color }}>● {d.name}</span>
                            ))}
                        </div>
                    </div>

                    <div className="chart-box">
                        <h4>{t ? t.regComparison : "Regional Comparison"} ({water_footprint_unit})</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                    <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Detailed Analysis Tabs */}
            <DetailedAnalysis data={localizedData} key={item_name} t={t} />

        </motion.div>
    );
};

export default WaterFootprintCard;
