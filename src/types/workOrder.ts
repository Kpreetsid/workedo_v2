import { ProcedureRequiredPart, ProcedureScoreSummary, ProcedureStep, ProcedureTriggeredAction } from "./procedure";

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
    parts: WorkOrderPartLine[];
    tasks: WorkOrderTask[];
    task_submitted: boolean;
    files: WorkOrderAttachment[];
    visible: boolean;
    createdBy: any;
    created_by: string;
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
    assignedUsers: AssignedUser[];
    asset: WorkOrderAsset;
    location: WorkOrderLocation;
    id: string;
    comments: WorkOrderComment[];
    nature_of_work?: string;
    sop_form_data?: { [key: string]: string };
    block_reason?: string | null;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    actual_time?: number | null;
    parentId?: string | null;
    procedure_ids?: string[];
    procedures?: WorkOrderProcedure[];
    procedure_entries?: WorkOrderProcedure[];
    labor_entries?: WorkOrderLaborEntry[];
    childOrders?: WorkOrderChild[];
    parentOrder?: WorkOrderParentReference | null;
    hierarchy?: WorkOrderHierarchy;
    completed_at?: string | null;
    completed_by?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    inventoryWarnings?: Array<{
        part_id?: string;
        part_name?: string;
        message?: string;
        quantity?: number;
        min_quantity?: number;
    }>;
}

export interface WorkOrderAttachment {
    originalName?: string;
    type?: string;
    destination?: string;
    fileName?: string;
    folderName?: string;
    fileUrl?: string;
    filePath?: string;
    size?: number;
    image_path?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkOrderPartLine {
    id?: string;
    _id?: string;
    part_id?: string;
    part_name: string;
    part_number?: string;
    barcode?: string;
    part_type?: string;
    unit?: string;
    cost?: number;
    currency?: string;
    quantity?: number;
    min_quantity?: number;
    availabilityStatus?: string;
    estimatedQuantity?: number;
    plannedQuantity?: number;
    actualQuantity?: number | null;
    procedureLinked?: boolean;
    procedureNames?: string[];
    manualQuantity?: number;
    procedureQuantity?: number;
}

export interface WorkOrderTask {
    title: string;
    type?: string;
    fieldValue?: string | number;
    options: Array<{ key: string; value: string | number | boolean }>;
    priority?: string;
    assigned_user_id?: string;
    status?: string;
    completed?: boolean;
    completedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    completedAt?: string | null;
    updatedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    updatedAt?: string | null;
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
    top_level?: boolean;
    parent_id?: string | null;
}

export interface WorkOrderLocation {
    _id: string;
    location_name: string;
    location_type: string;
    id: string;
}

export interface WorkOrderProcedure {
    procedure_id?: string;
    id: string;
    name: string;
    category?: string;
    tags?: string[];
    description?: string;
    steps?: ProcedureStep[];
    required_parts?: ProcedureRequiredPart[];
    responses?: Record<string, any>;
    submitted?: boolean;
    submitted_by?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    submitted_at?: string | null;
    score_summary?: ProcedureScoreSummary | null;
    triggered_actions?: ProcedureTriggeredAction[];
}

export interface WorkOrderLaborEntry {
    user_id?: string;
    vendor_name?: string;
    work_date?: string | null;
    hours: number;
    notes?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface WorkOrderChild {
    _id: string;
    id: string;
    order_no: string;
    title: string;
    status: string;
    priority?: string;
    start_date?: string;
    end_date?: string;
    estimated_time?: number;
    actual_time?: number;
    assignedUsers?: AssignedUser[];
    parts?: any[];
    labor_entries?: WorkOrderLaborEntry[];
    procedure_ids?: string[];
    procedure_entries?: WorkOrderProcedure[];
}

export interface WorkOrderParentReference {
    _id: string;
    id: string;
    order_no: string;
    title: string;
    status: string;
}

export interface WorkOrderHierarchy {
    isParentWorkOrder: boolean;
    isChildWorkOrder: boolean;
    executionOwnedByChildren: boolean;
    childStatusSummary?: {
        total: number;
        completed: number;
        open: number;
        in_progress: number;
        blocked: number;
        on_hold: number;
    };
    childLaborRollup?: {
        totalHours: number;
        internalEntries: number;
        externalEntries: number;
    };
    childPartsRollup?: {
        totalLines: number;
        plannedQuantity: number;
        actualQuantity: number;
    };
    childProgressLabel?: string;
    parentReference?: WorkOrderParentReference | null;
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
        user_profile_img: string;
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
        user_profile_img: string;
    };
    createdAt: string;
    updatedAt: string;
    id: string;
    replies: WorkOrderCommentReply[];
}

export interface WorkOrderHistorySnapshot {
    _id?: string;
    id?: string;
    original_id?: string;
    order_no?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    type?: string;
    nature_of_work?: string;
    estimated_time?: number | null;
    actual_time?: number | null;
    end_date?: string | null;
    actual_start_date?: string | null;
    actual_end_date?: string | null;
    parentId?: string | null;
    work_request_id?: string | null;
    parts?: any[];
    tasks?: WorkOrderTask[];
    procedure_entries?: WorkOrderProcedure[];
    labor_entries?: WorkOrderLaborEntry[];
    files?: WorkOrderAttachment[];
    updatedBy?: {
        id?: string;
        firstName?: string;
        lastName?: string;
    } | string | null;
    history_created_by?: {
        id?: string;
        firstName?: string;
        lastName?: string;
    } | string | null;
    history_created_at?: string;
    createdAt?: string;
    updatedAt?: string;
}
