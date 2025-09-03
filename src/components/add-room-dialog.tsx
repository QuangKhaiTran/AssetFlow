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
import { addRoom } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(1, 'Tên phòng là bắt buộc.'),
  managerName: z.string().min(1, 'Tên người quản lý là bắt buộc.'),
});

type AddRoomFormValues = z.infer<typeof formSchema>;

interface AddRoomDialogProps {
  children: React.ReactNode;
}

export function AddRoomDialog({ children }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddRoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      managerName: '',
    },
  });

  const onSubmit: SubmitHandler<AddRoomFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await addRoom(data);
      toast({
        title: 'Thành công',
        description: `Phòng "${data.name}" đã được tạo.`,
      });
      form.reset();
      setOpen(false);
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tạo phòng. Vui lòng thử lại.',
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
              <DialogTitle>Tạo phòng mới</DialogTitle>
              <DialogDescription>
                Điền thông tin phòng và tên người quản lý.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên phòng</FormLabel>
                    <FormControl>
                      <Input placeholder="ví dụ: Phòng Họp A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="managerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người quản lý</FormLabel>
                     <FormControl>
                      <Input placeholder="ví dụ: Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo phòng
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
