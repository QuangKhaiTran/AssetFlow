import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRooms, getAssets, getUsers } from "@/lib/data";
import { Building, Users, Box, Wrench } from "lucide-react";
import { type Asset } from "@/lib/types";
import { AddRoomDialog } from "@/components/add-room-dialog";
import { RoomsTable } from "@/components/rooms-table";

export default async function DashboardPage() {
  const rooms = await getRooms();
  const assets = await getAssets();
  const users = await getUsers();

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
          <h2 className="text-base md:text-lg font-bold tracking-tight">Phòng</h2>
           <AddRoomDialog users={users}>
            <Button size="sm">Tạo phòng mới</Button>
          </AddRoomDialog>
        </div>
        <Card>
          <RoomsTable rooms={rooms} users={users} assets={assets} />
        </Card>
      </section>
    </div>
  );
}
