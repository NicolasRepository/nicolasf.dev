import { createContext, useContext, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type Language = "pt" | "en";

// --- DICIONÁRIO DE TRADUÇÃO ---
const translations = {
  pt: {
    nav: {
      inicio: "Início",
      sobre: "Sobre",
      servicos: "Serviços",
      precos: "Preços",
      portfolio: "Portfólio",
      contato: "Contato",
      cta: "Solicitar Orçamento",
    },
    hero: {
      badge1: "⚡ Disponível para projetos",
      badge2: "Full Stack Dev",
      title1: "Sites ",
      title2: "Modernos",
      title3: " e de ",
      title4: "Alta Performance",
      title5: " que Transformam ",
      title6: "Visitantes",
      title7: " em ",
      title8: "Clientes",
      subtitle: "Desenvolvimento sob medida com arquitetura moderna para empresas e agências que precisam de resultados reais — não só de um site bonito.",
      ctaPrimary: "Criar Meu Site",
      ctaSecondary: "Ver Projetos →",
      stat1Num: "Entrega",
      stat1Label: "em até 10 dias úteis",
      stat2Num: "Suporte",
      stat2Label: "dentro de 3 dias",
      stat3Num: "Atendimento",
      stat3Label: "personalizado por cliente",
      badgeSpeed: "⚡ Velocidade",
      badgeSpeedVal: "Entrega rápida",
      badgeSat: "💜 Satisfação",
    },
    about: {
      title: "Quem Sou Eu",
      stack: "// stack principal",
      heading: "Desenvolvimento que gera resultado, não só código.",
      text1Opcao: "Colégio Opção",
      text1Unifesp: "UNIFESP São José dos Campos",
      text1Before: "Sou desenvolvedor Full Stack com formação técnica em Informática pelo ",
      text1Middle: " e graduação em Ciência e Tecnologia (BCT) pela ",
      text1After: ".",
      text2: "Meu foco vai além de entregar um site — entrego uma máquina de conversão. Cada projeto é construído com arquitetura sólida, performance extrema e design orientado a resultados mensuráveis para empresas e agências.",
      edu1Title: "COLÉGIO OPÇÃO",
      edu1Sub: "Técnico em Informática",
      edu2Title: "UNIFESP SJC",
      edu2Sub: "Bacharelado Interdisciplinar em Ciência e Tecnologia",
    },
    services: {
      title: "Serviços",
      subtitle: "Soluções distintas para quem quer vender mais e para quem precisa escalar a operação.",
      tabEmpresas: "🏢 Para Empresas",
      tabAgencias: "🏭 Para Agências",
      empresas: [
        { icon: "🤝", title: "Parceria White-Label", desc: "Desenvolvimento invisível: você vende para o seu cliente e eu entrego o código com a sua marca." },
        { icon: "🚀", title: "Demanda Sob Medida", desc: "Absorvo o excesso de projetos da sua equipe sem necessidade de contratar um dev fixo." },
        { icon: "📋", title: "Do Layout ao Código", desc: "Recebo o briefing ou design no Figma e entrego a aplicação pronta e testada para publicação." },
        { icon: "🔌", title: "Integração de APIs e CRMs", desc: "Conexão de formulários e sistemas com ferramentas externas como Webhooks, CRMs e e-mail marketing." },
        { icon: "📞", title: "Comunicação Direta", desc: "Acompanhamento do progresso diretamente com o desenvolvedor, sem intermediários ou burocracia." },
        { icon: "💼", title: "Contrato de NDA e Sigilo", desc: "Acordo de confidencialidade assinado para proteger as informações da sua agência e do cliente." },
      ],
      agencias: [
        { icon: "🎯", title: "Landing Pages Objetivas", desc: "Estrutura focada em apresentar seu produto de forma clara e facilitar a conversão de novos leads." },
        { icon: "📱", title: "Direcionamento para WhatsApp", desc: "Botões e formulários configurados para enviar a mensagem do cliente direto para o seu WhatsApp." },
        { icon: "📊", title: "Instalação de Tags e Pixels", desc: "Configuração do Google Analytics e Meta Pixel para você acompanhar o tráfego e o resultado dos anúncios." },
        { icon: "⚡", title: "Código Otimizado e Leve", desc: "Páginas construídas com foco em carregamento rápido e boa performance em celulares e computadores." },
        { icon: "🎨", title: "Aprovação Visual (Figma)", desc: "Você visualiza e aprova a estrutura de design do site antes de qualquer linha de código ser escrita." },
        { icon: "🗄️", title: "Organização de Contatos", desc: "Dados preenchidos pelos clientes são salvos com segurança e disponibilizados no e-mail ou Google Sheets." },
      ],
    },
    pricing: {
      title: "Tabela de Valores",
      subtitle: "Estrutura modular — você paga só pelo que realmente precisa.",
      baseBadge: "Projeto Base",
      baseSub: "Pagamento único — sem mensalidade escondida",
      baseHeader: "// INCLUSO NO PROJETO BASE",
      baseItems: [
        "Interface web moderna e 100% responsiva",
        "Design visual e prototipagem",
        "Integração com banco de dados",
        "Conexão com Google Planilhas",
        "Formulários dinâmicos e coleta de dados",
        "Hospedagem e publicação em nuvem",
        "Configuração de domínio próprio",
        "Otimização de velocidade",
      ],
      extraHeader: "// MÓDULOS ADICIONAIS",
      modules: [
        { name: "Notificação WhatsApp / E-mail", brl: 500, icon: "💬", suffix: "" },
        { name: "Entrega Express em 5 dias úteis", brl: 500, icon: "⚡", suffix: "" },
        { name: "Rastreamento Meta / Google Ads", brl: 250, icon: "📊", suffix: "" },
        { name: "Páginas Extras", brl: 250, icon: "📄", suffix: " / cada" },
      ],
      supportBadge: "Assistência Técnica",
      supportTitle: "Pós-entrega",
      supportSub: "Suporte contínuo sem surpresas",
      perMonth: "/mês",
      monthlySub: "Plano mensal — cancele quando quiser",
      perSemi: "/semestral",
      savings: "💚 Economia de ",
      supportItems: ["Ajustes de conteúdo", "Correção de Bugs", "Suporte por WhatsApp"],
    },
    portfolio: {
      title: "Portfólio",
      subtitle: "Projetos reais com resultados mensuráveis — de clientes contratantes a experimentos próprios.",
      tabClients: "🤝 Trabalhos para Clientes",
      tabPersonal: "🛠️ Projetos Individuais",
      tabAcademic: "🎓 Projetos Acadêmicos",
      projCount: "projetos",
      linkUnavailable: "Link indisponível",
      visitProject: "Visitar Projeto →",
      clientProjects: [
        { title: "Agência Guia: Captação de Lead", tag: "Marketing", img: "/images/agenciaGuia.jpeg", desc: "Landing page de alta conversão com formulário inteligente, validação de dados e automação de atendimento via WhatsApp." },
      ],
      personalProjects: [
        { title: "Very Very Games: Hub de jogos diversos", tag: "Lazer", img: "/images/vvg.jpg", desc: "Biblioteca de vários jogos feitos por mim.", link: "https://nicolasrepository.github.io/veryverygames/" },
        { title: "AprendePlay", tag: "Educação", img: "/images/aprendeplay.png", desc: "Jogos infantis para auxiliar na alfabetização.", link: "https://aprendeplay.vercel.app" },
        { title: "Very Very Tools: Hub de ferramentas diversas.", tag: "Utilitários", img: "/images/favicon.svg", desc: "Plataforma que hospeda diversas ferramentas client-sided, sem login, rápido e fácil.", link: "https://www.veryverytools.com" },
      ],
      academicProjects: [
        { title: "Athen: Plataforma de Estudos Gameficada", tag: "Educação", img: "/images/athen.png", desc: "Plataforma de cursos criados pela comunidade, para a comunidade, inspirado em Duolingo e Kahoot." },
        { title: "Números Primos: Onde a matemática encontra a criptografia.", tag: "Educação", img: "/images/numpri.png", desc: "Plataforma de conteúdos sobre números primos e criptografias, com informações e jogos.", link: "https://l.instagram.com/?u=https%3A%2F%2Fnumeros-primos-theta.vercel.app%2F%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAacelE5nuHyejfND43oB5D27fRzIiGby6FhcWTVnVsZtOYIJ8tZV117tUqQ2BQ_aem_al2_0kYO1qrj-f_ZMHEznA&e=AUDLVx_1ux-ZLi_0VH20jps_95yFJH3VTmtA39NVUYpuFX-bxhuQNCA4k78qAMQzvbXvxG3W0UT-onkSW-Kj6VAAkBiELE1mP-7rzmj9LLCii1IPlEkaRk65NsVQDqEAFBdGAdo" },
      ],
    },
    contact: {
      title: "Vamos Conversar?",
      subtitle: "Preencha o formulário e em poucos segundos entrarei em contato com você para conversarmos sobre o seu projeto.",
      features: [
        { icon: "⚡", title: "Resposta em até 24h", sub: "Durante o horário comercial" },
        { icon: "💬", title: "Contato direto", sub: "Sem formulários intermináveis" },
        { icon: "🎯", title: "Orçamento personalizado", sub: "Baseado na sua necessidade real" },
      ],
      labelName: "Nome completo",
      placeName: "Seu nome",
      labelPhone: "WhatsApp",
      placePhone: "(11) 99999-9999",
      labelEmail: "Email",
      placeEmail: "nome@gmail.com",
      labelIndustry: "Ramo da Empresa",
      placeIndustry: "Ex: Clínica médica, e-commerce, consultoria...",
      labelType: "Tipo de cliente",
      typeOptions: [["empresa", "🏢 Empresa"], ["agencia", "🏭 Agência"], ["outros", "🧩 Outros"]],
      errTurnstile: "Aguarde a verificação de segurança carregar e tente novamente.",
      errFields: "Verifique os campos destacados abaixo.",
      errBot: "Não foi possível confirmar que você não é um robô. Recarregue a página e tente novamente.",
      errRate: "Você atingiu o limite de envios. Aguarde alguns minutos e tente novamente.",
      errServer: "Não foi possível enviar seus dados agora. Tente novamente em instantes.",
      errConn: "Erro de conexão. Verifique sua internet e tente novamente.",
      btnSending: "Enviando...",
      btnSuccess: "✓ Enviado com sucesso!",
      btnSend: "Enviar Mensagem 💬",
    },
    footer: {
      rights: "© 2026 — Nicolas Almeida Faria. Todos os direitos reservados.",
    },
  },
  en: {
    nav: {
      inicio: "Home",
      sobre: "About",
      servicos: "Services",
      precos: "Pricing",
      portfolio: "Portfolio",
      contato: "Contact",
      cta: "Request Quote",
    },
    hero: {
      badge1: "⚡ Available for projects",
      badge2: "Full Stack Dev",
      title1: "Modern ",
      title2: "& High-Performance",
      title3: " Websites ",
      title4: "that Turn",
      title5: " Visitors ",
      title6: "into ",
      title7: "Customers",
      title8: "",
      subtitle: "Tailored development with modern architecture for companies and agencies that need real results — not just a pretty website.",
      ctaPrimary: "Build My Website",
      ctaSecondary: "View Projects →",
      stat1Num: "Delivery",
      stat1Label: "within 10 business days",
      stat2Num: "Support",
      stat2Label: "within 3 days",
      stat3Num: "Service",
      stat3Label: "personalized per client",
      badgeSpeed: "⚡ Speed",
      badgeSpeedVal: "Fast delivery",
      badgeSat: "💜 Satisfaction",
    },
    about: {
      title: "About Me",
      stack: "// main stack",
      heading: "Development that drives results, not just code.",
      text1Opcao: "Colégio Opção",
      text1Unifesp: "UNIFESP São José dos Campos",
      text1Before: "I am a Full Stack Developer with a technical degree in IT from ",
      text1Middle: " and a Bachelor's degree in Science and Technology (BCT) from ",
      text1After: ".",
      text2: "My focus goes beyond delivering a website — I build a conversion engine. Every project is crafted with solid architecture, extreme performance, and design oriented towards measurable results for businesses and agencies.",
      edu1Title: "COLÉGIO OPÇÃO",
      edu1Sub: "IT Tech Diploma",
      edu2Title: "UNIFESP SJC",
      edu2Sub: "B.S. in Science and Technology",
    },
    services: {
      title: "Services",
      subtitle: "Distinct solutions for businesses wanting to sell more and agencies looking to scale operations.",
      tabEmpresas: "🏢 For Companies",
      tabAgencias: "🏭 For Agencies",
      empresas: [
        { icon: "🤝", title: "White-Label Partnership", desc: "Invisible development: you sell to your client, and I deliver the code under your brand." },
        { icon: "🚀", title: "Custom On-Demand", desc: "I absorb your team's project overflow without the hassle of hiring a full-time dev." },
        { icon: "📋", title: "From Layout to Code", desc: "Hand over your Figma design or briefing, and I'll deliver a fully tested, ready-to-publish app." },
        { icon: "🔌", title: "API & CRM Integration", desc: "Connect forms and web apps with external services like Webhooks, CRMs, and email tools." },
        { icon: "📞", title: "Direct Communication", desc: "Track progress directly with the developer — no bureaucracy or middlemen." },
        { icon: "💼", title: "NDA & Confidentiality", desc: "Signed non-disclosure agreement to protect your agency's and client's sensitive information." },
      ],
      agencias: [
        { icon: "🎯", title: "Targeted Landing Pages", desc: "Structure focused on presenting your product clearly and maximizing lead conversions." },
        { icon: "📱", title: "WhatsApp Directing", desc: "Buttons and forms configured to send customer inquiries directly to your WhatsApp." },
        { icon: "📊", title: "Tags & Pixels Setup", desc: "Google Analytics and Meta Pixel integration to track your site traffic and ad performance." },
        { icon: "⚡", title: "Lightweight & Fast Code", desc: "Pages built for instant loading times and top-notch mobile/desktop performance." },
        { icon: "🎨", title: "Visual Design Approval", desc: "Preview and approve the Figma UI structure before a single line of code is written." },
        { icon: "🗄️", title: "Lead & Contact Sync", desc: "Customer form data is saved securely and routed directly to your email or Google Sheets." },
      ],
    },
    pricing: {
      title: "Pricing",
      subtitle: "Modular structure — pay only for what you actually need.",
      baseBadge: "Base Project",
      baseSub: "One-time payment — no hidden monthly fees",
      baseHeader: "// INCLUDED IN BASE PROJECT",
      baseItems: [
        "Modern, 100% responsive web interface",
        "UI/UX design and prototyping",
        "Database integration",
        "Google Sheets connection",
        "Dynamic forms and data collection",
        "Cloud hosting and deployment",
        "Custom domain setup",
        "Speed & SEO optimization",
      ],
      extraHeader: "// ADDITIONAL MODULES",
      modules: [
        { name: "WhatsApp / Email Notification", brl: 500, icon: "💬", suffix: "" },
        { name: "5-Day Express Delivery", brl: 500, icon: "⚡", suffix: "" },
        { name: "Meta / Google Ads Tracking", brl: 250, icon: "📊", suffix: "" },
        { name: "Extra Pages", brl: 250, icon: "📄", suffix: " / each" },
      ],
      supportBadge: "Technical Support",
      supportTitle: "Post-Delivery",
      supportSub: "Ongoing support without surprises",
      perMonth: "/month",
      monthlySub: "Monthly plan — cancel anytime",
      perSemi: "/semi-annually",
      savings: "💚 Save ",
      supportItems: ["Content updates", "Bug fixes", "WhatsApp support"],
    },
    portfolio: {
      title: "Portfolio",
      subtitle: "Real projects with measurable results — from client solutions to personal builds.",
      tabClients: "🤝 Client Work",
      tabPersonal: "🛠️ Personal Projects",
      tabAcademic: "🎓 Academic Projects",
      projCount: "projects",
      linkUnavailable: "Link unavailable",
      visitProject: "Visit Project →",
      clientProjects: [
        { title: "Agência Guia: Lead Generation", tag: "Marketing", img: "/images/agenciaGuia.jpeg", desc: "High-conversion landing page with smart form validation and automated WhatsApp customer flow." },
      ],
      personalProjects: [
        { title: "Very Very Games: Game Hub", tag: "Leisure", img: "/images/vvg.jpg", desc: "A library of multiple games created by me.", link: "https://nicolasrepository.github.io/veryverygames/" },
        { title: "AprendePlay", tag: "Education", img: "/images/aprendeplay.png", desc: "Children's games to aid in literacy learning.", link: "https://aprendeplay.vercel.app" },
        { title: "Very Very Tools: Client-side Utility Hub", tag: "Utilities", img: "/images/favicon.svg", desc: "Platform hosting various client-side web tools with no login needed.", link: "https://www.veryverytools.com" },
      ],
      academicProjects: [
        { title: "Athen: Gamified Study Platform", tag: "Education", img: "/images/athen.png", desc: "Community-created course platform inspired by Duolingo and Kahoot." },
        { title: "Prime Numbers: Math meets Cryptography", tag: "Education", img: "/images/numpri.png", desc: "Interactive learning platform exploring prime numbers and cryptography with games.", link: "https://l.instagram.com/?u=https%3A%2F%2Fnumeros-primos-theta.vercel.app%2F%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAacelE5nuHyejfND43oB5D27fRzIiGby6FhcWTVnVsZtOYIJ8tZV117tUqQ2BQ_aem_al2_0kYO1qrj-f_ZMHEznA&e=AUDLVx_1ux-ZLi_0VH20jps_95yFJH3VTmtA39NVUYpuFX-bxhuQNCA4k78qAMQzvbXvxG3W0UT-onkSW-Kj6VAAkBiELE1mP-7rzmj9LLCii1IPlEkaRk65NsVQDqEAFBdGAdo" },
      ],
    },
    contact: {
      title: "Let's Talk?",
      subtitle: "Fill out the form below and I'll get back to you shortly to discuss your project.",
      features: [
        { icon: "⚡", title: "Response within 24h", sub: "During business hours" },
        { icon: "💬", title: "Direct Contact", sub: "No endless forms" },
        { icon: "🎯", title: "Custom Quote", sub: "Tailored to your actual needs" },
      ],
      labelName: "Full Name",
      placeName: "Your name",
      labelPhone: "WhatsApp / Phone",
      placePhone: "+1 (555) 000-0000",
      labelEmail: "Email",
      placeEmail: "name@gmail.com",
      labelIndustry: "Business Industry",
      placeIndustry: "e.g. Medical clinic, e-commerce, consulting...",
      labelType: "Client Type",
      typeOptions: [["empresa", "🏢 Company"], ["agencia", "🏭 Agency"], ["outros", "🧩 Others"]],
      errTurnstile: "Please wait for security verification to load and try again.",
      errFields: "Please check the highlighted fields below.",
      errBot: "Could not verify you are not a robot. Please refresh and try again.",
      errRate: "Rate limit reached. Please wait a few minutes and try again.",
      errServer: "Could not send data right now. Please try again shortly.",
      errConn: "Connection error. Please check your network and try again.",
      btnSending: "Sending...",
      btnSuccess: "✓ Sent successfully!",
      btnSend: "Send Message 💬",
    },
    footer: {
      rights: "© 2026 — Nicolas Almeida Faria. All rights reserved.",
    },
  },
};

// --- CONTEXTO DE IDIOMA E PREÇOS ---
interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations["pt"];
  formatPrice: (brl: number) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// --- BOTÃO SWITCH DE IDIOMA ---
function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "pt" ? "en" : "pt")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#16161A",
        border: "1px solid rgba(124,58,237,0.4)",
        borderRadius: 20,
        padding: "5px 12px",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        fontWeight: 700,
        boxShadow: "0 0 10px rgba(124,58,237,0.15)",
      }}
      title={lang === "pt" ? "Mudar para Inglês" : "Switch to Portuguese"}
    >
      <span style={{ color: lang === "pt" ? "#22C55E" : "#A7A7A3", transition: "color 0.2s" }}>PT</span>
      <span style={{ color: "#4A4A52" }}>|</span>
      <span style={{ color: lang === "en" ? "#22C55E" : "#A7A7A3", transition: "color 0.2s" }}>EN</span>
    </button>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { label: t.nav.inicio, id: "inicio" },
    { label: t.nav.sobre, id: "sobre" },
    { label: t.nav.servicos, id: "servicos" },
    { label: t.nav.precos, id: "precos" },
    { label: t.nav.portfolio, id: "portfolio" },
    { label: t.nav.contato, id: "contato" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "rgba(11,11,14,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(42,42,50,0.8)" }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#7C3AED", boxShadow: "0 0 10px #7C3AED" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            nicolasf<span style={{ color: "#7C3AED" }}>.</span>dev
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#A7A7A3", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A7A7A3")}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitch />
          <button
            onClick={() => scrollTo("contato")}
            style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 16px rgba(34,197,94,0.35)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#16A34A"; e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#22C55E"; e.currentTarget.style.boxShadow = "0 0 16px rgba(34,197,94,0.35)"; }}
          >
            {t.nav.cta}
          </button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitch />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#FFFFFF" }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ backgroundColor: "#16161A", borderTop: "1px solid #2A2A32" }} className="md:hidden px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)} style={{ fontFamily: "var(--font-body)", color: "#A7A7A3", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.95rem" }}>
              {item.label}
            </button>
          ))}
          <button onClick={() => scrollTo("contato")} style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}>
            {t.nav.cta}
          </button>
        </div>
      )}
    </header>
  );
}

