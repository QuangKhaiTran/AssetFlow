
import { getAssetTypes, getAssets } from "@/lib/data";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddAssetTypeDialog } from "@/components/add-asset-type-dialog";

export default async function AssetManagementPage() {
  const assetTypes = await getAssetTypes();
  const allAssets = await getAssets();

  const getAssetCountByType = (assetTypeId: string) => {
    return allAssets.filter(asset => asset.assetTypeId === assetTypeId).length;
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách loại tài sản</CardTitle>
            <AddAssetTypeDialog>
              <Button size="sm">
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
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
                  <TableRow 
                    key={type.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link 
                        href={`/asset-types/${type.id}`}
                        className="block w-full h-full"
                      >
                        {type.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/asset-types/${type.id}`}
                        className="block w-full h-full"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {getAssetCountByType(type.id)}
                        </span>
                      </Link>
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
