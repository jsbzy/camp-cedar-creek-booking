"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface SiteGalleryProps {
  photos: string[];
  siteName: string;
}

export function SiteGallery({ photos, siteName }: SiteGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-2 md:grid-cols-3">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className={`relative overflow-hidden rounded-lg ${
              i === 0 ? "aspect-[16/10] md:col-span-2 md:row-span-2" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={photo}
              alt={`${siteName} photo ${i + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 text-white hover:text-white/70"
          >
            <X className="size-8" />
          </button>
          {lightboxIndex > 0 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex - 1)}
              className="absolute left-4 text-white hover:text-white/70"
            >
              <ChevronLeft className="size-10" />
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={() => setLightboxIndex(lightboxIndex + 1)}
              className="absolute right-4 text-white hover:text-white/70"
            >
              <ChevronRight className="size-10" />
            </button>
          )}
          <div className="relative h-[80vh] w-[90vw]">
            <Image
              src={photos[lightboxIndex]}
              alt={`${siteName} photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          <p className="absolute bottom-4 text-sm text-white/70">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
