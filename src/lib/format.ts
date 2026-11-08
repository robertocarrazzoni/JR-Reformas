const TIME_ZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateLongFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  timeZone: TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const monthShortFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

export function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

/** Relógio centralizado para evitar chamadas impuras diretas durante o render. */
export function nowMs() {
  return Date.now();
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(toDate(value));
}

export function formatDateLong(value: string | Date) {
  return dateLongFormatter.format(toDate(value));
}

export function formatWeekday(value: string | Date) {
  return weekdayFormatter.format(toDate(value));
}

export function formatDay(value: string | Date) {
  return dayFormatter.format(toDate(value));
}

export function formatMonthShort(value: string | Date) {
  return monthShortFormatter
    .format(toDate(value))
    .replace(".", "")
    .toUpperCase();
}

export function formatTime(value: string | Date) {
  return timeFormatter.format(toDate(value));
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(toDate(value));
}

export function formatDateRange(startsAt: string | Date, endsAt: string | Date) {
  return `${formatTime(startsAt)} — ${formatTime(endsAt)}`;
}

/** YYYY-MM-DD no fuso da empresa, para agrupar cards por dia. */
export function toDateKey(value: string | Date) {
  const date = toDate(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIME_ZONE,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Valor para <input type="date"> no fuso da empresa. */
export function toDateInputValue(value: string | Date) {
  return toDateKey(value);
}

/** Valor para <input type="time"> no fuso da empresa. */
export function toTimeInputValue(value: string | Date) {
  return formatTime(value);
}

export function toISOStringFromInputs(date: string, time: string) {
  // Brasília é UTC−3 fixo desde o fim do horário de verão (2019). Montar com
  // offset explícito evita que o fuso do navegador do operador altere o
  // horário gravado.
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

export function formatPhone(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function isPast(value: string | Date) {
  return toDate(value).getTime() < Date.now();
}

export function isSameDateKey(a: string | Date, b: string | Date) {
  return toDateKey(a) === toDateKey(b);
}
