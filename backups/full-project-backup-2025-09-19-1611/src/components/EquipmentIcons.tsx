
export const equipmentIcons = {
  // Weapons
  'Окровавленный клинок': '⚔️',
  'Посох некроманта': '🔮',
  'Лук кровавого охотника': '🏹',
  'Железный меч': '⚔️',
  'Стальной клинок': '🗡️',
  'Волшебный посох': '🪄',
  'Эльфийский лук': '🏹',
  
  // Armor
  'Броня мертвеца': '🛡️',
  'Доспехи повелителя тьмы': '⚔️',
  'Кожаная броня': '🦺',
  'Кольчуга': '🛡️',
  'Платиновые доспехи': '⚡',
  
  // Helmets
  'Шлем палача': '⛑️',
  'Железный шлем': '⛑️',
  'Корона мага': '👑',
  'Капюшон вора': '🎭',
  
  // Boots
  'Сапоги убийцы': '👢',
  'Железные сапоги': '🥾',
  'Легкие ботинки': '👟',
  'Магические сапоги': '✨',
  
  // Gloves
  'Перчатки вора': '🧤',
  'Железные перчатки': '🥊',
  'Магические перчатки': '✋',
  
  // Accessories
  'Кольцо силы': '💍',
  'Амулет защиты': '📿',
  'Пояс воина': '🔗',
  'Щит рыцаря': '🛡️',
  
  // Default icons by type
  weapon: '⚔️',
  armor: '🛡️',
  helmet: '⛑️',
  boots: '👢',
  gloves: '🧤',
  belt: '🔗',
  necklace: '📿',
  ring: '💍',
  shield: '🛡️',
  leggings: '🦵',
  bracers: '🦾',
  earring: '💎',
  quest: '🗝️',
  consumable: '🧪',
  material: '💎',
};

export const getEquipmentIcon = (itemName: string, itemType?: string): string => {
  // Try to find specific icon by name first
  if (equipmentIcons[itemName as keyof typeof equipmentIcons]) {
    return equipmentIcons[itemName as keyof typeof equipmentIcons];
  }
  
  // Fall back to type-based icon
  if (itemType && equipmentIcons[itemType as keyof typeof equipmentIcons]) {
    return equipmentIcons[itemType as keyof typeof equipmentIcons];
  }
  
  // Default icon
  return '📦';
};
