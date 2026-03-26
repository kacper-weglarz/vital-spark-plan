import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Loader2 } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 120 } },
        (text) => {
          scanner.stop().catch(() => {});
          onScan(text);
        },
        () => {}
      )
      .catch((err) => {
        setError('Nie udało się uruchomić kamery. Sprawdź uprawnienia.');
        console.error(err);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4">
        <span className="text-white font-bold">Skanuj kod kreskowy</span>
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4">
        <div ref={containerRef} id="barcode-reader" className="w-full max-w-sm rounded-2xl overflow-hidden" />
      </div>
      {error && (
        <div className="p-4 text-center">
          <p className="text-white/70 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
