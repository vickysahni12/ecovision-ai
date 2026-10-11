'use client';

import React, { useState, useEffect } from 'react';
import { Recycle } from 'lucide-react';
import { getThumbnail } from '@/lib/imageStorage';

interface ScanThumbnailProps {
  scanId: string;
  itemName: string;
  initialUrl?: string;
  s3Key?: string;
}

export default function ScanThumbnail({
  scanId,
  itemName,
  initialUrl,
  s3Key,
}: ScanThumbnailProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    // If initialUrl is provided, no query needed
    if (initialUrl) return;

    let isMounted = true;

    // First try fast local IndexedDB thumbnail
    getThumbnail(scanId)
      .then((url) => {
        if (isMounted && url) {
          setThumbUrl(url);
          return;
        }

        // If no local thumbnail but s3Key exists, request presigned URL
        if (isMounted && s3Key) {
          fetch(`/api/presigned?key=${encodeURIComponent(s3Key)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (isMounted && data?.presignedUrl) {
                setThumbUrl(data.presignedUrl);
              }
            })
            .catch(() => {
              // Fallback gracefully
            });
        }
      })
      .catch(() => {
        // Fallback gracefully
      });

    return () => {
      isMounted = false;
    };
  }, [scanId, initialUrl, s3Key]);

  const activeUrl = initialUrl || thumbUrl;

  if (activeUrl && !loadFailed) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeUrl}
          alt={itemName}
          onError={() => setLoadFailed(true)}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
      <Recycle className="w-6 h-6" />
    </div>
  );
}
