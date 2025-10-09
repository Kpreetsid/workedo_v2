export interface Location {
    location_name: string;
    description: string;
    location_type: string;
    top_level: boolean;
    assigned_to: string;
    visible: boolean;
    id: string;
    account_id: string;
    userId: string;
    top_level_location_id: string;
    teamId?: string | null;
    userName: string;
    top_level_location_image?: string;
    image_path?: string;
    location?: string;
    qr_code?: string | number;
    updatedAt?: string;
    updatedBy?: string;
    parent_id?: string;
    parent_name?: string;
    equipment_id?: string;
    childs: Location[]; // recursive reference
}
