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

const statusIcons: { [key: Asset['status']]: React.ReactNode } = {
  "In Use": <CheckCircle className="text-green-500" />,
  "Under Repair": <Wrench className="text-yellow-500" />,
  "Broken": <XCircle className="text-red-500" />,
  "Disposed": <Trash2 className="text-gray-500" />,
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
        <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets Under Repair</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAssetsByStatus('Under Repair')}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <Button>Create New Room</Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Asset Count</TableHead>
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
                      <Link href={`/rooms/${room.id}`}>View</Link>
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
