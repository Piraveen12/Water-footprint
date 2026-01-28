import React from 'react';
import { Droplets } from 'lucide-react';

const DailyLifeGallery = ({ onSelect, t }) => {
    const items = [
        { name: "Coffee", icon: "☕", footprint: 132, unit: "L/cup" },
        { name: "Jeans", icon: "👖", footprint: 7600, unit: "L/pair" },
        { name: "Rice", icon: "🍚", footprint: 2500, unit: "L/kg" },
        { name: "T-Shirt", icon: "👕", footprint: 2500, unit: "L/unit" },
        { name: "Beef", icon: "🥩", footprint: 15415, unit: "L/kg" },
        { name: "Apple", icon: "🍎", footprint: 822, unit: "L/kg" },
        { name: "Bread", icon: "🍞", footprint: 1608, unit: "L/kg" },
        { name: "Egg", icon: "🥚", footprint: 196, unit: "L/egg" }
    ];

    return (
        <div className="daily-life-gallery">
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>
                {t?.dailyLifeTitle || "Daily Life Footprint"}
            </h3>
            <div className="gallery-grid">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="gallery-item"
                        onClick={() => onSelect(item.name)}
                    >
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-info">
                            <h4>{item.name}</h4>
                            <div className="footprint-badge">
                                <Droplets size={14} />
                                <span>{item.footprint} {item.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyLifeGallery;
