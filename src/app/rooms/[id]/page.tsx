import { getRoomById, getAssetsByRoomId, getUserById, getAssetTypes, getUsers } from '@/lib/data';
import { notFound } from 'next/navigation';
import { RoomDetailClient } from '@/components/room-detail-client';

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(id);
  const manager = await getUserById(room.managerId);
  const assetTypes = await getAssetTypes();
  const allUsers = await getUsers();

  return <RoomDetailClient room={room} initialAssets={assets} manager={manager || null} assetTypes={assetTypes} allUsers={allUsers} />;
}
