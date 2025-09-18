import React from 'react';
import { Item } from '@/types/game';
import EnhancedItemTooltip from './EnhancedItemTooltip';

interface ItemTooltipProps {
  item: Item;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const ItemTooltip = ({ item, children, side = "right", className }: ItemTooltipProps) => {
  return (
    <EnhancedItemTooltip item={item} side={side} className={className}>
      {children}
    </EnhancedItemTooltip>
  );
};

export default ItemTooltip;
