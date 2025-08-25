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
import { addAssetType } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(1, 'Tên loại tài sản là bắt buộc.'),
});

type AddAssetTypeFormValues = z.infer<typeof formSchema>;

interface AddAssetTypeDialogProps {
  children: React.ReactNode;
}

export function AddAssetTypeDialog({ children }: AddAssetTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddAssetTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit: SubmitHandler<AddAssetTypeFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await addAssetType(data);
      toast({
        title: 'Thành công',
        description: `Đã thêm loại tài sản "${data.name}".`,
      });
      form.reset();
      setOpen(false);
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể thêm loại tài sản. Vui lòng thử lại.',
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
              <DialogTitle>Tạo loại tài sản mới</DialogTitle>
              <DialogDescription>
                Nhập tên cho loại tài sản mới. Ví dụ: Bàn học sinh, Máy chiếu...
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên loại tài sản</FormLabel>
                    <FormControl>
                      <Input placeholder="ví dụ: Bàn học sinh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
