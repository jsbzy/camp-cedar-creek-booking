"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface SiteGalleryProps {
  photos: string[];
  siteName: string;
}

export function SiteGallery({ photos, siteName }: SiteGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="relative grid gap-2 md:grid-cols-4 md:grid-rows-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className={`relative overflow-hidden rounded-lg ${
              i === 0
                ? "aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto"
                : i <= 3
                ? "hidden aspect-[4/3] md:block"
                : "hidden"
            }`}
          >
            <Image
              src={photo}
              alt={`${siteName} photo ${i + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
              priority={i === 0}
            />
            {/* "View all" overlay on last visible photo */}
            {i === 3 && photos.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50">
                <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <Images className="size-4" />
                  View all {photos.length} photos
                </div>
              </div>
            )}
          </button>
        ))}

        {/* Mobile "View all" button */}
        {photos.length > 1 && (
          <button
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm md:hidden"
          >
            <Images className="size-3.5" />
            View all {photos.length}
          </button>
        )}
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
