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
    cost: number;
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
}
