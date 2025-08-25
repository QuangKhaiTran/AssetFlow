import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRooms, getAssets, getUsers } from "@/lib/data";
import { Building, Users, Box, Wrench } from "lucide-react";
import Link from "next/link";
import { type Asset } from "@/lib/types";
import { AddRoomDialog } from "@/components/add-room-dialog";

export default async function DashboardPage() {
  const rooms = await getRooms();
  const assets = await getAssets();
  const users = await getUsers();

  const getManagerName = (managerId: string) => {
    return users.find((user) => user.id === managerId)?.name || "N/A";
  };

  const getAssetCountForRoom = (roomId: string) => {
    return assets.filter((asset) => asset.roomId === roomId).length;
  };

  const getAssetsByStatus = (status: Asset['status']) => {
    return assets.filter(asset => asset.status === status).length;
  }

  return (
    <div className="flex flex-col gap-4">
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-xs font-medium">Tổng số phòng</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-xs font-medium">Tổng số tài sản</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold">{assets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-xs font-medium">Người quản lý</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
              <CardTitle className="text-xs font-medium">Đang sửa chữa</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-xl font-bold">{getAssetsByStatus('Đang sửa chữa')}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold tracking-tight">Phòng</h2>
           <AddRoomDialog users={users}>
            <Button size="sm">Tạo phòng mới</Button>
          </AddRoomDialog>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Tên phòng</TableHead>
                <TableHead className="text-[10px]">Người quản lý</TableHead>
                <TableHead className="text-right text-[10px]">Tài sản</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium text-[11px]">{room.name}</TableCell>
                  <TableCell className="text-[11px]">{getManagerName(room.managerId)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {getAssetCountForRoom(room.id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="h-7 px-2 text-[10px]">
                      <Link href={`/rooms/${room.id}`}>Xem</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
