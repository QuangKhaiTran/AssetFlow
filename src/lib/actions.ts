'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type Asset, type AssetStatus } from './types';

// Helper to construct API URL
const getApiUrl = (endpoint: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:9002/api';
    return `${baseUrl}/${endpoint}`;
};


// --- ROOM ACTIONS ---
const AddRoomSchema = z.object({
  name: z.string().min(1, 'Tên phòng là bắt buộc.'),
  managerId: z.string().min(1, 'Vui lòng chọn người quản lý.'),
});
export async function addRoom(formData: z.infer<typeof AddRoomSchema>) {
  const validatedData = AddRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

  const res = await fetch(getApiUrl('rooms'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData.data),
  });
  if (!res.ok) throw new Error('Không thể thêm phòng.');
  
  revalidatePath('/');
  return await res.json();
}

const UpdateRoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tên phòng là bắt buộc.'),
  managerId: z.string().min(1, 'Vui lòng chọn người quản lý.'),
});
export async function updateRoom(formData: z.infer<typeof UpdateRoomSchema>) {
  const validatedData = UpdateRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');
  
  const { id, ...updateData } = validatedData.data;
  const res = await fetch(getApiUrl(`rooms/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw new Error('Không thể cập nhật phòng.');

  revalidatePath('/');
  revalidatePath(`/rooms/${id}`);
  return await res.json();
}

const DeleteRoomSchema = z.object({
  id: z.string().min(1),
});
export async function deleteRoom(formData: z.infer<typeof DeleteRoomSchema>) {
  const validatedData = DeleteRoomSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');
  
  const { id } = validatedData.data;
  const res = await fetch(getApiUrl(`rooms/${id}`), { method: 'DELETE' });
  const resBody = await res.json();
  if (!res.ok) {
     throw new Error(resBody.error || 'Không thể xóa phòng.');
  }
  
  revalidatePath('/');
  return resBody;
}


// --- ASSET ACTIONS ---
const AddAssetSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().int().min(1),
    roomId: z.string().min(1),
    assetTypeId: z.string().min(1),
});
export async function addAsset(formData: z.infer<typeof AddAssetSchema>): Promise<{ newAssets: Pick<Asset, 'id' | 'name'>[] }> {
    const validatedData = AddAssetSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');
    
    const res = await fetch(getApiUrl('assets'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData.data),
    });
    if (!res.ok) throw new Error('Không thể thêm tài sản.');

    revalidatePath(`/rooms/${validatedData.data.roomId}`);
    revalidatePath('/asset-management');
    revalidatePath('/');
    return await res.json();
}


const UpdateAssetStatusSchema = z.object({
    assetId: z.string().min(1),
    status: z.enum(['Đang sử dụng', 'Đang sửa chữa', 'Bị hỏng', 'Đã thanh lý']),
});
export async function updateAssetStatus(formData: z.infer<typeof UpdateAssetStatusSchema>) {
    const validatedData = UpdateAssetStatusSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

    const res = await fetch(getApiUrl('assets/status'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData.data),
    });
    if (!res.ok) throw new Error('Không thể cập nhật trạng thái.');
    
    revalidatePath(`/assets/${validatedData.data.assetId}`);
    revalidatePath('/'); 
    revalidatePath('/asset-management');
    revalidatePath('/reports');
    return await res.json();
}


const MoveAssetSchema = z.object({
    assetId: z.string().min(1),
    newRoomId: z.string().min(1),
});
export async function moveAsset(formData: z.infer<typeof MoveAssetSchema>) {
    const validatedData = MoveAssetSchema.safeParse(formData);
    if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');

    const res = await fetch(getApiUrl('assets/move'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData.data),
    });
    if (!res.ok) throw new Error('Không thể di dời tài sản.');

    revalidatePath(`/assets/${validatedData.data.assetId}`);
    revalidatePath(`/rooms/${validatedData.data.newRoomId}`);
    revalidatePath('/'); 
    return await res.json();
}


// --- ASSET TYPE ACTIONS ---
const AddAssetTypeSchema = z.object({
  name: z.string().min(1, 'Tên loại tài sản là bắt buộc.'),
});
export async function addAssetType(formData: z.infer<typeof AddAssetTypeSchema>) {
  const validatedData = AddAssetTypeSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');
  
  const res = await fetch(getApiUrl('asset-types'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData.data),
  });
  if (!res.ok) throw new Error('Không thể thêm loại tài sản.');

  revalidatePath('/asset-management');
  return await res.json();
}


// --- USER ACTIONS ---
const AddUserSchema = z.object({
  name: z.string().min(1, 'Tên người dùng là bắt buộc.'),
});
export async function addUser(formData: z.infer<typeof AddUserSchema>) {
  const validatedData = AddUserSchema.safeParse(formData);
  if (!validatedData.success) throw new Error('Dữ liệu không hợp lệ.');
  
  const res = await fetch(getApiUrl('users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData.data),
  });
  if (!res.ok) throw new Error('Không thể thêm người dùng.');

  revalidatePath('/users');
  return await res.json();
}