function Badge({ children, color = "purple" }: { children: React.ReactNode; color?: "purple" | "green" | "blue" }) {
  const styles = {
    purple: { bg: "rgba(124,58,237,0.7)", border: "rgba(124,58,237,0.9)" },
    green: { bg: "rgba(34,197,94,0.6)", border: "rgba(34,197,94,0.8)" },
    blue: { bg: "rgba(59,130,246,0.6)", border: "rgba(59,130,246,0.8)" } 
  };
  
  const { bg, border } = styles[color] || styles.purple;
  
  return (
    <span style={{ backgroundColor: bg, border: `1px solid ${border}`, color: "#FFFFFF", fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 600, padding: "4px 10px", borderRadius: 20, display: "inline-block", letterSpacing: "0.04em" }}>
      {children}
    </span>
  );
}

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="inicio" style={{ paddingTop: 120, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
      <div className="hero-glow" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-6">
            <Badge color="green">{t.hero.badge1}</Badge>
            <Badge color="purple">{t.hero.badge2}</Badge>
          </div>

          <h1 style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
            {t.hero.title1}
            <span className="gradient-text">{t.hero.title2}</span>
            {t.hero.title3}
            <br />
            <span className="gradient-text">{t.hero.title4}</span>
            <br />
            {t.hero.title5}
            <span className="gradient-text">{t.hero.title6}</span>
            {t.hero.title7}
            <span className="gradient-text">{t.hero.title8}</span>
          </h1>

          <p style={{ color: "#A7A7A3", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(34,197,94,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
              onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t.hero.ctaPrimary}
            </button>
            <button
              style={{ backgroundColor: "transparent", color: "#FFFFFF", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"; e.currentTarget.style.backgroundColor = "rgba(124,58,237,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.backgroundColor = "transparent"; }}
              onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t.hero.ctaSecondary}
            </button>
          </div>

          <div className="flex flex-wrap gap-6 mt-10">
            {[[t.hero.stat1Num, t.hero.stat1Label], [t.hero.stat2Num, t.hero.stat2Label], [t.hero.stat3Num, t.hero.stat3Label]].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "#7C3AED" }}>{num}</div>
                <div style={{ color: "#A7A7A3", fontSize: "0.78rem", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 300, height: 380, borderRadius: 20, overflow: "hidden", position: "relative", boxShadow: "0 0 60px rgba(124,58,237,0.35), 0 0 120px rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <img
                src="/images/eu2.jpg"
                alt="Desenvolvedor Full Stack"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(11,11,14,0.8) 100%)" }} />
            </div>

            <div style={{ position: "absolute", top: -16, right: -20, backgroundColor: "#1C1C22", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 0 20px rgba(34,197,94,0.2)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#22C55E" }}>{t.hero.badgeSpeed}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "#FFFFFF" }}>{t.hero.badgeSpeedVal}</div>
            </div>

            <div style={{ position: "absolute", bottom: -16, left: -20, backgroundColor: "#1C1C22", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF" }}>{t.hero.badgeSat}</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "#FFFFFF" }}>98%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="sobre" style={{ padding: "100px 0", backgroundColor: "#16161A", position: "relative" }}>
      <div className="section-divider" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            {t.about.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div style={{ position: "relative" }}>
            <div style={{ aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", maxWidth: 360, border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 40px rgba(124,58,237,0.2)" }}>
              <img
                src="/images/eu1.jpg"
                alt="Foto profissional do desenvolvedor"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "rgba(11,11,14,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 4 }}>{t.about.stack}</div>
              <div className="flex flex-wrap gap-2">
                {["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"].map((tech) => (
                  <span key={tech} style={{ backgroundColor: "rgba(124,58,237,0.15)", color: "#9D6FEF", fontSize: "0.7rem", padding: "3px 8px", borderRadius: 6, fontFamily: "var(--font-mono)" }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-2 mb-6">
              <Badge color="purple">OPÇÃO</Badge>
              <Badge color="green">UNIFESP</Badge>
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.2 }}>
              {t.about.heading}
            </h3>
            <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 16 }}>
              {t.about.text1Before}
              <span style={{ color: "#FFFFFF" }}>{t.about.text1Opcao}</span>
              {t.about.text1Middle}
              <span style={{ color: "#FFFFFF" }}>{t.about.text1Unifesp}</span>
              {t.about.text1After}
            </p>
            <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 24 }}>
              {t.about.text2}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎓", title: t.about.edu1Title, sub: t.about.edu1Sub },
                { icon: "🏛️", title: t.about.edu2Title, sub: t.about.edu2Sub },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 12, padding: "14px 16px", transition: "all 0.2s", border: "1px solid rgba(42,42,50,0.8)" }}>
                  <div style={{ fontSize: "1.2rem", marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", marginBottom: 2 }}>{title}</div>
                  <div style={{ color: "#A7A7A3", fontSize: "0.78rem" }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="section-divider" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}

function ServicesSection() {
  const [activeTab, setActiveTab] = useState<"empresas" | "agencias">("empresas");
  const { t } = useLanguage();

  const features = activeTab === "empresas" ? t.services.empresas : t.services.agencias;

  return (
    <section id="servicos" style={{ padding: "100px 0" }}>
      <div style={{ position: "absolute", marginTop: -80 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            {t.services.title}
          </h2>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 40, maxWidth: 480, lineHeight: 1.7 }}>
          {t.services.subtitle}
        </p>

        <div className="flex gap-2 mb-10" style={{ borderBottom: "1px solid #2A2A32", paddingBottom: 0 }}>
          {(["empresas", "agencias"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "12px 28px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeTab === tab ? "#FFFFFF" : "#A7A7A3",
                borderBottom: activeTab === tab ? "2px solid #7C3AED" : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {tab === "empresas" ? t.services.tabEmpresas : t.services.tabAgencias}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="glow-card"
              style={{ backgroundColor: "#16161A", borderRadius: 14, padding: 24, border: "1px solid rgba(42,42,50,0.8)", cursor: "default", transition: "all 0.25s" }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: 12 }}>{icon}</div>
              <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", marginBottom: 8, lineHeight: 1.3 }}>{title}</h4>
              <p style={{ color: "#A7A7A3", fontSize: "0.875rem", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t, formatPrice } = useLanguage();

  return (
    <section id="precos" style={{ padding: "100px 0", backgroundColor: "#16161A", position: "relative" }}>
      <div className="section-divider" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 3, height: 28, backgroundColor: "#22C55E", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            {t.pricing.title}
          </h2>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 48, lineHeight: 1.7 }}>
          {t.pricing.subtitle}
        </p>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div style={{ gridColumn: "span 2" }}>
            <div className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 4px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(34,197,94,0.08) 100%)", padding: "28px 28px 24px", borderBottom: "1px solid rgba(42,42,50,0.8)" }}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <Badge color="purple">{t.pricing.baseBadge}</Badge>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.6rem", letterSpacing: "-0.03em", marginTop: 8, color: "#FFFFFF" }}>
                      {formatPrice(1000)}
                    </div>
                    <div style={{ color: "#A7A7A3", fontSize: "0.875rem", marginTop: 4 }}>{t.pricing.baseSub}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "24px 28px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 16, letterSpacing: "0.06em" }}>{t.pricing.baseHeader}</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {t.pricing.baseItems.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span style={{ color: "#22C55E", flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ color: "#A7A7A3", fontSize: "0.875rem" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 12, letterSpacing: "0.06em" }}>{t.pricing.extraHeader}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.pricing.modules.map(({ name, brl, icon, suffix }) => (
                  <div key={name} style={{ backgroundColor: "#1C1C22", border: "1px solid rgba(42,42,50,0.8)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "all 0.2s", cursor: "default" }}
                    className="glow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                      <span style={{ fontSize: "0.875rem", color: "#A7A7A3", fontFamily: "var(--font-body)" }}>{name}</span>
                    </div>
                    <span style={{ color: "#22C55E", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                      +{formatPrice(brl)}{suffix}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 16, border: "1px solid rgba(34,197,94,0.25)", overflow: "hidden", boxShadow: "0 0 0 1px rgba(34,197,94,0.1), 0 4px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(11,11,14,0) 100%)", padding: "24px 24px 20px", borderBottom: "1px solid rgba(42,42,50,0.8)" }}>
                <Badge color="green">{t.pricing.supportBadge}</Badge>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", marginTop: 10, letterSpacing: "-0.02em" }}>{t.pricing.supportTitle}</div>
                <div style={{ color: "#A7A7A3", fontSize: "0.8rem", marginTop: 4 }}>{t.pricing.supportSub}</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div className="flex flex-col gap-4">
                  <div style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "#22C55E" }}>
                      {formatPrice(100)}<span style={{ fontSize: "0.9rem", color: "#A7A7A3", fontWeight: 400 }}>{t.pricing.perMonth}</span>
                    </div>
                    <div style={{ color: "#A7A7A3", fontSize: "0.8rem", marginTop: 4 }}>{t.pricing.monthlySub}</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "#9D6FEF" }}>
                      {formatPrice(500)}<span style={{ fontSize: "0.9rem", color: "#A7A7A3", fontWeight: 400 }}>{t.pricing.perSemi}</span>
                    </div>
                    <div style={{ color: "#22C55E", fontSize: "0.8rem", marginTop: 4 }}>
                      {t.pricing.savings}{formatPrice(100)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  {t.pricing.supportItems.map((item) => (
                    <div key={item} className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                      <span style={{ color: "#22C55E", fontSize: "0.8rem" }}>✓</span>
                      <span style={{ color: "#A7A7A3", fontSize: "0.8rem" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="section-divider" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}

function PortfolioCard({ title, tag, img, desc, link, badgeColor }: { title: string; tag: string; img: string; desc: string; link?: string; badgeColor: "purple" | "green" | "blue" }) {
  const { t } = useLanguage();
  const isLocalImage = img.startsWith("/");
  const imageSrc = isLocalImage 
    ? img 
    : `https://images.unsplash.com/${img}?w=800&h=400&fit=crop&auto=format`;

  const textColor = badgeColor === "purple" ? "#7C3AED" : (badgeColor === "blue" ? "#3B82F6" : "#22C55E");
  const bottomText = !link ? t.portfolio.linkUnavailable : t.portfolio.visitProject;

  return (
    <div
      className="glow-card"
      style={{ backgroundColor: "#16161A", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(42,42,50,0.8)", cursor: "pointer", transition: "all 0.25s" }}
    >
      <div style={{ height: 200, overflow: "hidden", position: "relative", backgroundColor: "#1C1C22" }}>
        <img
          src={imageSrc}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(11,11,14,0.8) 100%)" }} />
        <div style={{ position: "absolute", top: 16, left: 16 }}>
          <Badge color={badgeColor}>{tag}</Badge>
        </div>
      </div>
      <div style={{ padding: "20px 22px" }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: 8 }}>{title}</h4>
        <p style={{ color: "#A7A7A3", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: "inline-block",
            marginTop: 14, 
            color: textColor, 
            fontSize: "0.85rem", 
            fontWeight: 600, 
            fontFamily: "var(--font-display)",
            textDecoration: "none"
          }}
        >
          {bottomText}
        </a>
      </div>
    </div>
  );
}

function PortfolioSection() {
  const [activeTab, setActiveTab] = useState<"clientes" | "pessoais" | "academicos">("clientes");
  const { t } = useLanguage();

  return (
    <section id="portfolio" style={{ padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
              {t.portfolio.title}
            </h2>
          </div>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 32, lineHeight: 1.7, maxWidth: 520 }}>
          {t.portfolio.subtitle}
        </p>

        <div className="flex gap-2 mb-10" style={{ borderBottom: "1px solid #2A2A32", overflowX: "auto" }}>
          {([
            { key: "clientes", label: t.portfolio.tabClients, badge: `${t.portfolio.clientProjects.length} ${t.portfolio.projCount}` },
            { key: "pessoais", label: t.portfolio.tabPersonal, badge: `${t.portfolio.personalProjects.length} ${t.portfolio.projCount}` },
            { key: "academicos", label: t.portfolio.tabAcademic, badge: `${t.portfolio.academicProjects.length} ${t.portfolio.projCount}` },
          ] as const).map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                padding: "12px 24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeTab === key ? "#FFFFFF" : "#A7A7A3",
                borderBottom: activeTab === key ? "2px solid #7C3AED" : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap"
              }}
            >
              {label}
              <span style={{
                backgroundColor: activeTab === key ? "rgba(124,58,237,0.2)" : "rgba(42,42,50,0.6)",
                color: activeTab === key ? "#9D6FEF" : "#A7A7A3",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                padding: "2px 7px",
                borderRadius: 20,
                transition: "all 0.2s",
              }}>
                {badge}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {activeTab === "clientes"
            ? t.portfolio.clientProjects.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="purple" />)
            : activeTab === "academicos"
            ? t.portfolio.academicProjects.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="green" />)
            : t.portfolio.personalProjects.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="blue" />)
          }
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", ramo: "", tipo: "empresa" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | undefined>(undefined);
  const turnstileToken = useRef<string>("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      if (window.turnstile && turnstileRef.current && turnstileWidgetId.current === undefined) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          callback: (token) => {
            turnstileToken.current = token;
          },
          "expired-callback": () => {
            turnstileToken.current = "";
          },
        });
      } else if (!window.turnstile) {
        setTimeout(tryRender, 300);
      }
    };
    tryRender();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    if (TURNSTILE_SITE_KEY && !turnstileToken.current) {
      setErrorMsg(t.contact.errTurnstile);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: turnstileToken.current }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 400 && data?.fields) {
        setFieldErrors(data.fields);
        setErrorMsg(t.contact.errFields);
        return;
      }
      if (response.status === 403) {
        setErrorMsg(t.contact.errBot);
        return;
      }
      if (response.status === 429) {
        setErrorMsg(t.contact.errRate);
        return;
      }
      if (!response.ok) {
        setErrorMsg(t.contact.errServer);
        return;
      }

      setSent(true);
      setForm({ nome: "", whatsapp: "", email: "", ramo: "", tipo: "empresa" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(t.contact.errConn);
    } finally {
      setLoading(false);
      if (window.turnstile && turnstileWidgetId.current !== undefined) {
        window.turnstile.reset(turnstileWidgetId.current);
        turnstileToken.current = "";
      }
    }
  };

  const inputStyle = {
    width: "100%",
    backgroundColor: "#1C1C22",
    border: "1px solid rgba(42,42,50,0.9)",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#FFFFFF",
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <section id="contato" style={{ padding: "100px 0", backgroundColor: "#16161A", position: "relative" }}>
      <div className="section-divider" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 3, height: 28, backgroundColor: "#22C55E", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
              {t.contact.title}
            </h2>
          </div>
          <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 32 }}>
            {t.contact.subtitle}
          </p>

          <div className="flex flex-col gap-4">
            {t.contact.features.map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-4">
                <div style={{ width: 44, height: 44, backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, display: "flex", items: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem" }}>{title}</div>
                  <div style={{ color: "#A7A7A3", fontSize: "0.8rem" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 20, padding: "36px 32px", border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 8px 60px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.contact.labelName}
              </label>
              <input
                type="text"
                required
                placeholder={t.contact.placeName}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.contact.labelPhone}
              </label>
              <input
                type="tel"
                required
                placeholder={t.contact.placePhone}
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.contact.labelEmail}
              </label>
              <input
                type="email"
                required
                placeholder={t.contact.placeEmail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.contact.labelIndustry}
              </label>
              <input
                type="text"
                required
                placeholder={t.contact.placeIndustry}
                value={form.ramo}
                onChange={(e) => setForm({ ...form, ramo: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {t.contact.labelType}
              </label>
              <div className="flex gap-3">
                {t.contact.typeOptions.map(([val, label], i) => (
                  <button
                    key={`tipo-${i}-${val}`}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: val })}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: form.tipo === val ? "1px solid #7C3AED" : "1px solid rgba(42,42,50,0.9)",
                      backgroundColor: form.tipo === val ? "rgba(124,58,237,0.15)" : "#1C1C22",
                      color: form.tipo === val ? "#FFFFFF" : "#A7A7A3",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} />}

            {errorMsg && (
              <div style={{ color: "#F87171", fontSize: "0.85rem", fontFamily: "var(--font-body)" }}>
                {errorMsg}
              </div>
            )}
            {Object.keys(fieldErrors).length > 0 && (
              <ul style={{ color: "#F87171", fontSize: "0.8rem", margin: 0, paddingLeft: 18 }}>
                {Object.entries(fieldErrors).map(([field, msg]) => (
                  <li key={field}>{msg}</li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: sent ? "#16A34A" : "#22C55E",
                color: "#0B0B0E",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                padding: "15px",
                borderRadius: 12,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
                boxShadow: "0 0 24px rgba(34,197,94,0.35)",
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!sent && !loading) { e.currentTarget.style.boxShadow = "0 0 40px rgba(34,197,94,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? t.contact.btnSending : sent ? t.contact.btnSuccess : t.contact.btnSend}
            </button>
          </form>
        </div>
      </div>
      <div className="section-divider" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: "#0B0B0E", borderTop: "1px solid #16161A", padding: "40px 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#7C3AED", boxShadow: "0 0 10px #7C3AED" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem" }}>
            nicolasf<span style={{ color: "#7C3AED" }}>.</span>dev
          </span>
        </div>
        <div style={{ color: "#A7A7A3", fontSize: "0.8rem" }}>
          {t.footer.rights}
        </div>
        <div className="flex gap-4">
          {["LinkedIn", "GitHub", "Instagram"].map((link) => (
            <a key={link} href="#" style={{ color: "#A7A7A3", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7C3AED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A7A7A3")}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>("pt");

  const formatPrice = (brl: number) => {
    if (lang === "en") {
      const usd = Math.round(brl / 5);
      return `$ ${usd.toLocaleString("en-US")}`;
    }
    return `R$ ${brl.toLocaleString("pt-BR")}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], formatPrice }}>
      <div style={{ backgroundColor: "#0B0B0E", minHeight: "100%" }}>
        <Header />
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <PricingSection />
        <PortfolioSection />
        <ContactSection />
        <Footer />
      </div>
    </LanguageContext.Provider>
  );
}
