'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type Asset, type AssetStatus } from './types';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';

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

  try {
    const { name, managerId } = validatedData.data;
    const roomsCol = collection(db, 'rooms');
    await addDoc(roomsCol, {
      name,
      managerId,
    });
    revalidatePath('/');
    return { message: 'Đã thêm phòng thành công.' };
  } catch (error) {
    console.error("Lỗi khi thêm phòng:", error);
    throw new Error('Không thể thêm phòng.');
  }
}

// Schema for adding an asset
const AddAssetSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().int().min(1),
    roomId: z.string().min(1),
    assetTypeId: z.string().min(1),
});

export async function addAsset(formData: z.infer<typeof AddAssetSchema>): Promise<{ newAssets: Pick<Asset, 'id' | 'name'>[] }> {
    const validatedData = AddAssetSchema.safeParse(formData);
    if (!validatedData.success) {
        throw new Error('Dữ liệu không hợp lệ.');
    }
    const { name, quantity, roomId, assetTypeId } = validatedData.data;
    const newAssets: Pick<Asset, 'id' | 'name'>[] = [];
    
    const assetsCol = collection(db, 'assets');
    const batch = writeBatch(db);

    for (let i = 0; i < quantity; i++) {
        const newAssetDocRef = doc(assetsCol); // Auto-generate ID
        const assetName = quantity > 1 ? `${name} #${i + 1}` : name;
        const newAssetData = {
            name: assetName,
            roomId,
            status: 'Đang sử dụng' as AssetStatus,
            dateAdded: new Date().toISOString().split('T')[0],
            assetTypeId,
        };
        batch.set(newAssetDocRef, newAssetData);
        newAssets.push({ id: newAssetDocRef.id, name: assetName });
    }
    
    await batch.commit();
    
    revalidatePath(`/rooms/${roomId}`);
    revalidatePath('/asset-management');
    revalidatePath('/');
    return { newAssets };
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
    const assetDocRef = doc(db, 'assets', assetId);

    // To revalidate paths, we might need to fetch the asset first to get roomId.
    // For simplicity now, we revalidate generic paths.
    // In a real app, you might fetch the doc before update.
    await updateDoc(assetDocRef, { status });

    revalidatePath(`/assets/${assetId}`);
    revalidatePath('/'); // Revalidates all pages that might show asset status
    revalidatePath('/asset-management');
    revalidatePath('/reports');
    revalidatePath('/users');
    // A more robust solution would be to get the room ID and revalidate that specific room page.
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
    const assetDocRef = doc(db, 'assets', assetId);

    await updateDoc(assetDocRef, { roomId: newRoomId });

    // This requires knowing old and new room IDs.
    // Revalidating multiple paths to ensure data consistency.
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/rooms/${newRoomId}`);
    // We don't know the old room ID here without another read, so revalidate all rooms for simplicity
    revalidatePath('/'); 
    return { message: 'Di dời tài sản thành công.' };
}

// Schema for adding an asset type
const AddAssetTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại tài sản là bắt buộc.'),
});

export async function addAssetType(formData: z.infer<typeof AddAssetTypeSchema>) {
  const validatedData = AddAssetTypeSchema.safeParse(formData);
  if (!validatedData.success) {
    throw new Error('Dữ liệu không hợp lệ.');
  }
  
  const { name } = validatedData.data;
  
  const assetTypesCol = collection(db, 'assetTypes');
  await addDoc(assetTypesCol, { name });
  
  revalidatePath('/asset-management');
  return { message: 'Đã thêm loại tài sản thành công.' };
}

// Schema for adding a user
const AddUserSchema = z.object({
  name: z.string().min(1, 'Tên người dùng là bắt buộc.'),
});

export async function addUser(formData: z.infer<typeof AddUserSchema>) {
  const validatedData = AddUserSchema.safeParse(formData);
  if (!validatedData.success) {
    throw new Error('Dữ liệu không hợp lệ.');
  }

  try {
    const { name } = validatedData.data;
    const usersCol = collection(db, 'users');
    await addDoc(usersCol, {
      name,
    });
    revalidatePath('/users');
    return { message: 'Đã thêm người dùng thành công.' };
  } catch (error) {
    console.error("Lỗi khi thêm người dùng:", error);
    throw new Error('Không thể thêm người dùng.');
  }
}
