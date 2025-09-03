import { getRoomById, getAssetsByRoomId } from '@/lib/data';
import { notFound } from 'next/navigation';
import { RoomDetailClient } from '@/components/room-detail-client';

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) {
    notFound();
  }

  const assets = await getAssetsByRoomId(id);

  return <RoomDetailClient room={room} initialAssets={assets} />;
}
