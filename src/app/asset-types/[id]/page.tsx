import { getAssets, getRooms, getUsers, getAssetTypes } from '@/lib/data';
import { notFound } from 'next/navigation';
import { AssetTypeDetailClient } from '@/components/asset-type-detail-client';

export async function generateStaticParams() {
  const assetTypes = await getAssetTypes();
  return assetTypes.map((assetType) => ({
    id: assetType.id,
  }));
}

export default async function AssetTypeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assetTypes = await getAssetTypes();
  const assetType = assetTypes.find(type => type.id === id);
  
  if (!assetType) {
    notFound();
  }

  const allAssets = await getAssets();
  const assets = allAssets.filter(asset => asset.assetTypeId === id);
  const rooms = await getRooms();
  const users = await getUsers();

  return (
    <AssetTypeDetailClient 
      assetType={assetType}
      assets={assets}
      rooms={rooms}
      users={users}
    />
  );
}