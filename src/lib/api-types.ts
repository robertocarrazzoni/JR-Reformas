export type RoleValue = "CUSTOMER" | "ADMIN";

export type AppointmentStatusValue = "SCHEDULED" | "CANCELLED" | "DONE";

export interface SessionUserDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt?: string;
}

export interface SlotDTO {
  id: string;
  startsAt: string;
  endsAt: string;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentCustomerDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role?: string;
}

export interface AppointmentDTO {
  id: string;
  customerId: string;
  slotId: string;
  status: AppointmentStatusValue;
  description: string;
  address: string;
  notes: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer: AppointmentCustomerDTO;
  slot: SlotDTO;
}

export interface AdminSlotDTO extends SlotDTO {
  appointments: AppointmentDTO[];
}

export interface AuthResponse {
  message: string;
  user: SessionUserDTO;
}

export interface MessageResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}
