
import { getAssetTypes, getAssets } from "@/lib/data";
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
import { ClipboardList, PlusCircle } from "lucide-react";
import { AddAssetTypeDialog } from "@/components/add-asset-type-dialog";

export default async function AssetManagementPage() {
  const assetTypes = await getAssetTypes();
  const allAssets = await getAssets();

  const getAssetCountByType = (assetTypeId: string) => {
    return allAssets.filter(asset => asset.assetTypeId === assetTypeId).length;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <ClipboardList className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý loại tài sản</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Tạo và xem các loại tài sản trong hệ thống.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách loại tài sản</CardTitle>
            <AddAssetTypeDialog>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo loại
              </Button>
            </AddAssetTypeDialog>
          </div>
          <CardDescription>
            Đây là danh sách tất cả các loại tài sản bạn đã định nghĩa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên loại tài sản</TableHead>
                <TableHead className="text-right">Số lượng hiện có</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Chưa có loại tài sản nào.
                  </TableCell>
                </TableRow>
              ) : (
                assetTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{getAssetCountByType(type.id)}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
