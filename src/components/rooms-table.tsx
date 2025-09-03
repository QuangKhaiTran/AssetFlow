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
import { type Room, type Asset } from "@/lib/types";


interface RoomsTableProps {
  rooms: Room[];
  assets: Asset[];
}

export function RoomsTable({ rooms, assets }: RoomsTableProps) {
  const router = useRouter();

  const getAssetCountForRoom = (roomId: string) => {
    return assets.filter((asset) => asset.roomId === roomId).length;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%] text-xs">Tên phòng</TableHead>
          <TableHead className="w-[40%] text-xs">Người quản lý</TableHead>
          <TableHead className="w-[10%] text-center text-xs">Tài sản</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow 
            key={room.id} 
            className="group cursor-pointer"
            onClick={() => router.push(`/rooms/${room.id}`)}
          >
            <TableCell 
              className="font-medium text-xs"
            >
              {room.name}
            </TableCell>
            <TableCell 
              className="text-xs"
            >
              {room.managerName}
            </TableCell>
            <TableCell 
              className="text-center"
            >
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
