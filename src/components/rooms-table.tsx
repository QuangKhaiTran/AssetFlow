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
import { MoreVertical, Edit, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRoomDialog } from "./edit-room-dialog";
import { DeleteRoomDialog } from "./delete-room-dialog";


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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%] text-xs">Tên phòng</TableHead>
          <TableHead className="w-[40%] text-xs">Người quản lý</TableHead>
          <TableHead className="w-[10%] text-center text-xs">Tài sản</TableHead>
          <TableHead className="w-[10%] text-right text-xs">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow 
            key={room.id} 
            className="group"
          >
            <TableCell 
              className="font-medium text-xs cursor-pointer"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              {room.name}
            </TableCell>
            <TableCell 
              className="text-xs cursor-pointer"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              {getManagerName(room.managerId)}
            </TableCell>
            <TableCell 
              className="text-center cursor-pointer"
              onClick={() => router.push(`/rooms/${room.id}`)}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {getAssetCountForRoom(room.id)}
              </span>
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <EditRoomDialog room={room} users={users}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Chỉnh sửa</span>
                            </DropdownMenuItem>
                        </EditRoomDialog>
                         <DeleteRoomDialog room={room}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Xóa</span>
                            </DropdownMenuItem>
                        </DeleteRoomDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
