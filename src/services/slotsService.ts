
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { createImput, UpdateSlotInput } from "@/lib/schemas/slotsSchema";

/**
 * Fonte única da regra de "horário disponível": futuro, não bloqueado e sem
 * agendamento ativo. Usada pela listagem e pela contagem do painel admin.
 */
export function availableSlotsWhere(): Prisma.AvailabilitySlotWhereInput {
    return {
        isBlocked: false,
        appointments: {
            none: {
                status: "SCHEDULED",
            },
        },
        startsAt: {
            gte: new Date(),
        },
    };
}





export async function createSlots(data: createImput) {
    try {
        return await prisma.availabilitySlot.create({
        data: data
    })
    } catch (error) {
        console.error("Falha ao criar horário:", error);
        throw new Error("Não foi possível criar o horário");
    }
}

export async function update(data: UpdateSlotInput, id: string) {
    try {
        const query = await prisma.availabilitySlot.update({
            where: {
                id: id
            },
            data: data,
            select: {
                startsAt: true,
                endsAt: true,
            }
        });
        return query;
    } catch (error) {
        console.error("Falha ao atualizar horário:", error);
        throw new Error("Não foi possível atualizar o horário")
    }
}

export async function deleteSlotService(id: string) {
    const slot = await prisma.availabilitySlot.findUnique({
        where: { id },
        include: { appointments: true },
    });

    if (!slot) {
        throw new Error("Slot não encontrado");
    }

    if (slot.appointments.length > 0) {
        throw new Error("Não é possível deletar um slot com agendamento vinculado");
    }

    await prisma.availabilitySlot.delete({
        where: { id },
    });

    return { message: "Slot deletado com sucesso" };
}

export async function getAvailableSlotsService() {
    try {
        const slots = await prisma.availabilitySlot.findMany({
            where: availableSlotsWhere(),
            orderBy: {
                startsAt: "asc",
            },
        });
        return slots;
    } catch (error) {
        console.error("Falha ao buscar horários disponíveis:", error);
        throw new Error("Não foi possível buscar os horários");
    }
}

export async function countAvailableSlotsService() {
    try {
        return await prisma.availabilitySlot.count({
            where: availableSlotsWhere(),
        });
    } catch (error) {
        console.error("Falha ao contar horários disponíveis:", error);
        throw new Error("Não foi possível contar os horários disponíveis");
    }
}

export async function getAdminSlotsService() {
    try {
        return await prisma.availabilitySlot.findMany({
            include: {
                appointments: {
                    include: {
                        customer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                role: true,
                            },
                        },
                        slot: true,
                    },
                },
            },
            orderBy: {
                startsAt: "asc",
            },
        });
    } catch (error) {
        console.error("Falha ao buscar horários:", error);
        throw new Error("Não foi possível buscar os horários");
    }
}
