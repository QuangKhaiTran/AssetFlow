import { getRoomById, getAssetsByRoomId, getUserById, getAssetTypes } from '@/lib/data';
import { notFound } from 'next/navigation';
import { RoomDetailClient } from '@/components/room-detail-client';

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(id);
  const manager = await getUserById(room.managerId);
  const assetTypes = await getAssetTypes();

  return <RoomDetailClient room={room} initialAssets={assets} manager={manager || null} assetTypes={assetTypes} />;
}
