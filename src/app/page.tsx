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
import { Building, Users, Box, CheckCircle, Wrench, XCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { type Asset } from "@/lib/types";
import { AddRoomDialog } from "@/components/add-room-dialog";

const statusIcons: { [key: Asset['status']]: React.ReactNode } = {
  "Đang sử dụng": <CheckCircle className="text-green-500" />,
  "Đang sửa chữa": <Wrench className="text-yellow-500" />,
  "Bị hỏng": <XCircle className="text-red-500" />,
  "Đã thanh lý": <Trash2 className="text-gray-500" />,
};

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
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Tổng quan</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số tài sản</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người quản lý</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tài sản đang sửa chữa</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAssetsByStatus('Đang sửa chữa')}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Phòng</h2>
           <AddRoomDialog users={users}>
            <Button>Tạo phòng mới</Button>
          </AddRoomDialog>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên phòng</TableHead>
                <TableHead>Người quản lý</TableHead>
                <TableHead className="text-right">Số lượng tài sản</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{getManagerName(room.managerId)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">
                      {getAssetCountForRoom(room.id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
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
