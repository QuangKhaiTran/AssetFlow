"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { addAsset } from '@/lib/actions';
import { type Asset, type AssetType } from '@/lib/types';
import { PrintQRCodesDialog } from './print-qr-codes-dialog';

const formSchema = z.object({
  assetTypeId: z.string().min(1, 'Vui lòng chọn loại tài sản.'),
  quantity: z.coerce.number().int().min(1, 'Số lượng phải ít nhất là 1.'),
});

type AddAssetFormValues = z.infer<typeof formSchema>;

interface AddAssetDialogProps {
  children: React.ReactNode;
  roomId: string;
  assetTypes: AssetType[];
}

export function AddAssetDialog({ children, roomId, assetTypes }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Pick<Asset, 'id' | 'name'>[]>([]);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddAssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetTypeId: '',
      quantity: 1,
    },
  });

  const onSubmit: SubmitHandler<AddAssetFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const assetTypeName = assetTypes.find(t => t.id === data.assetTypeId)?.name || '';
      const result = await addAsset({
        name: assetTypeName,
        quantity: data.quantity,
        roomId: roomId,
        assetTypeId: data.assetTypeId,
      });
      
      toast({
        title: 'Thành công',
        description: `Đã thêm ${data.quantity} tài sản "${assetTypeName}".`,
      });

      form.reset();
      setOpen(false);

      if(result.newAssets && result.newAssets.length > 0) {
        setNewlyAddedAssets(result.newAssets);
        setShowPrintDialog(true);
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể thêm tài sản. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Thêm tài sản mới</DialogTitle>
                <DialogDescription>
                  Chọn loại tài sản và nhập số lượng. Hệ thống sẽ tạo mã QR tương ứng.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="assetTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại tài sản</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn một loại tài sản" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assetTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Thêm tài sản
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <PrintQRCodesDialog
        assets={newlyAddedAssets}
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
      />
    </>
  );
}
