export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    farmerName: string;
    farmerRegion: string;
    farmerLatitude: number;
    farmerLongitude: number;
    items: OrderItemDto[];
}
