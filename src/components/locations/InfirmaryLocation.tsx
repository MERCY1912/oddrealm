import React from 'react';
import LocationView from '../LocationView';

interface InfirmaryLocationProps {
  onNavigate: (location: string) => void;
  onHeal: () => void;
  player: any;
}

const InfirmaryLocation = ({ onNavigate, onHeal, player }: InfirmaryLocationProps) => {
  const availableActions = [
    {
      name: "Лечение",
      description: `Восстановить здоровье (${player.health}/${player.maxHealth})`,
      icon: "💚",
      action: onHeal
    },
    {
      name: "Восстановление маны",
      description: `Восстановить ману (${player.mana}/${player.maxMana})`,
      icon: "💙",
      action: () => console.log("Mana restoration not implemented yet")
    },
    {
      name: "Полное восстановление",
      description: "Восстановить здоровье и ману",
      icon: "✨",
      action: () => console.log("Full restoration not implemented yet")
    },
    {
      name: "Вернуться домой",
      description: "Вернуться к персонажу",
      icon: "🏠",
      action: () => onNavigate('character')
    }
  ];

  return (
    <LocationView
      locationName="ЛЕЧЕБНИЦА"
      locationImage="🏥"
      locationDescription="Место исцеления и восстановления. Здесь вы можете восстановить здоровье и ману за золото."
      availableActions={availableActions}
    />
  );
};

export default InfirmaryLocation;
