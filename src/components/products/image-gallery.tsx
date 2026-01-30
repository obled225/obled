import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ImageGalleryProps = {
  images: string[];
  alt: string;
};

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={images[selectedImage]}
          alt={`${alt} - Image ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
        />

        {images.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {selectedImage + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
