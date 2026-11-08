import Link from "next/link";
import { AtSign, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { services, siteConfig, whatsappLink } from "@/lib/config";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-950 text-cream-100">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm space-y-5">
          <Logo className="text-cream-50" />
          <p className="text-sm leading-relaxed text-cream-200/70">
            {siteConfig.description}
          </p>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gold-300 transition-colors hover:text-gold-200"
          >
            <AtSign className="h-4 w-4" aria-hidden="true" />
            {siteConfig.instagramHandle}
          </a>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
            Navegação
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link className="text-cream-200/70 transition-colors hover:text-cream-50" href="/">
                Início
              </Link>
            </li>
            <li>
              <Link className="text-cream-200/70 transition-colors hover:text-cream-50" href="/servicos">
                Serviços
              </Link>
            </li>
            <li>
              <Link className="text-cream-200/70 transition-colors hover:text-cream-50" href="/#projetos">
                Projetos
              </Link>
            </li>
            <li>
              <Link className="text-cream-200/70 transition-colors hover:text-cream-50" href="/contato">
                Contato
              </Link>
            </li>
            <li>
              <Link className="text-cream-200/70 transition-colors hover:text-cream-50" href="/login">
                Entrar
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
            Serviços
          </h3>
          <ul className="space-y-2.5 text-sm">
            {services.slice(0, 5).map((service) => (
              <li key={service.slug}>
                <Link
                  className="text-cream-200/70 transition-colors hover:text-cream-50"
                  href={`/servicos#${service.slug}`}
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
            Contato
          </h3>
          <ul className="space-y-3 text-sm text-cream-200/70">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-2 transition-colors hover:text-cream-50"
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
            <li className="inline-flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              {siteConfig.phoneDisplay}
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-start gap-2 transition-colors hover:text-cream-50"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              {siteConfig.address}
            </li>
            <li className="inline-flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              {siteConfig.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-cream-200/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {year} {siteConfig.fullName}. Todos os direitos reservados.
          </p>
          <p>Qualidade • Compromisso • Confiança</p>
        </div>
      </div>
    </footer>
  );
}
