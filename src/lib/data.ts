import { type Asset, type Room, type User, type AssetType } from "./types";
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// --- Dữ liệu giả lập (sẽ được thay thế dần) ---

export const assetTypes: AssetType[] = [
    { id: 'type-1', name: 'Bàn họp' },
    { id: 'type-2', name: 'Ghế xoay' },
    { id: 'type-3', name: 'Máy in Laser' },
    { id: 'type-4', name: 'Máy chiếu' },
    { id: 'type-5', name: 'Bảng trắng' },
    { id: 'type-6', name: 'Ghế văn phòng' },
    { id: 'type-7', name: 'Máy tính để bàn' },
    { id: 'type-8', name: 'Kính hiển vi' },
    { id: 'type-9', name: 'Tủ đựng hóa chất' },
]

export const assets: Asset[] = [
  { id: "asset-1", name: "Bàn họp", roomId: "room-1", status: "Đang sử dụng", dateAdded: "2023-01-15", assetTypeId: "type-1" },
  { id: "asset-2", name: "Ghế xoay", roomId: "room-2", status: "Đang sử dụng", dateAdded: "2023-02-20", assetTypeId: "type-2" },
  { id: "asset-3", name: "Máy in Laser", roomId: "room-2", status: "Đang sửa chữa", dateAdded: "2023-03-10", assetTypeId: "type-3" },
  { id: "asset-4", name: "Máy chiếu", roomId: "room-1", status: "Bị hỏng", dateAdded: "2023-04-05", assetTypeId: "type-4" },
  { id: "asset-5", name: "Bảng trắng", roomId: "room-1", status: "Đang sử dụng", dateAdded: "2023-01-15", assetTypeId: "type-5" },
  { id: "asset-6", name: "Ghế văn phòng", roomId: "room-2", status: "Đã thanh lý", dateAdded: "2022-11-30", assetTypeId: "type-6" },
  { id: "asset-7", name: "Máy tính để bàn", roomId: "room-2", status: "Đang sử dụng", dateAdded: "2023-05-01", assetTypeId: "type-7" },
  { id: "asset-8", name: "Kính hiển vi", roomId: "room-3", status: "Đang sử dụng", dateAdded: "2023-06-12", assetTypeId: "type-8" },
  { id: "asset-9", name: "Tủ đựng hóa chất", roomId: "room-3", status: "Đang sử dụng", dateAdded: "2023-06-12", assetTypeId: "type-9" },
];

// --- Các hàm tương tác với Firestore ---

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
    try {
        const userDocRef = doc(db, 'users', id);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() } as User;
        }
        return undefined;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return undefined;
    }
}

export async function getRooms(): Promise<Room[]> {
  try {
    const roomsCol = collection(db, 'rooms');
    const roomSnapshot = await getDocs(roomsCol);
    const roomList = roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
    return roomList;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    return [];
  }
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  try {
    const roomDocRef = doc(db, 'rooms', id);
    const roomSnap = await getDoc(roomDocRef);
    if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() } as Room;
    }
    return undefined;
  } catch(error) {
      console.error("Lỗi khi lấy thông tin phòng:", error);
      return undefined;
  }
}


// --- Các hàm vẫn dùng dữ liệu giả lập ---

export async function getAssets(): Promise<Asset[]> {
  return Promise.resolve(assets);
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  return Promise.resolve(assets.find(asset => asset.id === id));
}

export async function getAssetsByRoomId(roomId: string): Promise<Asset[]> {
  return Promise.resolve(assets.filter(asset => asset.roomId === roomId));
}

export async function getAssetTypes(): Promise<AssetType[]> {
    return Promise.resolve(assetTypes);
}