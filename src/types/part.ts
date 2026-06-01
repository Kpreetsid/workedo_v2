export interface Part {
    _id: string;
    id: string;
    account_id: string;
    part_name: string;
    part_number: string;
    part_type: string;
    unit: string;
    description: string;
    quantity: number;
    min_quantity: number;
    estimatedQuantity?: number;
    cost: number;
    reorder_point?: number;
    preferred_vendor?: string;
    lead_time_days?: number;
    location_id: string;
    visible: boolean;
    createdBy: string;
    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp

    location?: {
        _id: string;
        id: string;
        location_name: string;
        location_type: string;
    };

    user?: {
        _id: string;
        id: string;
        firstName: string;
        lastName: string;
        user_role: string;
    };
    stock_locations?: Array<{
        id: string;
        location_id: string;
        location_name: string;
        location_type?: string;
        quantity: number;
        min_quantity: number;
        reorder_point?: number;
        available_for_transfer?: number;
    }>;
    alternative_locations?: Array<{
        id: string;
        location_id: string;
        location_name: string;
        location_type?: string;
        quantity: number;
        min_quantity: number;
        reorder_point?: number;
        available_for_transfer?: number;
    }>;
    network_location_count?: number;
    network_on_hand?: number;
    preferred_stock_source?: {
        id: string;
        location_id: string;
        location_name: string;
        location_type?: string;
        quantity: number;
        min_quantity: number;
        reorder_point?: number;
        available_for_transfer?: number;
    } | null;
    recent_history?: PartHistoryRecord[];
}

export interface PartHistoryRecord {
    _id?: string;
    id?: string;
    account_id?: string;
    part_id: string;
    part_name?: string;
    part_number?: string;
    location_id?: string;
    location_name?: string;
    action_type: string;
    quantity?: number;
    stock_before?: number;
    stock_after?: number;
    note?: string;
    metadata?: Record<string, any>;
    actor_id?: string;
    actor_name?: string;
    createdAt: string;
    updatedAt?: string;
}
