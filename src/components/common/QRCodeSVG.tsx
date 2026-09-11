import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  showValueLabel?: boolean;
}

// Generates an authentic, 100% ISO-standard machine-scannable QR code using the official QRCode algorithm
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 130,
  className = '',
  showValueLabel = true,
}) => {
  const [svgString, setSvgString] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!value) {
      setSvgString('');
      return;
    }

    QRCode.toString(value, {
      type: 'svg',
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((svg) => {
        if (isMounted) {
          setSvgString(svg);
          setError(null);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        if (isMounted) {
          setError('Failed to generate QR');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value]);

  return (
    <div className={`inline-flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-2xs border border-slate-200 ${className}`}>
      {error ? (
        <div className="w-[120px] h-[120px] flex items-center justify-center text-xs text-rose-500 text-center p-2">
          {error}
        </div>
      ) : svgString ? (
        <div
          className="qr-code-svg flex items-center justify-center [&>svg]:block [&>svg]:rounded-sm"
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center bg-slate-100 animate-pulse rounded-lg text-[10px] text-slate-400 font-mono"
        >
          Generating QR...
        </div>
      )}

      {showValueLabel && (
        <div className="mt-1.5 text-center font-mono text-[10px] text-slate-500 font-semibold tracking-wider truncate max-w-[150px]">
          {value.startsWith('http') ? new URL(value).pathname + (new URL(value).search || '') : value}
        </div>
      )}
    </div>
  );
};
