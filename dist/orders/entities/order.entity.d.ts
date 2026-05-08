import { OrderAllocation } from './order-allocation.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    Pending = "PENDING",
    Backordered = "BACKORDERED",
    Confirmed = "CONFIRMED",
    InTransit = "IN_TRANSIT",
    Delivered = "DELIVERED",
    Cancelled = "CANCELLED"
}
export declare class Order {
    id: string;
    farmerName: string;
    farmerRegion: string;
    farmerLatitude: number;
    farmerLongitude: number;
    status: OrderStatus;
    totalCost: number;
    assignedDealerId: string | null;
    assignedDealerName: string | null;
    distanceKm: number | null;
    estimatedDeliveryWindow: string | null;
    items: OrderItem[];
    allocations: OrderAllocation[];
    backorder: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}
