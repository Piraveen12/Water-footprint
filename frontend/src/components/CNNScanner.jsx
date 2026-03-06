import React, { useState } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const CNNScanner = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleScan = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch('http://localhost:5000/api/footprint-cnn', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process image');
            }

            const data = await response.ok ? await response.json() : null;
            if (data && data.status === "success") {
                setResult(data);
            } else {
                setError("Could not identify item. Please try another image.");
            }
        } catch (err) {
            setError("CNN Model server error. Ensure backend is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cnn-scanner-container p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700">
                <Camera size={28} />
                Local CNN Scanner
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
                Identification powered by <strong>MobileNetV2</strong> running on your local machine.
            </p>

            <div className="upload-section mb-6">
                <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md mb-4" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                <Camera size={48} />
                                <span>Click to Upload or Take Photo</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                </label>
            </div>

            <button
                onClick={handleScan}
                disabled={!image || loading}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${!image || loading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                    }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <CheckCircle />}
                {loading ? 'Processing with CNN...' : 'Identify Item'}
            </button>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100"
                >
                    <AlertTriangle size={18} />
                    {error}
                </motion.div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-5 bg-indigo-50 rounded-xl border border-indigo-100"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Prediction</span>
                        <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-1 rounded-full">{result.confidence}% Match</span>
                    </div>
                    <h3 className="text-3xl font-black text-indigo-900 capitalize mb-1">
                        {result.detected_item}
                    </h3>
                    <p className="text-indigo-600 text-sm italic">
                        {result.message}
                    </p>

                    <button
                        className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        onClick={() => alert("This would now fetch the full water footprint report for: " + result.detected_item)}
                    >
                        View Full Report
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default CNNScanner;
