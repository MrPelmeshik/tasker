// Типы для Events API (активности)

export type EventType = number; // 0=UNKNOWN, 1=CREATE, 2=UPDATE, 3=DELETE, 4=NOTE, 5=ACTIVITY

export interface EventCreateRequest {
  entityId: string;
  title: string;
  description?: string;
  eventType: EventType;
  /** Дата события/активности (обязательное, ISO YYYY-MM-DD) */
  eventDate: string;
}

export interface EventCreateResponse {
  id: string;
}

/** Сообщение события в формате JSON (могут быть old/new, title/description, text и т.д.) */
export type EventMessage = Record<string, unknown> | null;

export interface EventResponse {
  id: string;
  title: string;
  message?: EventMessage;
  eventType: string;
  ownerUserId: string;
  ownerUserName?: string;
  createdAt: Date;
  /** Дата события/активности */
  eventDate: Date;
  updatedAt: Date;
  isActive: boolean;
  deactivatedAt?: Date;
}
