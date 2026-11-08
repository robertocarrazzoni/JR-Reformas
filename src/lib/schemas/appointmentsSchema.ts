import { z } from "zod";

export const createAppointmentSchema = z.object({
  slotId: z.string().min(1, "Slot é obrigatório"),
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  address: z.string().trim().min(1, "Endereço é obrigatório"),
  notes: z.string().trim().min(1, "Observações não podem estar vazias").optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
