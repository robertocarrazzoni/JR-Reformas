"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, apiFetch, getErrorMessage } from "@/lib/api";

interface ApiQueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Leitura de uma rota GET da API a partir de um client component.
 *
 * Mantém os dados anteriores durante um `reload` (evita piscar o skeleton a
 * cada mutação) e, se a sessão expirar no meio do caminho, manda o usuário para
 * o login preservando a página atual no parâmetro `next`.
 */
export function useApiQuery<T>(path: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<ApiQueryState<T>>({
    data: null,
    error: null,
    loading: true,
  });
  const [requestKey, setRequestKey] = useState(0);
  const requestId = useRef(0);

  const reload = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    setRequestKey((previous) => previous + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const id = requestId.current + 1;
    requestId.current = id;

    apiFetch<T>(path, { cache: "no-store" })
      .then((data) => {
        if (!active || requestId.current !== id) {
          return;
        }

        setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!active || requestId.current !== id) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        setState({ data: null, error: getErrorMessage(error), loading: false });
      });

    return () => {
      active = false;
    };
  }, [path, pathname, router, requestKey]);

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    reload,
  };
}
