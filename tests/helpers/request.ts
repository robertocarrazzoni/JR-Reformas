import { NextRequest } from "next/server";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
}

function buildHeaders(token?: string) {
  const headers = new Headers();

  if (token) {
    headers.set("cookie", `token=${token}`);
  }

  return headers;
}

/** Request com corpo JSON, no formato que os route handlers recebem. */
export function jsonRequest(
  path: string,
  body?: unknown,
  options: RequestOptions & { token?: string } = {},
) {
  const headers = buildHeaders(options.token);

  if (body !== undefined) {
    headers.set("content-type", "application/json");
  }

  return new NextRequest(`http://localhost${path}`, {
    method: options.method ?? "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Request sem corpo, para GET/DELETE e para o proxy. */
export function plainRequest(
  path: string,
  options: RequestOptions & { token?: string } = {},
) {
  return new NextRequest(`http://localhost${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(options.token),
  });
}
