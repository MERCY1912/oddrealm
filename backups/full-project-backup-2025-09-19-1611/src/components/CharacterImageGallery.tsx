
import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterImageGalleryProps {
  selectedImage: string | null;
  onSelectImage: (url: string) => void;
  galleryImages: string[];
}

const CharacterImageGallery = ({ selectedImage, onSelectImage, galleryImages }: CharacterImageGalleryProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-white">Выберите образ персонажа</h4>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto">
        {galleryImages.map((url) => (
          <img
            key={url}
            src={url}
            alt="Character"
            onClick={() => onSelectImage(url)}
            className={cn(
              'h-20 w-16 rounded-md cursor-pointer object-cover transition-all hover:scale-105',
              selectedImage === url && 'ring-2 ring-offset-2 ring-offset-gray-800 ring-blue-400'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterImageGallery;
