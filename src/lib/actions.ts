'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type Asset } from './types';

// Using Firebase client SDK directly instead of API calls to Firebase Functions


// --- ROOM ACTIONS ---
const AddRoomSchema = z.object({
  name: z.string().min(1, 'Tên phòng là bắt buộc.'),
  managerName: z.string().min(1, 'Tên người quản lý là bắt buộc.'),
});
export async function addRoom(formData: z.infer<typeof AddRoomSchema>) {
  const validatedData = AddRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

  // Use Firebase client SDK directly instead of API call
  const { addDoc, collection } = await import('firebase/firestore');
  const { db } = await import('./firebase');

  try {
    const docRef = await addDoc(collection(db, 'rooms'), validatedData.data);
    revalidatePath('/');
    return {
      message: "Đã thêm phòng thành công.",
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error adding room:', error);
    throw new Error('Không thể thêm phòng.');
  }
}

const UpdateRoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tên phòng là bắt buộc.'),
  managerName: z.string().min(1, 'Tên người quản lý là bắt buộc.'),
});
export async function updateRoom(formData: z.infer<typeof UpdateRoomSchema>) {
  const validatedData = UpdateRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

  const { id, ...updateData } = validatedData.data;

  // Use Firebase client SDK directly instead of API call
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('./firebase');

  try {
    await updateDoc(doc(db, 'rooms', id), updateData);
    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    return {
      message: "Cập nhật phòng thành công.",
    };
  } catch (error) {
    console.error('Error updating room:', error);
    throw new Error('Không thể cập nhật phòng.');
  }
}

const DeleteRoomSchema = z.object({
  id: z.string().min(1),
});
export async function deleteRoom(formData: z.infer<typeof DeleteRoomSchema>) {
  const validatedData = DeleteRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

  const { id } = validatedData.data;

  // Use Firebase client SDK directly instead of API call
  const { doc, deleteDoc, collection, getDocs, query, where } = await import('firebase/firestore');
  const { db } = await import('./firebase');

  try {
    // Check if there are any assets in the room
    const assetsQuery = query(collection(db, 'assets'), where('roomId', '==', id));
    const assetsSnapshot = await getDocs(assetsQuery);

    if (!assetsSnapshot.empty) {
      throw new Error('Không thể xóa phòng có chứa tài sản.');
    }

    await deleteDoc(doc(db, 'rooms', id));
    revalidatePath('/');
    return {
      message: "Xóa phòng thành công.",
    };
  } catch (error) {
    console.error('Error deleting room:', error);
    if (error.message === 'Không thể xóa phòng có chứa tài sản.') {
      throw error;
    }
    throw new Error('Không thể xóa phòng.');
  }
}


// --- ASSET ACTIONS ---
const AddAssetSchema = z.object({
    name: z.string().min(1, 'Tên tài sản là bắt buộc.'),
    quantity: z.number().int().min(1),
    roomId: z.string().min(1),
});
export async function addAsset(formData: z.infer<typeof AddAssetSchema>): Promise<{ newAssets: Pick<Asset, 'id' | 'name'>[] }> {
    const validatedData = AddAssetSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

    // Use Firebase client SDK directly instead of API call
    const { addDoc, collection } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    try {
        const { name, quantity, roomId } = validatedData.data;
        const newAssets: Pick<Asset, 'id' | 'name'>[] = [];

        for (let i = 0; i < quantity; i++) {
            const assetName = quantity > 1 ? `${name} #${i + 1}` : name;

            const docRef = await addDoc(collection(db, 'assets'), {
                name: assetName,
                roomId,
                status: 'Đang sử dụng',
                dateAdded: new Date().toISOString().split('T')[0],
            });

            newAssets.push({ id: docRef.id, name: assetName });
        }

        revalidatePath(`/rooms/${roomId}`);
        revalidatePath('/');

        return {
            message: "Đã thêm tài sản thành công.",
            newAssets,
        };
    } catch (error) {
        console.error('Error adding assets:', error);
        throw new Error('Không thể thêm tài sản.');
    }
}


const UpdateAssetStatusSchema = z.object({
    assetId: z.string().min(1),
    status: z.enum(['Đang sử dụng', 'Đang sửa chữa', 'Bị hỏng', 'Đã thanh lý']),
});
export async function updateAssetStatus(formData: z.infer<typeof UpdateAssetStatusSchema>) {
    const validatedData = UpdateAssetStatusSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

    // Use Firebase client SDK directly instead of API call
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    try {
        const { assetId, status } = validatedData.data;
        await updateDoc(doc(db, 'assets', assetId), { status });

        revalidatePath(`/assets/${assetId}`);
        revalidatePath('/');
        revalidatePath('/reports');

        return {
            message: "Cập nhật trạng thái tài sản thành công.",
        };
    } catch (error) {
        console.error('Error updating asset status:', error);
        throw new Error('Không thể cập nhật trạng thái.');
    }
}


const MoveAssetSchema = z.object({
    assetId: z.string().min(1),
    newRoomId: z.string().min(1),
});
export async function moveAsset(formData: z.infer<typeof MoveAssetSchema>) {
    const validatedData = MoveAssetSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

    // Use Firebase client SDK directly instead of API call
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('./firebase');

    try {
        const { assetId, newRoomId } = validatedData.data;
        await updateDoc(doc(db, 'assets', assetId), { roomId: newRoomId });

        revalidatePath(`/assets/${assetId}`);
        revalidatePath(`/rooms/${newRoomId}`);
        revalidatePath('/');

        return {
            message: "Di dời tài sản thành công.",
        };
    } catch (error) {
        console.error('Error moving asset:', error);
        throw new Error('Không thể di dời tài sản.');
    }
}
