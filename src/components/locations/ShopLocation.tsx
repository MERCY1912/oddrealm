import React from 'react';
import LocationView from '../LocationView';

interface ShopLocationProps {
  onNavigate: (location: string) => void;
  onOpenShop: () => void;
  onOpenQuests: () => void;
}

const ShopLocation = ({ onNavigate, onOpenShop, onOpenQuests }: ShopLocationProps) => {
  const availableActions = [
    {
      name: "Купить предметы",
      description: "Просмотреть и купить снаряжение и предметы",
      icon: "🛒",
      action: onOpenShop
    },
    {
      name: "Взять задание",
      description: "Получить квесты от торговца",
      icon: "📜",
      action: onOpenQuests
    },
    {
      name: "Уйти",
      description: "Вернуться в город",
      icon: "🚪",
      action: () => onNavigate('city')
    }
  ];

  return (
    <LocationView
      locationName="МАГАЗИН"
      locationImage="🏪"
      locationDescription="Торговый дом, где можно приобрести лучшее снаряжение и получить задания от опытного торговца."
      availableActions={availableActions}
    />
  );
};

export default ShopLocation;
