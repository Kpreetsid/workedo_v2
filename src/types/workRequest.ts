export interface WorkRequest {
    account_id: {
        account_name: string;
        id: string;
    };

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

    location_id: {
        location_name: string;
        location_type: string;
        id: string;
    };

    asset_id: {
        asset_name: string;
        asset_type: string | null;
        id: string;
    };

    tags: string[];
    visible: boolean;

    createdBy: {
        firstName: string;
        lastName: string;
        id: string;
    };

    createdAt: string; // ISO timestamp
    updatedAt: string; // ISO timestamp
    id: string;
}
