import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Scanner = ({ onScan, t }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [image, setImage] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setIsCameraOpen(false);
    onScan(imageSrc);
  }, [webcamRef, onScan]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        onScan(file); // Pass file object for upload
      };
      reader.readAsDataURL(file);
    }
  };

  const retrace = () => {
    setImage(null);
    onScan(null);
  };

  return (
    <div className="scanner-container">
      <AnimatePresence>
        {!image && !isCameraOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="input-options"
          >
            <button className="btn-primary" onClick={() => setIsCameraOpen(true)}>
              <Camera size={24} />
              <span>{t.scanBtn}</span>
            </button>
            <div className="or-divider">{t.or}</div>
            <button
              className="btn-secondary"
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={24} />
              <span>{t.uploadBtn}</span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={handleFileUpload}
            />
          </motion.div>
        )}

        {isCameraOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="webcam-wrapper"
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
            />
            <button className="close-cam" onClick={() => setIsCameraOpen(false)}>
              <X />
            </button>
            <button className="capture-btn" onClick={capture}></button>
          </motion.div>
        )}

        {image && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="preview-image"
          >
            <img src={typeof image === 'string' ? image : URL.createObjectURL(image)} alt="Scanned" />
            <button className="btn-text" onClick={retrace}>
              Retake / Upload Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scanner;
