"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assets, rooms } from './data';
import { type AssetStatus } from './types';

// Schema for adding a room
const AddRoomSchema = z.object({
  name: z.string().min(1),
  managerId: z.string().min(1),
});

export async function addRoom(formData: z.infer<typeof AddRoomSchema>) {
  const validatedData = AddRoomSchema.safeParse(formData);
  if (!validatedData.success) {
    throw new Error('Dữ liệu không hợp lệ.');
  }

  const { name, managerId } = validatedData.data;
  const newRoom = {
    id: `room-${Date.now()}`,
    name,
    managerId,
  };
  rooms.unshift(newRoom); // Add to the beginning of the array
  revalidatePath('/');
  return { message: 'Đã thêm phòng thành công.' };
}

// Schema for adding an asset
const AddAssetSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().int().min(1),
    roomId: z.string().min(1),
});

export async function addAsset(formData: z.infer<typeof AddAssetSchema>) {
    const validatedData = AddAssetSchema.safeParse(formData);
    if (!validatedData.success) {
        throw new Error('Dữ liệu không hợp lệ.');
    }
    const { name, quantity, roomId } = validatedData.data;

    for (let i = 0; i < quantity; i++) {
        const newAsset = {
            id: `asset-${Date.now()}-${i}`,
            name: quantity > 1 ? `${name} #${i + 1}` : name,
            roomId,
            status: 'Đang sử dụng' as AssetStatus,
            dateAdded: new Date().toISOString().split('T')[0],
        };
        assets.unshift(newAsset);
    }
    
    revalidatePath(`/rooms/${roomId}`);
    revalidatePath('/');
    return { message: `Đã thêm ${quantity} tài sản thành công.` };
}

// Schema for updating asset status
const UpdateAssetStatusSchema = z.object({
    assetId: z.string().min(1),
    status: z.enum(['Đang sử dụng', 'Đang sửa chữa', 'Bị hỏng', 'Đã thanh lý']),
});

export async function updateAssetStatus(formData: z.infer<typeof UpdateAssetStatusSchema>) {
    const validatedData = UpdateAssetStatusSchema.safeParse(formData);
    if (!validatedData.success) {
        throw new Error('Dữ liệu không hợp lệ.');
    }

    const { assetId, status } = validatedData.data;
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex === -1) {
        throw new Error('Không tìm thấy tài sản.');
    }

    assets[assetIndex].status = status;
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/rooms/${assets[assetIndex].roomId}`);
    revalidatePath('/');
    return { message: 'Cập nhật trạng thái tài sản thành công.' };
}

// Schema for moving an asset
const MoveAssetSchema = z.object({
    assetId: z.string().min(1),
    newRoomId: z.string().min(1),
});

export async function moveAsset(formData: z.infer<typeof MoveAssetSchema>) {
    const validatedData = MoveAssetSchema.safeParse(formData);
    if (!validatedData.success) {
        throw new Error('Dữ liệu không hợp lệ.');
    }

    const { assetId, newRoomId } = validatedData.data;
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex === -1) {
        throw new Error('Không tìm thấy tài sản.');
    }
    
    const oldRoomId = assets[assetIndex].roomId;
    assets[assetIndex].roomId = newRoomId;

    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/rooms/${oldRoomId}`);
    revalidatePath(`/rooms/${newRoomId}`);
    revalidatePath('/');
    return { message: 'Di dời tài sản thành công.' };
}
