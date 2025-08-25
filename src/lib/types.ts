export type AssetStatus = 'In Use' | 'Under Repair' | 'Broken' | 'Disposed';

export interface Asset {
  id: string;
  name: string;
  roomId: string;
  status: AssetStatus;
  dateAdded: string;
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
