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
import { Loader2 } from 'lucide-react';
import { addAsset } from '@/lib/actions';
import { type Asset } from '@/lib/types';
import { PrintQRCodesDialog } from './print-qr-codes-dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Tên tài sản là bắt buộc.'),
  quantity: z.coerce.number().int().min(1, 'Số lượng phải ít nhất là 1.'),
});

type AddAssetFormValues = z.infer<typeof formSchema>;

interface AddAssetDialogProps {
  children: React.ReactNode;
  roomId: string;
}

export function AddAssetDialog({ children, roomId }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newlyAddedAssets, setNewlyAddedAssets] = useState<Pick<Asset, 'id' | 'name'>[]>([]);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddAssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      quantity: 1,
    },
  });

  const onSubmit: SubmitHandler<AddAssetFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = await addAsset({
        name: data.name,
        quantity: data.quantity,
        roomId: roomId,
      });
      
      toast({
        title: 'Thành công',
        description: `Đã thêm ${data.quantity} tài sản "${data.name}".`,
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
                  Nhập thông tin tài sản và số lượng. Hệ thống sẽ tạo mã QR tương ứng.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên tài sản</FormLabel>
                      <FormControl>
                        <Input placeholder="ví dụ: Bàn làm việc" {...field} />
                      </FormControl>
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
