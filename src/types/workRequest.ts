export interface WorkRequest {
    account_id: {
        account_name: string;
        id: string;
    } | null;

    request_no?: string;

    title: string;
    description: string;
    problemType: string;
    priority: string;

    files: {
        originalName: string;
        type: string;
        destination: string;
        fileName: string;
        filePath: string;
        size: number;
        fileURL: string;
        folderName: string;
    }[];

    status: string;
    activeStatus?: string | null;
    review_due_at?: string | null;
    order_due_at?: string | null;
    remarks?: string | null;
    approvedAt?: string | null;
    rejectedAt?: string | null;
    convertedAt?: string | null;
    converted_order_no?: string | null;
    converted_work_order_id?: {
        id: string;
        order_no: string;
        title: string;
        status: string;
        priority?: string;
        start_date?: string;
        end_date?: string;
    } | null;

    location_id: {
        location_name: string;
        location_type: string;
        id: string;
    } | null;

    asset_id: {
        asset_name: string;
        asset_type: string | null;
        id: string;
    } | null;

    tags: string[];
    visible: boolean;

    createdBy: {
        firstName: string;
        lastName: string;
        id: string;
    };
    approvedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    };
    rejectedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    };
    convertedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    };
    updatedBy?: {
        firstName: string;
        lastName: string;
        id: string;
    } | null;

    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    id: string;
}
