
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarGalleryProps {
  selectedAvatar: string | null;
  onSelectAvatar: (url: string) => void;
  galleryImages: string[];
}

const AvatarGallery = ({ selectedAvatar, onSelectAvatar, galleryImages }: AvatarGalleryProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-white">Выберите образ</h4>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {galleryImages.map((url) => (
          <img
            key={url}
            src={url}
            alt="Avatar"
            onClick={() => onSelectAvatar(url)}
            className={cn(
              'h-16 w-16 rounded-md cursor-pointer object-cover transition-all hover:scale-105',
              selectedAvatar === url && 'ring-2 ring-offset-2 ring-offset-gray-800 ring-red-400'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarGallery;
