import React from 'react';
import LocationView from '../LocationView';

interface CharacterLocationProps {
  onNavigate: (location: string) => void;
}

const CharacterLocation = ({ onNavigate }: CharacterLocationProps) => {
  return (
    <LocationView
      locationName="ПЕРСОНАЖ И ЭКИПИРОВКА"
      locationImage="👤"
      locationDescription="Ваш дом и место отдыха. Здесь вы можете управлять своим персонажем и планировать дальнейшие действия."
    />
  );
};

export default CharacterLocation;
