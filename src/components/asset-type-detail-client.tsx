"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle, Wrench, XCircle, Trash2, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { type AssetStatus, type Room, type Asset, type AssetType, type User } from '@/lib/types';

const statusConfig: Record<AssetStatus, { icon: React.ElementType, color: string }> = {
    'Đang sử dụng': { icon: CheckCircle, color: 'text-green-600' },
    'Đang sửa chữa': { icon: Wrench, color: 'text-amber-600' },
    'Bị hỏng': { icon: XCircle, color: 'text-red-600' },
    'Đã thanh lý': { icon: Trash2, color: 'text-gray-500' },
};

// Helper functions moved outside component to avoid dependency issues
const getRoomName = (roomId: string, rooms: Room[]) => {
  return rooms.find((room) => room.id === roomId)?.name || "N/A";
};

const getManagerName = (roomId: string, rooms: Room[], users: User[]) => {
  const room = rooms.find((room) => room.id === roomId);
  if (!room) return "N/A";
  return users.find((user) => user.id === room.managerId)?.name || "N/A";
};

const getManagerId = (roomId: string, rooms: Room[]) => {
  const room = rooms.find((room) => room.id === roomId);
  return room?.managerId || '';
};

interface AssetTypeDetailClientProps {
  assetType: AssetType;
  assets: Asset[];
  rooms: Room[];
  users: User[];
}

export function AssetTypeDetailClient({ assetType, assets, rooms, users }: AssetTypeDetailClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Get unique managers from assets
  const uniqueManagers = useMemo(() => {
    const managerIds = new Set<string>();
    const managerList: Array<{id: string, name: string}> = [];
    
    assets.forEach(asset => {
      const managerId = getManagerId(asset.roomId, rooms);
      if (managerId && !managerIds.has(managerId)) {
        managerIds.add(managerId);
        const managerName = getManagerName(asset.roomId, rooms, users);
        if (managerName !== "N/A") {
          managerList.push({ id: managerId, name: managerName });
        }
      }
    });
    
    return managerList.sort((a, b) => a.name.localeCompare(b.name));
  }, [assets, users, rooms]);

  // Get unique rooms from assets
  const uniqueRooms = useMemo(() => {
    const roomIds = new Set<string>();
    const roomList: Array<{id: string, name: string}> = [];
    
    assets.forEach(asset => {
      if (!roomIds.has(asset.roomId)) {
        roomIds.add(asset.roomId);
        const roomName = getRoomName(asset.roomId, rooms);
        if (roomName !== "N/A") {
          roomList.push({ id: asset.roomId, name: roomName });
        }
      }
    });
    
    return roomList.sort((a, b) => a.name.localeCompare(b.name));
  }, [assets, rooms]);

  // Filter assets based on search criteria
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchTerm === '' || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesManager = selectedManager === '' || 
        getManagerId(asset.roomId, rooms) === selectedManager;
      
      const matchesRoom = selectedRoom === '' || 
        asset.roomId === selectedRoom;
      
      const matchesStatus = selectedStatus === '' || 
        asset.status === selectedStatus;
      
      return matchesSearch && matchesManager && matchesRoom && matchesStatus;
    });
  }, [assets, searchTerm, selectedManager, selectedRoom, selectedStatus, rooms]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedManager('');
    setSelectedRoom('');
    setSelectedStatus('');
  };

  const hasActiveFilters = searchTerm || selectedManager || selectedRoom || selectedStatus;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button asChild variant="ghost" className="mb-1 -ml-3 h-8">
          <Link href="/asset-management">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Quay lại Quản lý loại tài sản
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{assetType.name}</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>{filteredAssets.length}/{assets.length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Collapsible Filter Section */}
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <div className="mb-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-8 justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Bộ lọc tài sản</span>
                    {hasActiveFilters && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        {filteredAssets.length}/{assets.length}
                      </span>
                    )}
                  </div>
                  {isFilterOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tìm thiết bị</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nhập tên thiết bị..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Người quản lý</label>
                  <Select value={selectedManager || undefined} onValueChange={(value) => setSelectedManager(value || '')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phòng</label>
                  <Select value={selectedRoom || undefined} onValueChange={(value) => setSelectedRoom(value || '')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
                  <Select value={selectedStatus || undefined} onValueChange={(value) => setSelectedStatus(value || '')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                      <SelectItem value="Đang sửa chữa">Đang sửa chữa</SelectItem>
                      <SelectItem value="Bị hỏng">Bị hỏng</SelectItem>
                      <SelectItem value="Đã thanh lý">Đã thanh lý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {hasActiveFilters && (
                <div className="flex justify-end pt-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài sản</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Người quản lý</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày thêm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    {hasActiveFilters ? 'Không tìm thấy thiết bị phù hợp với bộ lọc.' : 'Chưa có tài sản nào thuộc loại này.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => {
                  const { icon: Icon, color } = statusConfig[asset.status];
                  return (
                    <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link href={`/assets/${asset.id}`}>
                          {asset.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/assets/${asset.id}`}>
                          {getRoomName(asset.roomId, rooms)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/assets/${asset.id}`}>
                          {getManagerName(asset.roomId, rooms, users)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/assets/${asset.id}`}>
                          <div className="flex items-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                            <span className={`text-xs font-medium ${color}`}>{asset.status}</span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        <Link href={`/assets/${asset.id}`}>
                          <div className='flex items-center gap-1.5'>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(asset.dateAdded).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}