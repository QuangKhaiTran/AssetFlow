'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { type Room, type User, type Asset } from "@/lib/types";

interface RoomsTableProps {
  rooms: Room[];
  users: User[];
  assets: Asset[];
}

export function RoomsTable({ rooms, users, assets }: RoomsTableProps) {
  const router = useRouter();

  const getManagerName = (managerId: string) => {
    return users.find((user) => user.id === managerId)?.name || "N/A";
  };

  const getAssetCountForRoom = (roomId: string) => {
    return assets.filter((asset) => asset.roomId === roomId).length;
  };

  const handleRowClick = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-2/5 text-xs">Tên phòng</TableHead>
          <TableHead className="w-2/5 text-xs">Người quản lý</TableHead>
          <TableHead className="w-1/5 text-center text-xs">Tài sản</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow 
            key={room.id} 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleRowClick(room.id)}
          >
            <TableCell className="font-medium text-xs">
              {room.name}
            </TableCell>
            <TableCell className="text-xs">
              {getManagerName(room.managerId)}
            </TableCell>
            <TableCell className="text-center">
              <span className="text-xs font-medium text-muted-foreground">
                {getAssetCountForRoom(room.id)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}