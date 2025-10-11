export interface Location {
    _id?: string; // new
    id: string;
    location_name: string;
    description: string;
    location_type: string;
    top_level: boolean;
    account_id: string;
    top_level_location_id: string;
  
    // optional image and hierarchy fields
    top_level_location_image?: string;
    image_path?: string;
    parent_id?: string;
  
    // meta fields
    visible: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  
    // recursive children
    childs: Location[];
  
    // optional (not in API but keeping for type safety)
    assigned_to?: string;
    userId?: string;
    userName?: string;
    teamId?: string | null;
    location?: string;
    qr_code?: string | number;
    equipment_id?: string;
    parent_name?: string;
  }
  