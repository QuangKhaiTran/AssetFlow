import { type Asset, type Room, type User, type AssetType } from "./types";
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// --- Các hàm tương tác với Firestore ---

export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    // Sắp xếp người dùng theo tên để đảm bảo thứ tự nhất quán
    return userList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
    try {
        if (!id) return undefined;
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
     // Sắp xếp phòng theo tên để đảm bảo thứ tự nhất quán
    return roomList.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    return [];
  }
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  try {
    if (!id) return undefined;
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

export async function getAssets(): Promise<Asset[]> {
    try {
        const assetsCol = collection(db, 'assets');
        const assetSnapshot = await getDocs(assetsCol);
        const assetList = assetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        return assetList;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tài sản:", error);
        return [];
    }
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
    try {
        if (!id) return undefined;
        const assetDocRef = doc(db, 'assets', id);
        const assetSnap = await getDoc(assetDocRef);
        if (assetSnap.exists()) {
            return { id: assetSnap.id, ...assetSnap.data() } as Asset;
        }
        return undefined;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tài sản:", error);
        return undefined;
    }
}

export async function getAssetsByRoomId(roomId: string): Promise<Asset[]> {
    try {
        if (!roomId) return [];
        const assetsCol = collection(db, 'assets');
        const q = query(assetsCol, where("roomId", "==", roomId));
        const assetSnapshot = await getDocs(q);
        const assetList = assetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        return assetList;
    } catch (error) {
        console.error(`Lỗi khi lấy tài sản cho phòng ${roomId}:`, error);
        return [];
    }
}

export async function getAssetTypes(): Promise<AssetType[]> {
    try {
        const assetTypesCol = collection(db, 'assetTypes');
        const assetTypeSnapshot = await getDocs(assetTypesCol);
        const assetTypeList = assetTypeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetType));
        // Sắp xếp loại tài sản theo tên
        return assetTypeList.sort((a,b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại tài sản:", error);
        return [];
    }
}
