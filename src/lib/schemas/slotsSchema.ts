import { z } from "zod";

export const createSchema = z.object({
    startsAt: z.coerce.date().min(new Date(), "A data de início deve ser no futuro"),
    endsAt: z.coerce.date()
}).refine((data) => data.endsAt > data.startsAt, {
    message: "O horário de término deve ser posterior ao de início",
    path: ["endsAt"] 
})


export type createImput = z.infer<typeof createSchema>;

export const updateSlotSchema = z.object({
  startsAt: z.coerce.date().min(new Date(), "A data de início deve ser no futuro").optional(),
  endsAt: z.coerce.date().optional(),
  isBlocked: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startsAt && data.endsAt) {
      return data.endsAt > data.startsAt;
    }
    return true;
  },
  {
    message: "O horário de término deve ser posterior ao de início",
    path: ["endsAt"],
  }
);

export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;