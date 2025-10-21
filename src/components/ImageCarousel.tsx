"use client";

import { useState } from "react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function ImageCarousel({ images, alt, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // If only one image, render as single image
  if (images.length <= 1) {
    return (
      <div className={`project-visual ${className}`}>
        <img src={images[0]} alt={alt} />
      </div>
    );
  }

  return (
    <div className={`project-visual ${className}`}>
      <div className="relative overflow-hidden rounded-lg">
        {/* Image container with sliding animation */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 project-visual-slides">
              <img src={image} alt={`${alt} ${index + 1}`} className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10 project-slide-button"
          aria-label="Previous image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10 project-slide-button"
          aria-label="Next image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
        
        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10 project-slide-count">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
