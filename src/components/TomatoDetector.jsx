import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, ScanEye, Activity, Layers } from 'lucide-react';

const TomatoDetector = () => {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // STATE BARU: Menyimpan URL gambar hasil pemrosesan (Grayscale, Binary, ROI)
  const [processedImgs, setProcessedImgs] = useState({ 
    gray: null, 
    binary: null, 
    roi: null 
  });
  
  const canvasRef = useRef(null);

  // --- LOGIKA HITUNG MATURITY ---
  const calculateMaturity = (avgRed, avgGreen) => {
    if (avgGreen === 0) return { score: 100, ratio: 0 };
    const ratio = avgRed / avgGreen;

    // Kalibrasi Rasio (Bisa disesuaikan dengan kondisi cahaya)
    const minRatio = 0.7; 
    const maxRatio = 1.4; 

    let percentage = ((ratio - minRatio) / (maxRatio - minRatio)) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    return { 
      score: Math.round(percentage), 
      ratio: ratio.toFixed(2) 
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setResult(null);
      // Reset gambar proses saat ganti foto
      setProcessedImgs({ gray: null, binary: null, roi: null }); 
    }
  };

  const processImage = () => {
    if (!preview) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = preview;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Resize agar proses lebih ringan & konsisten
      canvas.width = 300;
      canvas.height = (img.height / img.width) * 300;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Buat buffer pixel baru untuk 3 visualisasi
      const grayBuffer = ctx.createImageData(canvas.width, canvas.height);
      const binaryBuffer = ctx.createImageData(canvas.width, canvas.height);
      const roiBuffer = ctx.createImageData(canvas.width, canvas.height);

      let totalRed = 0, totalGreen = 0, count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 1. Convert ke Grayscale (Luminance Formula)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // 2. Logic Thresholding (Segmentasi)
        // Asumsi: Background foto putih/terang, Tomat berwarna/lebih gelap.
        // Jika pixel < 230 (bukan putih murni), kita anggap itu bagian dari Tomat.
        const isTomato = gray < 235; 

        // Tentukan nilai pixel Biner (Putih untuk objek, Hitam untuk background)
        const binaryColor = isTomato ? 255 : 0;

        // --- PENGISIAN BUFFER VISUALISASI ---

        // A. Visualisasi Grayscale
        grayBuffer.data[i] = gray;
        grayBuffer.data[i+1] = gray;
        grayBuffer.data[i+2] = gray;
        grayBuffer.data[i+3] = 255; // Alpha penuh

        // B. Visualisasi Binary (Thresholding)
        binaryBuffer.data[i] = binaryColor;
        binaryBuffer.data[i+1] = binaryColor;
        binaryBuffer.data[i+2] = binaryColor;
        binaryBuffer.data[i+3] = 255;

        // C. Visualisasi ROI (Region of Interest)
        // Jika Tomat -> Warna Asli. Jika Background -> Hitam.
        if (isTomato) {
            roiBuffer.data[i] = r;
            roiBuffer.data[i+1] = g;
            roiBuffer.data[i+2] = b;
            roiBuffer.data[i+3] = 255;
            
            // Akumulasi warna HANYA jika pixel adalah tomat (untuk akurasi)
            totalRed += r;
            totalGreen += g;
            count++;
        } else {
            roiBuffer.data[i] = 0;
            roiBuffer.data[i+1] = 0;
            roiBuffer.data[i+2] = 0;
            roiBuffer.data[i+3] = 255;
        }
      }

      // --- KONVERSI BUFFER PIXEL MENJADI URL GAMBAR ---
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Simpan Gray
      tempCtx.putImageData(grayBuffer, 0, 0);
      const grayUrl = tempCanvas.toDataURL();

      // Simpan Binary
      tempCtx.putImageData(binaryBuffer, 0, 0);
      const binaryUrl = tempCanvas.toDataURL();

      // Simpan ROI
      tempCtx.putImageData(roiBuffer, 0, 0);
      const roiUrl = tempCanvas.toDataURL();

      // Update State Visualisasi
      setProcessedImgs({ gray: grayUrl, binary: binaryUrl, roi: roiUrl });

      // --- HASIL AKHIR ---
      const { score, ratio } = calculateMaturity(totalRed/count, totalGreen/count);

      let label = "", colorClass = "", barColor = "";
      if (score < 45) {
        label = "MENTAH (Unripe)"; colorClass = "text-green-700"; barColor = "bg-green-700";
      } else if (score < 75) {
        label = "MENGKAL (Turning)"; colorClass = "text-orange-600"; barColor = "bg-orange-600";
      } else {
        label = "MATANG (Ripe)"; colorClass = "text-red-900"; barColor = "bg-red-900";
      }

      setTimeout(() => {
        setResult({ label, score, ratio, colorClass, barColor });
        setIsProcessing(false);
      }, 800);
    };
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Canvas tersembunyi untuk pemrosesan data */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        
        {/* --- KOLOM KIRI: INPUT IMAGE --- */}
        <div className="flex-1 bg-orange-50 rounded-xl p-5 shadow-lg flex flex-col gap-3 relative overflow-hidden border border-orange-100">
            <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <Upload size={16} className="text-red-900" /> 1. Input Citra Asli
            </label>
            
            <div className={`relative flex-1 min-h-[200px] border-2 border-dashed rounded-xl overflow-hidden transition-all bg-white ${preview ? 'border-red-900' : 'border-stone-300 hover:border-red-400'}`}>
                {preview ? (
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 bg-orange-50 rounded-full shadow-sm flex items-center justify-center mb-2 text-red-900 border border-orange-100">
                           <Upload size={24} />
                        </div>
                        <span className="text-sm font-medium text-stone-500">Klik atau Seret Foto ke Sini</span>
                        <span className="text-[10px] text-stone-400 mt-1">JPG, PNG support</span>
                    </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            
            <div className="flex gap-2">
                <button 
                  onClick={() => {
                      setPreview(null); 
                      setResult(null); 
                      setProcessedImgs({gray:null, binary:null, roi:null});
                  }} 
                  className="p-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors border border-stone-300"
                  title="Reset"
                >
                  <RefreshCw size={18} />
                </button>
                
                <button 
                    onClick={processImage} 
                    disabled={!preview || isProcessing}
                    className="flex-1 bg-red-900 hover:bg-red-800 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-red-900/20"
                >
                    {isProcessing ? 'Memproses...' : <><ScanEye size={18} /> Proses Citra</>}
                </button>
            </div>
        </div>

        {/* --- KOLOM KANAN: HASIL ANALISIS --- */}
        <div className="flex-1 bg-orange-50 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden shadow-lg min-h-[200px] border border-orange-100">
            {result ? (
                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">HASIL KLASIFIKASI</p>
                    <h2 className={`text-3xl font-extrabold ${result.colorClass} leading-tight mb-4`}>{result.label}</h2>
                    
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1 font-medium text-stone-600">
                            <span>Tingkat Kematangan</span>
                            <span>{result.score}%</span>
                        </div>
                        <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                            <div className={`h-full transition-all duration-1000 ${result.barColor}`} style={{ width: `${result.score}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-stone-200 shadow-sm flex items-center">
                        <div className="flex-1 text-center">
                           <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Rasio R/G</p>
                           <p className="text-lg font-mono font-bold text-stone-700 leading-none">{result.ratio}</p>
                        </div>
                        <div className="h-8 w-px bg-stone-200"></div>
                        <div className="flex-1 text-center">
                           <p className="text-[9px] text-stone-400 uppercase tracking-wider mb-0.5">Algoritma</p>
                           <p className="text-xs font-bold text-stone-700 leading-none">RGB Color Analysis</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-stone-300">
                    <Activity size={40} className="mx-auto mb-3 opacity-20 text-red-900" />
                    <p className="text-xs text-stone-400">Hasil analisis akan <br/> muncul di sini.</p>
                </div>
            )}
            
            {result && (
               <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none ${result.barColor}`}></div>
            )}
        </div>
      </div>

      {/* --- VISUALISASI TAHAPAN PROSES --- */}
      {result && (
        <div className="border-t border-white/10 pt-4 animate-in fade-in duration-700">
           <div className="flex items-center gap-2 mb-3">
              <Layers size={14} className="text-red-800"/>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Visualisasi Tahapan Proses</h4>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              {/* 1. Grayscale */}
              <div className="bg-stone-900 rounded p-2 border border-stone-700">
                  <div className="aspect-video bg-black rounded overflow-hidden mb-1">
                     <img src={processedImgs.gray || preview} className="w-full h-full object-cover" alt="Gray" />
                  </div>
                  <p className="text-[10px] text-center text-stone-400">1. Grayscale</p>
              </div>

              {/* 2. Thresholding (Biner) */}
              <div className="bg-stone-900 rounded p-2 border border-stone-700">
                  <div className="aspect-video bg-black rounded overflow-hidden mb-1">
                     {/* Gambar sudah Hitam Putih murni dari proses pixel */}
                     <img src={processedImgs.binary || preview} className="w-full h-full object-cover" alt="Threshold" />
                  </div>
                  <p className="text-[10px] text-center text-stone-400">2. Thresholding</p>
              </div>

              {/* 3. ROI Selection */}
              <div className="bg-stone-900 rounded p-2 border border-stone-700">
                  <div className="aspect-video bg-black rounded overflow-hidden mb-1">
                     {/* Gambar sudah ter-cropping background hitam murni */}
                     <img src={processedImgs.roi || preview} className="w-full h-full object-cover" alt="ROI" />
                  </div>
                  <p className="text-[10px] text-center text-stone-400">3. ROI Selection</p>
              </div>

              {/* 4. Final Result */}
              <div className="bg-stone-900 rounded p-2 border border-red-900/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-900/5"></div>
                  <div className="aspect-video bg-black rounded overflow-hidden mb-1 border border-red-900/30">
                     <img src={preview} className="w-full h-full object-cover" alt="Final" />
                  </div>
                  <p className="text-[10px] text-center text-red-400 font-bold">4. Final Result</p>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};

export default TomatoDetector;