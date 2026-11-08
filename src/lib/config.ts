export const siteConfig = {
  name: "JR Santana",
  fullName: "JR Santana Construções e Reformas",
  tagline: "Construindo sonhos, renovando espaços",
  description:
    "Reformas, construções e acabamentos com qualidade, compromisso e confiança. Solicite seu orçamento sem compromisso.",
  // TODO: substituir pelos dados reais da empresa.
  whatsappNumber: "5500000000000",
  whatsappMessage:
    "Olá! Vim pelo site da JR Santana e gostaria de solicitar um orçamento.",
  phoneDisplay: "(00) 00000-0000",
  email: "contato@jrsantana.com.br",
  instagram: "https://www.instagram.com/jrsantanaconstrucoesereformas/",
  instagramHandle: "@jrsantanaconstrucoesereformas",
  city: "Sua cidade — UF",
  address: "Endereço da empresa — Sua cidade/UF",
  hours: "Segunda a sexta, das 8h às 18h",
  responseTime: "Resposta em até 1 dia útil",
} as const;

export const publicNav = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Contato", href: "/contato" },
] as const;

export type ServiceIcon =
  | "hammer"
  | "building"
  | "paintbrush"
  | "plug"
  | "ruler"
  | "layers";

export interface ServiceItem {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: ServiceIcon;
  bullets: string[];
}

export const services: ServiceItem[] = [
  {
    slug: "reformas-residenciais",
    title: "Reformas residenciais",
    shortDescription:
      "Transforme ambientes com planejamento, acabamento e cuidado em cada detalhe.",
    description:
      "Reformas completas ou pontuais para casas e apartamentos, com acompanhamento próximo e respeito ao prazo combinado.",
    icon: "hammer",
    bullets: ["Cozinhas e banheiros", "Salas e quartos", "Áreas externas"],
  },
  {
    slug: "construcoes-ampliacoes",
    title: "Construções e ampliações",
    shortDescription:
      "Do alicerce ao acabamento, construímos com solidez e transparência.",
    description:
      "Execução de obras novas e ampliações com organização de etapas, controle de materiais e comunicação clara com o cliente.",
    icon: "building",
    bullets: ["Obras residenciais", "Ampliações", "Muros e estruturas"],
  },
  {
    slug: "acabamentos",
    title: "Acabamentos",
    shortDescription:
      "O detalhe final que valoriza a obra e muda a percepção do ambiente.",
    description:
      "Revestimentos, gesso, forros, pisos e detalhes que dão personalidade e durabilidade ao seu projeto.",
    icon: "layers",
    bullets: ["Pisos e revestimentos", "Gesso e forro", "Marcenaria sob medida"],
  },
  {
    slug: "instalacoes",
    title: "Instalações elétricas e hidráulicas",
    shortDescription:
      "Instalações seguras, bem executadas e prontas para o dia a dia.",
    description:
      "Serviços elétricos e hidráulicos executados com atenção à segurança, à norma e à facilidade de manutenção.",
    icon: "plug",
    bullets: ["Pontos elétricos", "Tubulações", "Manutenção preventiva"],
  },
  {
    slug: "pintura",
    title: "Pintura e texturas",
    shortDescription:
      "Cor, textura e proteção para renovar qualquer ambiente.",
    description:
      "Pintura interna e externa, texturas e efeitos decorativos com preparação adequada da superfície.",
    icon: "paintbrush",
    bullets: ["Pintura interna", "Pintura externa", "Texturas e efeitos"],
  },
  {
    slug: "projetos-planejamento",
    title: "Projetos e planejamento",
    shortDescription:
      "Clareza antes da primeira martelada, para evitar surpresas na obra.",
    description:
      "Levantamento de necessidades, organização de etapas e orientação para que cada decisão faça sentido no orçamento.",
    icon: "ruler",
    bullets: ["Levantamento técnico", "Planejamento de etapas", "Orçamento detalhado"],
  },
];

export const pillars = [
  {
    title: "Qualidade",
    description:
      "Materiais e execução cuidadosa em cada etapa, do primeiro traço ao acabamento final.",
  },
  {
    title: "Compromisso",
    description:
      "Prazos combinados com clareza, acompanhamento próximo e respeito ao seu investimento.",
  },
  {
    title: "Confiança",
    description:
      "Comunicação direta, transparência no orçamento e cuidado com o ambiente da sua família.",
  },
] as const;

export const steps = [
  {
    title: "Escolha o melhor horário",
    description:
      "Crie sua conta e selecione uma data disponível para a visita técnica.",
  },
  {
    title: "Descreva sua obra",
    description:
      "Conte o que precisa, informe o endereço e deixe observações importantes.",
  },
  {
    title: "Receba o atendimento",
    description:
      "Nossa equipe confirma a visita e orienta os próximos passos do seu projeto.",
  },
] as const;

export const gallery = [
  {
    title: "Cozinha reformada",
    category: "Reforma residencial",
    tone: "from-ink-800 via-ink-700 to-gold-700",
  },
  {
    title: "Sala integrada",
    category: "Acabamento",
    tone: "from-gold-700 via-gold-600 to-ink-800",
  },
  {
    title: "Banheiro moderno",
    category: "Reforma residencial",
    tone: "from-ink-700 via-ink-800 to-ink-950",
  },
  {
    title: "Fachada renovada",
    category: "Pintura e textura",
    tone: "from-gold-600 via-ink-700 to-ink-900",
  },
  {
    title: "Área externa",
    category: "Construção",
    tone: "from-ink-900 via-gold-700 to-gold-500",
  },
  {
    title: "Detalhe de acabamento",
    category: "Acabamento",
    tone: "from-gold-500 via-gold-700 to-ink-800",
  },
] as const;

// TODO: substituir por depoimentos reais de clientes.
export const testimonials = [
  {
    quote:
      "Atendimento próximo do começo ao fim. Explicaram cada etapa e cumpriram o prazo combinado.",
    name: "Cliente residencial",
    detail: "Reforma de cozinha",
  },
  {
    quote:
      "O cuidado com o acabamento fez toda a diferença. Ficou melhor do que imaginávamos.",
    name: "Cliente residencial",
    detail: "Reforma de banheiro",
  },
  {
    quote:
      "Transparência no orçamento e organização durante a obra. Recomendo pelo compromisso.",
    name: "Cliente comercial",
    detail: "Adequação de espaço",
  },
] as const;

export const faq = [
  {
    question: "Como funciona o orçamento?",
    answer:
      "Você agenda uma visita técnica pelo site ou pelo WhatsApp. Nossa equipe conhece o espaço, entende a necessidade e prepara um orçamento detalhado, sem compromisso.",
  },
  {
    question: "Quais regiões vocês atendem?",
    answer:
      "Atendemos a cidade e a região indicadas na página de contato. Envie seu endereço pelo WhatsApp para confirmarmos a disponibilidade.",
  },
  {
    question: "Qual é o prazo médio de uma reforma?",
    answer:
      "O prazo depende do tamanho e da complexidade do serviço. Após a visita técnica, apresentamos um cronograma com as etapas e a previsão de conclusão.",
  },
  {
    question: "Os materiais estão inclusos no orçamento?",
    answer:
      "Podemos trabalhar com materiais indicados por você ou incluir o fornecimento no orçamento. A escolha fica clara antes do início da obra.",
  },
  {
    question: "É possível acompanhar o andamento da obra?",
    answer:
      "Sim. Mantemos comunicação direta com o cliente e enviamos atualizações sobre as etapas e os próximos passos.",
  },
] as const;

export function whatsappLink(message: string = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const instagramLink = siteConfig.instagram;
