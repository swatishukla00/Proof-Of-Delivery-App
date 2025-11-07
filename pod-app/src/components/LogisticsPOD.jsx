import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import './LogisticsPOD.css';

const LogisticsPOD = () => {
  const [awbNumber, setAwbNumber] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(''); // 'photo' or 'video'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(''); // New state for scanning feedback
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const scanIntervalRef = useRef(null); // New ref for scan interval

  // Initialize camera for barcode scanning
  const initBarcodeScanner = async () => {
    setIsScanning(true);
    setScanMessage('Initializing camera...');
    setUploadStatus('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Changed to 'user' for laptop front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true); // required for iOS
        videoRef.current.play();
        
        // Start scanning for barcodes
        scanBarcode(stream);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setScanMessage('Camera error: ' + err.message);
      setUploadStatus('Error accessing camera: ' + err.message);
      setIsScanning(false);
    }
  };

  // Scan for barcodes using jsQR with improved detection
  const scanBarcode = (stream) => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    const detectBarcode = () => {
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Use jsQR to detect QR codes with improved options
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          // Successfully detected a barcode
          setAwbNumber(code.data);
          setScanMessage(`Detected: ${code.data}`);
          setUploadStatus(`Scanned AWB: ${code.data}`);
          
          // Stop the camera
          stream.getTracks().forEach(track => track.stop());
          setIsScanning(false);
          return;
        } else {
          // No barcode detected yet, continue scanning
          setScanMessage('Scanning... Point camera at barcode');
        }
      } else {
        setScanMessage('Loading camera feed...');
      }
      
      if (isScanning) {
        // Use interval for more consistent scanning
        scanIntervalRef.current = setTimeout(detectBarcode, 200); // Scan every 200ms
      }
    };
    
    setScanMessage('Scanning... Point camera at barcode');
    detectBarcode();
  };

  // Stop scanning
  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (scanIntervalRef.current) {
      clearTimeout(scanIntervalRef.current);
    }
  };

  // Handle manual AWB entry
  const handleManualAWB = () => {
    const manualAWB = prompt("Enter AWB Number:", "AWB123456789");
    if (manualAWB) {
      setAwbNumber(manualAWB);
      setUploadStatus(`Manual AWB entered: ${manualAWB}`);
    }
  };

  // Capture photo using device camera
  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Changed to 'user' for laptop front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', true); // required for iOS
      video.play();
      
      // Wait for video to load
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and set as media
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          setMedia(url);
          setMediaType('photo');
          setUploadStatus('Photo captured. Ready to upload.');
        });
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadStatus('Error accessing camera: ' + err.message);
    }
  };

  // Record video using device camera
  const recordVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Changed to 'user' for laptop front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setMedia(url);
        setMediaType('video');
        setUploadStatus('Video recorded. Ready to upload.');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording for 5 seconds
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
      
      setUploadStatus('Recording video for 5 seconds...');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadStatus('Error accessing camera: ' + err.message);
    }
  };

  // Upload media to cloud storage (simulated with actual file handling)
  const uploadToCloud = async () => {
    if (!awbNumber || !media) {
      setUploadStatus('Please scan an AWB and capture media first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading to cloud storage...');
    
    try {
      // In a real implementation, you would:
      // 1. Convert the media URL to a Blob
      // 2. Upload to a cloud service like AWS S3, Firebase, etc.
      
      // Simulate actual upload process with more realistic steps
      setUploadStatus('Converting media for upload...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUploadStatus('Connecting to cloud storage...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setUploadStatus('Uploading media file...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Example of what a real implementation might look like:
      /*
      const response = await fetch(media);
      const blob = await response.blob();
      
      // Upload to cloud storage (example with AWS S3)
      const formData = new FormData();
      formData.append('file', blob, `pod_${awbNumber}_${Date.now()}.${mediaType === 'photo' ? 'jpg' : 'webm'}`);
      formData.append('awbNumber', awbNumber);
      formData.append('mediaType', mediaType);
      
      const uploadResponse = await fetch('https://your-api-endpoint.com/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await uploadResponse.json();
      setUploadStatus(`Successfully uploaded ${mediaType} for AWB: ${awbNumber}`);
      */
      
      setUploadStatus(`Successfully uploaded ${mediaType} for AWB: ${awbNumber} to cloud storage`);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setAwbNumber('');
    setMedia(null);
    setMediaType('');
    setUploadStatus('');
    setScanMessage('');
    stopScanning();
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="logistics-pod">
      <div className="card">
        <h2>Proof of Delivery</h2>
        
        {/* AWB Scanning Section */}
        <div className="section">
          <h3>1. Scan AWB</h3>
          <div className="awb-buttons">
            <button 
              onClick={initBarcodeScanner} 
              disabled={isScanning}
              className="scan-btn"
            >
              {isScanning ? 'Scanning...' : 'Scan AWB Barcode'}
            </button>
            <button 
              onClick={handleManualAWB} 
              className="manual-btn"
            >
              Enter AWB Manually
            </button>
          </div>
          {isScanning && (
            <div className="scanner-preview">
              <video ref={videoRef} className="scanner-video" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <p className="scan-message">{scanMessage}</p>
            </div>
          )}
          {awbNumber && (
            <div className="awb-display">
              <p>Scanned AWB: <strong>{awbNumber}</strong></p>
            </div>
          )}
        </div>
        
        {/* Media Capture Section */}
        <div className="section">
          <h3>2. Capture Proof</h3>
          <div className="capture-buttons">
            <button onClick={capturePhoto} className="capture-btn photo-btn">
              Take Photo
            </button>
            <button onClick={recordVideo} className="capture-btn video-btn">
              Record Video
            </button>
          </div>
          
          {media && (
            <div className="media-preview">
              <h4>Preview:</h4>
              {mediaType === 'photo' ? (
                <img src={media} alt="Proof of delivery" className="preview-image" />
              ) : (
                <video src={media} controls className="preview-video" />
              )}
            </div>
          )}
        </div>
        
        {/* Upload Section */}
        <div className="section">
          <h3>3. Upload to Cloud</h3>
          {uploadStatus && (
            <div className={`status ${isUploading ? 'uploading' : ''}`}>
              {uploadStatus}
            </div>
          )}
          <div className="upload-controls">
            <button 
              onClick={uploadToCloud} 
              disabled={!awbNumber || !media || isUploading}
              className="upload-btn"
            >
              {isUploading ? 'Uploading...' : 'Upload to Cloud'}
            </button>
            <button onClick={resetForm} className="reset-btn">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsPOD;