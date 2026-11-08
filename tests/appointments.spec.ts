import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import {
  AppointmentError,
  cancelAppointmentService,
  countAppointmentsService,
  createAppointmentService,
  getAppointmentsService,
} from "@/services/appointmentService";
import { prisma } from "@/lib/prisma";
import { disconnectDatabase, resetDatabase } from "./helpers/db";
import {
  createAppointment,
  createSlot,
  createUser,
  futureDate,
  pastDate,
} from "./helpers/factories";

const appointmentData = {
  slotId: "",
  description: "Reforma de cozinha",
  address: "Rua das Flores, 1",
};

describe("Appointment Service", () => {
  beforeEach(resetDatabase);

  afterAll(disconnectDatabase);

  it("creates an appointment for an available future slot", async () => {
    const customer = await createUser();
    const slot = await createSlot();
    const actor = { userId: customer.id, role: "CUSTOMER" };

    const appointment = await createAppointmentService(
      { ...appointmentData, slotId: slot.id },
      actor,
    );

    expect(appointment).toMatchObject({
      customerId: customer.id,
      slotId: slot.id,
      status: "SCHEDULED",
      description: appointmentData.description,
      address: appointmentData.address,
    });
    expect(appointment.customer).toMatchObject({ id: customer.id });
    expect(appointment.slot).toMatchObject({ id: slot.id });

    await expect(prisma.appointment.count()).resolves.toBe(1);
  });

  it("rejects a blocked slot", async () => {
    const customer = await createUser();
    const slot = await createSlot({ isBlocked: true });
    const actor = { userId: customer.id, role: "CUSTOMER" };

    await expect(
      createAppointmentService({ ...appointmentData, slotId: slot.id }, actor),
    ).rejects.toMatchObject({ message: "Slot indisponível", status: 409 });
  });

  it("rejects a slot in the past", async () => {
    const customer = await createUser();
    const slot = await createSlot({ startsAt: pastDate(48), endsAt: pastDate(47) });
    const actor = { userId: customer.id, role: "CUSTOMER" };

    await expect(
      createAppointmentService({ ...appointmentData, slotId: slot.id }, actor),
    ).rejects.toMatchObject({ message: "Slot indisponível", status: 409 });
  });

  it("rejects a slot that already has a scheduled appointment", async () => {
    const customer = await createUser();
    const otherCustomer = await createUser();
    const slot = await createSlot();
    await createAppointment({ customerId: otherCustomer.id, slotId: slot.id });
    const actor = { userId: customer.id, role: "CUSTOMER" };

    await expect(
      createAppointmentService({ ...appointmentData, slotId: slot.id }, actor),
    ).rejects.toMatchObject({ message: "Slot indisponível", status: 409 });
  });

  it("rejects a non-existent slot", async () => {
    const customer = await createUser();
    const actor = { userId: customer.id, role: "CUSTOMER" };

    await expect(
      createAppointmentService({ ...appointmentData, slotId: "missing-slot" }, actor),
    ).rejects.toMatchObject({ message: "Slot não encontrado", status: 404 });
  });

  it("does not allow an admin to create an appointment", async () => {
    const admin = await createUser({ role: "ADMIN" });
    const slot = await createSlot();
    const actor = { userId: admin.id, role: "ADMIN" };

    await expect(
      createAppointmentService({ ...appointmentData, slotId: slot.id }, actor),
    ).rejects.toMatchObject({
      message: "Apenas clientes podem criar agendamentos",
      status: 403,
    });
  });

  it("returns only the customer appointments", async () => {
    const customer = await createUser();
    const otherCustomer = await createUser();
    const customerSlot = await createSlot();
    const otherSlot = await createSlot({ startsAt: futureDate(72) });
    const customerAppointment = await createAppointment({
      customerId: customer.id,
      slotId: customerSlot.id,
    });
    await createAppointment({
      customerId: otherCustomer.id,
      slotId: otherSlot.id,
    });

    const result = await getAppointmentsService({
      userId: customer.id,
      role: "CUSTOMER",
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(customerAppointment.id);
  });

  it("derives DONE for a confirmed visit whose slot already passed", async () => {
    const customer = await createUser();
    const slot = await createSlot({
      startsAt: pastDate(48),
      endsAt: pastDate(47),
    });
    const appointment = await createAppointment({
      customerId: customer.id,
      slotId: slot.id,
    });

    const result = await getAppointmentsService({
      userId: customer.id,
      role: "CUSTOMER",
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: appointment.id, status: "DONE" });

    // A derivação não reescreve o banco.
    const stored = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(stored?.status).toBe("SCHEDULED");
  });

  it("paginates and counts appointments for the admin panel", async () => {
    const customer = await createUser();
    const slots = [
      await createSlot(),
      await createSlot({ startsAt: futureDate(72) }),
      await createSlot({ startsAt: futureDate(96) }),
    ];

    for (const slot of slots) {
      await createAppointment({ customerId: customer.id, slotId: slot.id });
    }

    const actor = { userId: "admin-1", role: "ADMIN" };

    await expect(countAppointmentsService(actor)).resolves.toBe(3);

    const page = await getAppointmentsService(actor, { take: 2, skip: 1 });

    expect(page).toHaveLength(2);
  });

  it("allows an admin to cancel an appointment regardless of the notice period", async () => {
    const customer = await createUser();
    const admin = await createUser({ role: "ADMIN" });
    const slot = await createSlot({
      startsAt: futureDate(1),
      endsAt: futureDate(2),
    });
    const appointment = await createAppointment({
      customerId: customer.id,
      slotId: slot.id,
    });

    const result = await cancelAppointmentService(appointment.id, {
      userId: admin.id,
      role: "ADMIN",
    });

    expect(result).toMatchObject({ id: appointment.id, status: "CANCELLED" });
    expect(result.cancelledAt).toBeInstanceOf(Date);

    const stored = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(stored).toMatchObject({ status: "CANCELLED" });
  });

  it("rejects a late cancellation by the appointment customer", async () => {
    const customer = await createUser();
    const slot = await createSlot({
      startsAt: futureDate(1),
      endsAt: futureDate(2),
    });
    const appointment = await createAppointment({
      customerId: customer.id,
      slotId: slot.id,
    });
    const actor = { userId: customer.id, role: "CUSTOMER" };

    await expect(cancelAppointmentService(appointment.id, actor)).rejects.toBeInstanceOf(
      AppointmentError,
    );
    await expect(cancelAppointmentService(appointment.id, actor)).rejects.toMatchObject({
      status: 422,
    });

    const stored = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(stored).toMatchObject({ status: "SCHEDULED" });
  });

  it("rejects cancelling an appointment that is already cancelled", async () => {
    const customer = await createUser();
    const slot = await createSlot();
    const appointment = await createAppointment({
      customerId: customer.id,
      slotId: slot.id,
      status: "CANCELLED",
    });

    await expect(
      cancelAppointmentService(appointment.id, {
        userId: customer.id,
        role: "CUSTOMER",
      }),
    ).rejects.toMatchObject({
      message: "Agendamento já está cancelado",
      status: 409,
    });
  });

  it("refuses to cancel a visit whose slot already passed", async () => {
    const customer = await createUser();
    const admin = await createUser({ role: "ADMIN" });
    const slot = await createSlot({
      startsAt: pastDate(48),
      endsAt: pastDate(47),
    });
    const appointment = await createAppointment({
      customerId: customer.id,
      slotId: slot.id,
    });

    await expect(
      cancelAppointmentService(appointment.id, {
        userId: admin.id,
        role: "ADMIN",
      }),
    ).rejects.toMatchObject({ message: "Visita já realizada", status: 409 });
  });

  it("does not allow a customer to cancel another customer appointment", async () => {
    const owner = await createUser();
    const intruder = await createUser();
    const slot = await createSlot();
    const appointment = await createAppointment({
      customerId: owner.id,
      slotId: slot.id,
    });

    await expect(
      cancelAppointmentService(appointment.id, {
        userId: intruder.id,
        role: "CUSTOMER",
      }),
    ).rejects.toMatchObject({ message: "Agendamento não encontrado", status: 404 });
  });

  it("rejects cancelling a non-existent appointment", async () => {
    const admin = await createUser({ role: "ADMIN" });

    await expect(
      cancelAppointmentService("missing-appointment", {
        userId: admin.id,
        role: "ADMIN",
      }),
    ).rejects.toMatchObject({ message: "Agendamento não encontrado", status: 404 });
  });
});
