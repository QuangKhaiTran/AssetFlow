export type AssetStatus = 'Đang sử dụng' | 'Đang sửa chữa' | 'Bị hỏng' | 'Đã thanh lý';

export interface Asset {
  id: string;
  name: string;
  roomId: string;
  status: AssetStatus;
  dateAdded: string;
  assetTypeId: string;
}

export interface Room {
  id: string;
  name: string;
  managerId: string;
}

export interface User {
  id: string;
  name: string;
}

export interface AssetType {
  id: string;
  name: string;
}
