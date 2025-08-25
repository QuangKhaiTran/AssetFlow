import { type Asset, type Room, type User } from "./types";

const users: User[] = [
  { id: "user-1", name: "Nguyễn Văn A" },
  { id: "user-2", name: "Trần Thị B" },
  { id: "user-3", name: "Lê Văn C" },
];

const rooms: Room[] = [
  { id: "room-1", name: "Phòng họp A", managerId: "user-1" },
  { id: "room-2", name: "Văn phòng B", managerId: "user-2" },
  { id: "room-3", name: "Phòng thí nghiệm C", managerId: "user-3" },
  { id: "room-4", name: "Sảnh chính", managerId: "user-1" },
];

const assets: Asset[] = [
  { id: "asset-1", name: "Bàn họp", roomId: "room-1", status: "Đang sử dụng", dateAdded: "2023-01-15" },
  { id: "asset-2", name: "Ghế xoay", roomId: "room-2", status: "Đang sử dụng", dateAdded: "2023-02-20" },
  { id: "asset-3", name: "Máy in Laser", roomId: "room-2", status: "Đang sửa chữa", dateAdded: "2023-03-10" },
  { id: "asset-4", name: "Máy chiếu", roomId: "room-1", status: "Bị hỏng", dateAdded: "2023-04-05" },
  { id: "asset-5", name: "Bảng trắng", roomId: "room-1", status: "Đang sử dụng", dateAdded: "2023-01-15" },
  { id: "asset-6", name: "Ghế văn phòng", roomId: "room-2", status: "Đã thanh lý", dateAdded: "2022-11-30" },
  { id: "asset-7", name: "Máy tính để bàn", roomId: "room-2", status: "Đang sử dụng", dateAdded: "2023-05-01" },
  { id: "asset-8", name: "Kính hiển vi", roomId: "room-3", status: "Đang sử dụng", dateAdded: "2023-06-12" },
  { id: "asset-9", name: "Tủ đựng hóa chất", roomId: "room-3", status: "Đang sử dụng", dateAdded: "2023-06-12" },
];

export async function getAssets(): Promise<Asset[]> {
  return Promise.resolve(assets);
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  return Promise.resolve(assets.find(asset => asset.id === id));
}

export async function getAssetsByRoomId(roomId: string): Promise<Asset[]> {
  return Promise.resolve(assets.filter(asset => asset.roomId === roomId));
}

export async function getRooms(): Promise<Room[]> {
  return Promise.resolve(rooms);
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  return Promise.resolve(rooms.find(room => room.id === id));
}

export async function getUsers(): Promise<User[]> {
  return Promise.resolve(users);
}

export async function getUserById(id: string): Promise<User | undefined> {
    return Promise.resolve(users.find(user => user.id === id));
}
