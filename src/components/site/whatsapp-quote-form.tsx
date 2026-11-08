"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { services, whatsappLink } from "@/lib/config";

export function WhatsAppQuoteForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(services[0]?.title ?? "Outro");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: { name?: string; message?: string } = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Informe seu nome.";
    }

    if (message.trim().length < 5) {
      nextErrors.message = "Descreva brevemente o que você precisa.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const text = [
      `Olá! Meu nome é ${name.trim()}.`,
      phone.trim() ? `Meu telefone é ${phone.trim()}.` : null,
      `Serviço de interesse: ${service}.`,
      "",
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    toast({
      title: "WhatsApp aberto",
      description: "Sua mensagem foi preparada. É só enviar na conversa.",
      variant: "success",
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">
            Peça seu orçamento
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Preencha os dados abaixo e nós abrimos o WhatsApp com a mensagem
            pronta para enviar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <Label htmlFor="quote-name">Nome</Label>
          <Input
            id="quote-name"
            className="mt-1.5"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Como podemos chamar você?"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="quote-phone">Telefone (opcional)</Label>
            <Input
              id="quote-phone"
              className="mt-1.5"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>
          <div>
            <Label htmlFor="quote-service">Serviço</Label>
            <div className="mt-1.5">
              <Select
                id="quote-service"
                value={service}
                onChange={(event) => setService(event.target.value)}
              >
                {services.map((item) => (
                  <option key={item.slug} value={item.title}>
                    {item.title}
                  </option>
                ))}
                <option value="Outro">Outro</option>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="quote-message">Como podemos ajudar?</Label>
          <Textarea
            id="quote-message"
            className="mt-1.5"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Conte um pouco sobre a obra, o ambiente e o que você precisa."
            aria-invalid={Boolean(errors.message)}
          />
          <FieldError>{errors.message}</FieldError>
        </div>

        <Button type="submit" className="w-full">
          <Send className="h-4 w-4" aria-hidden="true" />
          Enviar pelo WhatsApp
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          Nenhum dado é armazenado neste site. A conversa acontece diretamente
          no WhatsApp.
        </p>
      </form>
    </div>
  );
}
