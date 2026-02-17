import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Car, Utensils, ShowerHead, Shirt, ArrowRight, ArrowLeft, Check, Award, Users } from 'lucide-react';

const questions = [
    {
        id: 'household',
        icon: <Users size={40} />,
        questionKey: 'qHousehold',
        type: 'slider',
        min: 1,
        max: 15,
        unitKey: 'members',
        factorPerUnit: 0 // Used for division in other calculations
    },
    {
        id: 'diet',
        icon: <Utensils size={40} />,
        questionKey: 'qDiet',
        options: [
            { key: 'dietMeat', value: 'meat', factor: 4000 },
            { key: 'dietVeg', value: 'vegetarian', factor: 2500 },
            { key: 'dietVegan', value: 'vegan', factor: 1500 }
        ]
    },
    {
        id: 'bath',
        icon: <ShowerHead size={40} />,
        questionKey: 'qBath',
        options: [
            { key: 'bathBucket', value: 'bucket', factor: 30 },  // 1-2 buckets
            { key: 'bathShower', value: 'shower_short', factor: 60 }, // 5 min
            { key: 'showerLong', value: 'shower_long', factor: 120 }   // 10+ min
        ]
    },
    {
        id: 'dishes',
        icon: <Droplets size={40} />,
        questionKey: 'qDishes',
        options: [
            { key: 'dishHand', value: 'hand', factor: 40 }, // Running tap can be high, but bucket is low. Avg 40.
            { key: 'dishMachine', value: 'machine', factor: 15 } // Modern efficient ones
        ]
    },
    {
        id: 'ro',
        icon: <Droplets size={40} />,
        questionKey: 'qRO',
        options: [
            { key: 'roYes', value: 'yes', factor: 40 }, // Refund/Wastage per day for drinking/cooking
            { key: 'roNo', value: 'no', factor: 0 }
        ]
    },
    {
        id: 'laundry',
        icon: <Shirt size={40} />,
        questionKey: 'qLaundry',
        type: 'slider',
        min: 0,
        max: 10,
        factorPerUnit: 150 / 7 // Assume 150L per load, divided by 7 for daily avg
    },
    {
        id: 'drive',
        icon: <Car size={40} />,
        questionKey: 'qDrive',
        type: 'slider',
        min: 0,
        max: 100,
        unit: 'km',
        factorPerUnit: 5 // Rough estimate of virtual water for fuel/wear
    }
];

const WaterCalculatorWizard = ({ onComplete, t }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCalculating, setIsCalculating] = useState(false);

    const handleOptionSelect = (stepId, value) => {
        setAnswers(prev => ({ ...prev, [stepId]: value }));
        if (currentStep < questions.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            finishWizard();
        }
    };

    const handleSliderChange = (stepId, value) => {
        setAnswers(prev => ({ ...prev, [stepId]: value }));
    };

    const nextStep = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishWizard();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const finishWizard = () => {
        setIsCalculating(true);
        setTimeout(() => {
            // Calculate total
            let total = 0;
            const householdSize = answers['household'] || 1;

            questions.forEach(q => {
                const ans = answers[q.id];
                if (q.id === 'household') return; // Skip adding household size to total

                if (q.options) {
                    const opt = q.options.find(o => o.value === ans);
                    if (opt) total += opt.factor;
                } else if (q.type === 'slider') {
                    let addition = (ans || 0) * q.factorPerUnit;

                    // Specific logic for shared resources
                    if (q.id === 'laundry') {
                        // Laundry is loads per week for the house, convert to daily per person
                        addition = addition / householdSize;
                    }

                    total += addition;
                }
            });
            setIsCalculating(false);
            if (onComplete) onComplete(Math.round(total));
        }, 1500);
    };

    const currentQ = questions[currentStep];

    return (
        <div className="wizard-container" style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'rgba(30,30,30,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {isCalculating ? (
                <div style={{ textAlign: 'center' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                        <Droplets size={64} style={{ color: '#06b6d4' }} />
                    </motion.div>
                    <h2 style={{ marginTop: '1rem' }}>{t.analyzing || "Calculating your footprint..."}</h2>
                </div>
            ) : (
                <>
                    {/* Progress Bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }}
                        />
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ width: '100%' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ color: '#06b6d4', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                                    {currentQ.icon}
                                </div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                    {t[currentQ.questionKey] || "Question"}
                                </h2>
                            </div>

                            <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentQ.options ? (
                                    currentQ.options.map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => handleOptionSelect(currentQ.id, opt.value)}
                                            style={{
                                                padding: '1rem',
                                                background: answers[currentQ.id] === opt.value ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                                                border: answers[currentQ.id] === opt.value ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s',
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            <span>{t[opt.key] || opt.value}</span>
                                            {answers[currentQ.id] === opt.value && <Check size={20} color="#06b6d4" />}
                                        </button>
                                    ))
                                ) : (
                                    <div style={{ padding: '0 2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: '#06b6d4' }}>
                                                {answers[currentQ.id] || currentQ.min || 0}
                                            </span>
                                            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                                {currentQ.unit || (currentQ.unitKey ? t[currentQ.unitKey] : '') || (currentQ.id === 'laundry' ? 'loads/week' : '')}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={currentQ.min}
                                            max={currentQ.max}
                                            step={1}
                                            value={answers[currentQ.id] || currentQ.min || 0}
                                            onChange={(e) => handleSliderChange(currentQ.id, parseInt(e.target.value))}
                                            style={{ width: '100%', cursor: 'pointer', accentColor: '#06b6d4' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: currentStep === 0 ? '#525252' : '#94a3b8',
                                cursor: currentStep === 0 ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowLeft size={18} /> {t.back || "Back"}
                        </button>

                        {!currentQ.options && (
                            <button
                                onClick={nextStep}
                                className="btn-primary"
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {currentStep === questions.length - 1 ? (t.finish || "Finish") : (t.next || "Next")} <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WaterCalculatorWizard;
