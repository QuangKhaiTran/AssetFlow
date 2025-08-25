"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type Asset, type Room } from '@/lib/types';
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
import { moveAsset } from '@/lib/actions';

const formSchema = z.object({
  roomId: z.string().min(1, 'Vui lòng chọn phòng mới.'),
});

type MoveAssetFormValues = z.infer<typeof formSchema>;

interface MoveAssetDialogProps {
  children: React.ReactNode;
  asset: Asset;
  rooms: Room[];
}

export function MoveAssetDialog({ children, asset, rooms }: MoveAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MoveAssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: '',
    },
  });

  const onSubmit: SubmitHandler<MoveAssetFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await moveAsset({ assetId: asset.id, newRoomId: data.roomId });
      const roomName = rooms.find(r => r.id === data.roomId)?.name || 'không rõ';
      toast({
        title: 'Thành công',
        description: `Đã di dời tài sản "${asset.name}" đến phòng ${roomName}.`,
      });
      form.reset();
      setOpen(false);
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể di dời tài sản. Vui lòng thử lại.',
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
              <DialogTitle>Di dời tài sản</DialogTitle>
              <DialogDescription>
                Chọn phòng mới để di dời tài sản &quot;{asset.name}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng mới</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn một phòng..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms
                          .filter((room) => room.id !== asset.roomId)
                          .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
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
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
