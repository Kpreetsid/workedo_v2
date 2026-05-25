export interface WorkOrderActivityRecord {
  _id?: string;
  id?: string;
  work_order_id: string;
  order_no?: string;
  title?: string;
  action_type: string;
  note?: string;
  metadata?: Record<string, any>;
  actor_id?: string;
  actor_name?: string;
  createdAt: string;
  updatedAt?: string;
}
