import { after } from "next/server";

/**
 * Agenda uma tarefa para depois da resposta. Em serverless (Vercel) a função
 * é congelada assim que a resposta sai, então uma promise solta pode nunca
 * executar — `after()` mantém a invocação viva até a tarefa terminar.
 */
export function runAfterResponse(task: () => Promise<void>): void {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error("Falha em tarefa pós-resposta:", error);
    }
  });
}
