import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  message: string;
  onRetry: () => void;
}

/** Estado de erro padrão para os client components que leem dados da API. */
export function QueryError({ message, onRetry }: QueryErrorProps) {
  return (
    <Alert variant="error" title="Não foi possível carregar os dados">
      <p>{message}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onRetry}
      >
        Tentar novamente
      </Button>
    </Alert>
  );
}
