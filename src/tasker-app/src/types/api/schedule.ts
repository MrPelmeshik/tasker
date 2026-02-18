export interface TaskScheduleCreateRequest {
  taskId: string;
  startAt: string;
  endAt: string;
}

export interface TaskScheduleUpdateRequest {
  startAt: string;
  endAt: string;
}

export interface TaskScheduleResponse {
  id: string;
  taskId: string;
  taskTitle: string;
  areaId: string;
  areaColor?: string | null;
  taskStatus: number;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
}
