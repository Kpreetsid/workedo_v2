export interface WorkOrder {
    _id: string;
    account_id: string;
    order_no: string;
    title: string;
    description: string;
    estimated_time: number;
    priority: string;
    status: string;
    type: string;
    wo_asset_id: string;
    wo_location_id: string;
    start_date: string;
    end_date: string;
    sop_form_id: string | null;
    parts: any[];
    tasks: WorkOrderTask[];
    task_submitted: boolean;
    files: any[];
    visible: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
    assignedUsers: AssignedUser[];
    asset: WorkOrderAsset;
    location: WorkOrderLocation;
    id: string;
    comments: WorkOrderComment[];
}

export interface WorkOrderTask {
    title: string;
    type: string;
    fieldValue: string;
    options: string[];
}

export interface AssignedUser {
    _id: string;
    woId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    id: string;
    user: {
        firstName: string;
        lastName: string;
        username: string;
        user_profile_img: string;
        id: string;
    };
}

export interface WorkOrderAsset {
    _id: string;
    asset_name: string;
    asset_type: string;
    id: string;
}

export interface WorkOrderLocation {
    _id: string;
    location_name: string;
    location_type: string;
    id: string;
}

export interface WorkOrderComment {
    _id: string;
    work_order_id: string;
    account_id: string;
    comments: string;
    parentCommentId: string | null;
    visible: boolean;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    id: string;
    replies: WorkOrderCommentReply[];
}

export interface WorkOrderCommentReply {
    _id: string;
    work_order_id: string;
    account_id: string;
    comments: string;
    parentCommentId: string;
    visible: boolean;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    id: string;
    replies: WorkOrderCommentReply[];
}
