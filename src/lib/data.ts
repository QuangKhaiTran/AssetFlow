import { type Asset, type Room } from "./types";
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

// --- Các hàm tương tác với Firestore ---

export async function getRooms(): Promise<Room[]> {
  try {
    const roomsCol = collection(db, 'rooms');
    const roomSnapshot = await getDocs(roomsCol);

    // Filter out invalid room documents and map to Room type
    const roomList = roomSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          managerName: data.managerName || ''
        } as Room;
      })
      .filter(room => room.name && room.managerName); // Only include rooms with valid data

     // Sắp xếp phòng theo tên để đảm bảo thứ tự nhất quán
    return roomList.sort((a, b) => {
      // Safe comparison with fallbacks
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    return [];
  }
}

export async function getRoomById(id: string): Promise<Room | null> {
  try {
    if (!id) return null;
    const roomDocRef = doc(db, 'rooms', id);
    const roomSnap = await getDoc(roomDocRef);
    if (roomSnap.exists()) {
        const data = roomSnap.data();
        // Only return room if it has valid data
        if (data?.name && data?.managerName) {
          return {
            id: roomSnap.id,
            name: data.name,
            managerName: data.managerName
          } as Room;
        }
    }
    return null;
  } catch(error) {
      console.error("Lỗi khi lấy thông tin phòng:", error);
      return null;
  }
}

export async function getAssets(): Promise<Asset[]> {
    try {
        const assetsCol = collection(db, 'assets');
        const assetSnapshot = await getDocs(assetsCol);
        const assetList = assetSnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    roomId: data.roomId || '',
                    status: data.status || 'Đang sử dụng',
                    dateAdded: data.dateAdded || new Date().toISOString().split('T')[0]
                } as Asset;
            })
            .filter(asset => asset.name && asset.roomId); // Only include assets with valid data
        return assetList;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tài sản:", error);
        return [];
    }
}

export async function getAssetById(id: string): Promise<Asset | null> {
    try {
        if (!id) return null;
        const assetDocRef = doc(db, 'assets', id);
        const assetSnap = await getDoc(assetDocRef);
        if (assetSnap.exists()) {
            const data = assetSnap.data();
            // Only return asset if it has valid data
            if (data?.name && data?.roomId) {
                return {
                    id: assetSnap.id,
                    name: data.name,
                    roomId: data.roomId,
                    status: data.status || 'Đang sử dụng',
                    dateAdded: data.dateAdded || new Date().toISOString().split('T')[0]
                } as Asset;
            }
        }
        return null;
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tài sản:", error);
        return null;
    }
}

export async function getAssetsByRoomId(roomId: string): Promise<Asset[]> {
    try {
        if (!roomId) return [];
        const assetsCol = collection(db, 'assets');
        const q = query(assetsCol, where("roomId", "==", roomId));
        const assetSnapshot = await getDocs(q);
        const assetList = assetSnapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    roomId: data.roomId || '',
                    status: data.status || 'Đang sử dụng',
                    dateAdded: data.dateAdded || new Date().toISOString().split('T')[0]
                } as Asset;
            })
            .filter(asset => asset.name && asset.roomId); // Only include assets with valid data
        return assetList;
    } catch (error) {
        console.error(`Lỗi khi lấy tài sản cho phòng ${roomId}:`, error);
        return [];
    }
}
