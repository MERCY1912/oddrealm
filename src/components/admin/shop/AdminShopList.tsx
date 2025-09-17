
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminShopItem as AdminShopItemType } from '@/types/admin';
import AdminShopItem from './AdminShopItem';

interface AdminShopListProps {
  items: AdminShopItemType[];
  onEdit: (item: AdminShopItemType) => void;
  onDelete: (id: string) => void;
}

const AdminShopList: React.FC<AdminShopListProps> = ({ items, onEdit, onDelete }) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-green-400">Список предметов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <AdminShopItem key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminShopList;
