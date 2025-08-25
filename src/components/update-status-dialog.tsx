"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Asset } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { updateAssetStatus } from '@/lib/actions';

const statuses = ['Đang sử dụng', 'Đang sửa chữa', 'Bị hỏng', 'Đã thanh lý'] as const;

const formSchema = z.object({
  status: z.enum(statuses, {
    required_error: "Vui lòng chọn một trạng thái."
  }),
});

type UpdateStatusFormValues = z.infer<typeof formSchema>;

interface UpdateStatusDialogProps {
  children: React.ReactNode;
  asset: Asset;
}

export function UpdateStatusDialog({ children, asset }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: asset.status,
    },
  });

  const onSubmit: SubmitHandler<UpdateStatusFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await updateAssetStatus({ assetId: asset.id, status: data.status });
      toast({
        title: 'Thành công',
        description: `Đã cập nhật trạng thái của tài sản "${asset.name}".`,
      });
      setOpen(false);
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Cập nhật trạng thái</DialogTitle>
              <DialogDescription>
                Chọn trạng thái mới cho tài sản &quot;{asset.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái mới</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses
                          .filter((status) => status !== asset.status)
                          .map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
