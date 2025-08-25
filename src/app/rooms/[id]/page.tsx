import { getRoomById, getAssetsByRoomId, getUserById, getAssetTypes } from '@/lib/data';
import { notFound } from 'next/navigation';
import { RoomDetailClient } from '@/components/room-detail-client';

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const room = await getRoomById(params.id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(params.id);
  const manager = await getUserById(room.managerId);
  const assetTypes = await getAssetTypes();

  return <RoomDetailClient room={room} initialAssets={assets} manager={manager || null} assetTypes={assetTypes} />;
}
