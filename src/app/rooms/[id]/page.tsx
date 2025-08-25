import { getRoomById, getAssetsByRoomId, getUserById } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
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
import { ArrowLeft, User, Calendar, PlusCircle, CheckCircle, Tool, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { type AssetStatus } from '@/lib/types';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'In Use': { icon: CheckCircle, color: 'text-green-600' },
    'Under Repair': { icon: Tool, color: 'text-amber-600' },
    'Broken': { icon: XCircle, color: 'text-red-600' },
    'Disposed': { icon: Trash2, color: 'text-gray-500' },
};

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const room = await getRoomById(params.id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(params.id);
  const manager = await getUserById(room.managerId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
        <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <div className='flex items-center gap-2'>
                <User className="h-4 w-4" />
                <span>Manager: {manager?.name || 'N/A'}</span>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Assets in {room.name}</CardTitle>
                <CardDescription>A list of all physical assets located in this room.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Assets
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No assets in this room yet.</TableCell>
                </TableRow>
              ) : (
                assets.map((asset) => {
                    const { icon: Icon, color } = statusConfig[asset.status];
                    return (
                        <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell>
                            <Badge variant={
                                asset.status === 'In Use' ? 'default' : 
                                asset.status === 'Under Repair' ? 'secondary' : 
                                asset.status === 'Broken' ? 'destructive' : 'outline'
                            } className="capitalize">
                                <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                {asset.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                <div className='flex items-center gap-2'>
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(asset.dateAdded).toLocaleDateString()}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/assets/${asset.id}`}>Details</Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                    );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
