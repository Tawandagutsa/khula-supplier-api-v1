import { DealerInventory } from './dealer-inventory.entity';
export declare class Dealer {
    id: string;
    name: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
    fulfillmentPerformance: number;
    inventory: DealerInventory[];
    createdAt: Date;
    updatedAt: Date;
}
