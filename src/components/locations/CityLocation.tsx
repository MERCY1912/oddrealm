import React from 'react';
import LocationView from '../LocationView';

interface CityLocationProps {
  onNavigate: (location: string) => void;
}

const CityLocation = ({ onNavigate }: CityLocationProps) => {
  const availableActions = [
    {
      name: "Кузница",
      description: "Улучшение и ремонт снаряжения",
      icon: "🔨",
      action: () => onNavigate('blacksmith')
    },
    {
      name: "Магазин",
      description: "Покупайте снаряжение и предметы",
      icon: "🏪",
      action: () => onNavigate('shop')
    },
    {
      name: "Таверна",
      description: "Отдых и получение квестов",
      icon: "🍺",
      action: () => onNavigate('tavern')
    },
    {
      name: "PvP Арена",
      description: "Сражения с другими игроками",
      icon: "⚔️",
      action: () => onNavigate('pvp-arena')
    },
    {
      name: "Лес",
      description: "Охота на монстров и сбор ресурсов",
      icon: "🌲",
      action: () => onNavigate('forest')
    },
    {
      name: "Подземелье",
      description: "Опасные подземные лабиринты",
      icon: "🏰",
      action: () => onNavigate('dungeon')
    },
    {
      name: "Гильдия",
      description: "Вступление в гильдии и PvP",
      icon: "🏛️",
      action: () => onNavigate('guild')
    },
    {
      name: "Банк",
      description: "Хранение золота и предметов",
      icon: "🏦",
      action: () => onNavigate('bank')
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
      locationName="ГОРОД"
      locationImage="🏰"
      locationDescription="Главный город королевства! Здесь кипит жизнь, и вы можете найти множество услуг и развлечений."
      availableActions={availableActions}
    />
  );
};

export default CityLocation;
