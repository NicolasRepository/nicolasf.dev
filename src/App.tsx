import { useEffect, useRef, useState } from "react";

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

const NAV_LINKS = ["Início", "Sobre", "Serviços", "Preços", "Portfólio", "Contato"];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const sectionMap: Record<string, string> = {
    "Início": "inicio",
    "Sobre": "sobre",
    "Serviços": "servicos",
    "Preços": "precos",
    "Portfólio": "portfolio",
    "Contato": "contato",
  };

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
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(sectionMap[link])}
              style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "#A7A7A3", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A7A7A3")}
            >
              {link}
            </button>
          ))}
        </nav>

        <button
          className="hidden md:block"
          onClick={() => scrollTo("contato")}
          style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.875rem", padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 16px rgba(34,197,94,0.35)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#16A34A"; e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#22C55E"; e.currentTarget.style.boxShadow = "0 0 16px rgba(34,197,94,0.35)"; }}
        >
          Solicitar Orçamento
        </button>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#FFFFFF" }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{ backgroundColor: "#16161A", borderTop: "1px solid #2A2A32" }} className="md:hidden px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button key={link} onClick={() => scrollTo(sectionMap[link])} style={{ fontFamily: "var(--font-body)", color: "#A7A7A3", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.95rem" }}>
              {link}
            </button>
          ))}
          <button onClick={() => scrollTo("contato")} style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}>
            Solicitar Orçamento
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
  return (
    <section id="inicio" style={{ paddingTop: 120, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
      <div className="hero-glow" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-3 mb-6">
            <Badge color="green">⚡ Disponível para projetos</Badge>
            <Badge color="purple">Full Stack Dev</Badge>
          </div>

          <h1 style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 4.5vw, 3.25rem)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
            Sites{" "}
            <span className="gradient-text">Modernos</span>{" "}
            e de<br />
            <span className="gradient-text">Alta Performance</span><br />
            que Transformam{" "}
            <span className="gradient-text">Visitantes</span>{" "}
            em{" "}
            <span className="gradient-text">Clientes</span>
            
          </h1>

          <p style={{ color: "#A7A7A3", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            Desenvolvimento sob medida com arquitetura moderna para empresas e agências que precisam de resultados reais — não só de um site bonito.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              style={{ backgroundColor: "#22C55E", color: "#0B0B0E", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", padding: "14px 28px", borderRadius: 10, border: "none", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 24px rgba(34,197,94,0.4)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(34,197,94,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(34,197,94,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
              onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
            >
              Criar Meu Site
            </button>
            <button
              style={{ backgroundColor: "transparent", color: "#FFFFFF", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1rem", padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"; e.currentTarget.style.backgroundColor = "rgba(124,58,237,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.backgroundColor = "transparent"; }}
              onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Projetos →
            </button>
          </div>

          <div className="flex flex-wrap gap-6 mt-10">
            {[["Entrega", "em 5 dias úteis"], ["Suporte", "dentro de 3 dias"], ["Atendimento", "personalizado por cliente"]].map(([num, label]) => (
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
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#22C55E" }}>⚡ Velocidade</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "#FFFFFF" }}>Entrega rápida</div>
            </div>

            <div style={{ position: "absolute", bottom: -16, left: -20, backgroundColor: "#1C1C22", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF" }}>💜 Satisfação</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", color: "#FFFFFF" }}>98%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="sobre" style={{ padding: "100px 0", backgroundColor: "#16161A", position: "relative" }}>
      <div className="section-divider" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            Quem Sou Eu
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
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 4 }}>// stack principal</div>
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
              Desenvolvimento que gera resultado, não só código.
            </h3>
            <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 16 }}>
              Sou desenvolvedor Full Stack com formação técnica em Informática pelo <span style={{ color: "#FFFFFF" }}>Colégio Opção</span> e graduação em Ciência e Tecnologia (BCT) pela <span style={{ color: "#FFFFFF" }}>UNIFESP São José dos Campos</span>.
            </p>
            <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 24 }}>
              Meu foco vai além de entregar um site — entrego uma máquina de conversão. Cada projeto é construído com arquitetura sólida, performance extrema e design orientado a resultados mensuráveis para empresas e agências.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "🎓", title: "COLÉGIO OPÇÃO", sub: "Técnico em Informática" },
                { icon: "🏛️", title: "UNIFESP SJC", sub: "Bacharelado Interdisciplinar em Ciência e Tecnologia" },
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

  // Para Agências / Parceiros (Subcontratação / White-label)
const empresasFeatures = [
  { 
    icon: "🤝", 
    title: "Parceria White-Label", 
    desc: "Desenvolvimento invisível: você vende para o seu cliente e eu entrego o código com a sua marca." 
  },
  { 
    icon: "🚀", 
    title: "Demanda Sob Medida", 
    desc: "Absorvo o excesso de projetos da sua equipe sem necessidade de contratar um dev fixo." 
  },
  { 
    icon: "📋", 
    title: "Do Layout ao Código", 
    desc: "Recebo o briefing ou design no Figma e entrego a aplicação pronta e testada para publicação." 
  },
  { 
    icon: "🔌", 
    title: "Integração de APIs e CRMs", 
    desc: "Conexão de formulários e sistemas com ferramentas externas como Webhooks, CRMs e e-mail marketing." 
  },
  { 
    icon: "📞", 
    title: "Comunicação Direta", 
    desc: "Acompanhamento do progresso diretamente com o desenvolvedor, sem intermediários ou burocracia." 
  },
  { 
    icon: "💼", 
    title: "Contrato de NDA e Sigilo", 
    desc: "Acordo de confidencialidade assinado para proteger as informações da sua agência e do cliente." 
  },
];

// Para Empresas / Clientes Diretos (Projetos Finais)
const agenciasFeatures = [
  { 
    icon: "🎯", 
    title: "Landing Pages Objetivas", 
    desc: "Estrutura focada em apresentar seu produto de forma clara e facilitar a conversão de novos leads." 
  },
  { 
    icon: "📱", 
    title: "Direcionamento para WhatsApp", 
    desc: "Botões e formulários configurados para enviar a mensagem do cliente direto para o seu WhatsApp." 
  },
  { 
    icon: "📊", 
    title: "Instalação de Tags e Pixels", 
    desc: "Configuração do Google Analytics e Meta Pixel para você acompanhar o tráfego e o resultado dos anúncios." 
  },
  { 
    icon: "⚡", 
    title: "Código Otimizado e Leve", 
    desc: "Páginas construídas com foco em carregamento rápido e boa performance em celulares e computadores." 
  },
  { 
    icon: "🎨", 
    title: "Aprovação Visual (Figma)", 
    desc: "Você visualiza e aprova a estrutura de design do site antes de qualquer linha de código ser escrita." 
  },
  { 
    icon: "🗄️", 
    title: "Organização de Contatos", 
    desc: "Dados preenchidos pelos clientes são salvos com segurança e disponibilizados no e-mail ou Google Sheets." 
  },
];

  const features = activeTab === "empresas" ? empresasFeatures : agenciasFeatures;

  return (
    <section id="servicos" style={{ padding: "100px 0" }}>
      <div style={{ position: "absolute", marginTop: -80 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            Serviços
          </h2>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 40, maxWidth: 480, lineHeight: 1.7 }}>
          Soluções distintas para quem quer vender mais e para quem precisa escalar a operação.
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
              {tab === "empresas" ? "🏢 Para Empresas" : "🏭 Para Agências"}
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
  const modules = [
    { name: "Notificação WhatsApp / E-mail", price: "+R$ 500", icon: "💬" },
    { name: "Entrega Express em 72h", price: "+R$ 500", icon: "⚡" },
    { name: "Rastreamento Meta / Google Ads", price: "+R$ 250", icon: "📊" },
    { name: "Páginas Extras", price: "+R$ 250 / cada", icon: "📄" },
  ];

  return (
    <section id="precos" style={{ padding: "100px 0", backgroundColor: "#16161A", position: "relative" }}>
      <div className="section-divider" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 3, height: 28, backgroundColor: "#22C55E", borderRadius: 2 }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
            Tabela de Valores
          </h2>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 48, lineHeight: 1.7 }}>
          Estrutura modular — você paga só pelo que realmente precisa.
        </p>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div style={{ gridColumn: "span 2" }}>
            <div className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 4px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(34,197,94,0.08) 100%)", padding: "28px 28px 24px", borderBottom: "1px solid rgba(42,42,50,0.8)" }}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <Badge color="purple">Projeto Base</Badge>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.6rem", letterSpacing: "-0.03em", marginTop: 8, color: "#FFFFFF" }}>
                      R$ 1.000
                    </div>
                    <div style={{ color: "#A7A7A3", fontSize: "0.875rem", marginTop: 4 }}>Pagamento único — sem mensalidade escondida</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: "24px 28px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 16, letterSpacing: "0.06em" }}>// INCLUSO NO PROJETO BASE</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Interface web moderna e 100% responsiva",
                    "Design visual e prototipagem",
                    "Integração com banco de dados",
                    "Conexão com Google Planilhas",
                    "Formulários dinâmicos e coleta de dados",
                    "Hospedagem e publicação em nuvem",
                    "Configuração de domínio próprio",
                    "Otimização de velocidade",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span style={{ color: "#22C55E", flexShrink: 0, marginTop: 2 }}>✓</span>
                      <span style={{ color: "#A7A7A3", fontSize: "0.875rem" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#9D6FEF", marginBottom: 12, letterSpacing: "0.06em" }}>// MÓDULOS ADICIONAIS</div>
              <div className="grid sm:grid-cols-2 gap-4">
                {modules.map(({ name, price, icon }) => (
                  <div key={name} style={{ backgroundColor: "#1C1C22", border: "1px solid rgba(42,42,50,0.8)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "all 0.2s", cursor: "default" }}
                    className="glow-card"
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                      <span style={{ fontSize: "0.875rem", color: "#A7A7A3", fontFamily: "var(--font-body)" }}>{name}</span>
                    </div>
                    <span style={{ color: "#22C55E", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "0.85rem", whiteSpace: "nowrap" }}>{price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="glow-card" style={{ backgroundColor: "#1C1C22", borderRadius: 16, border: "1px solid rgba(34,197,94,0.25)", overflow: "hidden", boxShadow: "0 0 0 1px rgba(34,197,94,0.1), 0 4px 30px rgba(0,0,0,0.5)" }}>
              <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(11,11,14,0) 100%)", padding: "24px 24px 20px", borderBottom: "1px solid rgba(42,42,50,0.8)" }}>
                <Badge color="green">Assistência Técnica</Badge>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.8rem", marginTop: 10, letterSpacing: "-0.02em" }}>Pós-entrega</div>
                <div style={{ color: "#A7A7A3", fontSize: "0.8rem", marginTop: 4 }}>Suporte contínuo sem surpresas</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div className="flex flex-col gap-4">
                  <div style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "#22C55E" }}>R$ 100<span style={{ fontSize: "0.9rem", color: "#A7A7A3", fontWeight: 400 }}>/mês</span></div>
                    <div style={{ color: "#A7A7A3", fontSize: "0.8rem", marginTop: 4 }}>Plano mensal — cancele quando quiser</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "#9D6FEF" }}>R$ 500<span style={{ fontSize: "0.9rem", color: "#A7A7A3", fontWeight: 400 }}>/semestral</span></div>
                    <div style={{ color: "#22C55E", fontSize: "0.8rem", marginTop: 4 }}>💚 Economia de R$ 100</div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  {["Ajustes de conteúdo", "Correção de Bugs", "Suporte por WhatsApp"].map((item) => (
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

const CLIENT_PROJECTS = [
  { title: "Agência Guia: Captação de Lead", tag: "Marketing", img: "/images/agenciaGuia.png", desc: "Landing page de alta conversão com formulário inteligente, validação de dados e automação de atendimento via WhatsApp."},
];

const PERSONAL_PROJECTS = [
  { title: "Cruzado: Advinhar Palavras Cruzadas", tag: "Lazer", img: "/images/cruzado.png", desc: "Duas ou mais palavras são sorteadas e cruzadas e o jogador deve advinhar, inspirado em Termo.", link: "https://nicolasfaria-unifesp.github.io/cruzado/"},
  { title: "Jogos de Alfabetização", tag: "Educação", img: "/images/jogoAlfabetizacao.png", desc: "Crianças brincam com músicas que conhecem, auxiliando na alfabetização.", link:"https://nicolasfaria-unifesp.github.io/jogos-alfabetizacao/"},
];
const ACADEMIC_PROJECTS = [
  { title: "Athen: Plataforma de Estudos Gameficada", tag: "Educação", img: "/images/athen.png", desc: "Plataforma de cursos criados pela comunidade, para a comunidade, inspirado em Duolingo e Kahoot." },
  { title: "Números Primos: Onde a matemática encontra a criptografia.", tag: "Educação", img: "/images/numpri.png", desc: "Plataforma de conteúdos sobre números primos e criptografias, com informações e jogos.", link: "https://l.instagram.com/?u=https%3A%2F%2Fnumeros-primos-theta.vercel.app%2F%3Futm_source%3Dig%26utm_medium%3Dsocial%26utm_content%3Dlink_in_bio%26fbclid%3DPAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAacelE5nuHyejfND43oB5D27fRzIiGby6FhcWTVnVsZtOYIJ8tZV117tUqQ2BQ_aem_al2_0kYO1qrj-f_ZMHEznA&e=AUDLVx_1ux-ZLi_0VH20jps_95yFJH3VTmtA39NVUYpuFX-bxhuQNCA4k78qAMQzvbXvxG3W0UT-onkSW-Kj6VAAkBiELE1mP-7rzmj9LLCii1IPlEkaRk65NsVQDqEAFBdGAdo"},
];

function PortfolioCard({ title, tag, img, desc, link, badgeColor }: { title: string; tag: string; img: string; desc: string; link?: string; badgeColor: "purple" | "green" | "blue" }) {
  const isLocalImage = img.startsWith("/");
  const imageSrc = isLocalImage 
    ? img 
    : `https://images.unsplash.com/${img}?w=800&h=400&fit=crop&auto=format`;

  const textColor = badgeColor === "purple" ? "#7C3AED" : (badgeColor === "blue" ? "#3B82F6" : "#22C55E");
  const bottomText = !link ? "Link indisponível" : badgeColor === "purple" ? "Visitar Projeto →" : "Ver no GitHub →";

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

  return (
    <section id="portfolio" style={{ padding: "100px 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 3, height: 28, backgroundColor: "#7C3AED", borderRadius: 2 }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.02em" }}>
              Portfólio
            </h2>
          </div>
        </div>
        <p style={{ color: "#A7A7A3", marginBottom: 32, lineHeight: 1.7, maxWidth: 520 }}>
          Projetos reais com resultados mensuráveis — de clientes contratantes a experimentos próprios.
        </p>

        <div className="flex gap-2 mb-10" style={{ borderBottom: "1px solid #2A2A32", overflowX: "auto" }}>
          {([
            { key: "clientes", label: "🤝 Trabalhos para Clientes", badge: `${CLIENT_PROJECTS.length} projetos` },
            { key: "pessoais", label: "🛠️ Projetos Individuais", badge: `${PERSONAL_PROJECTS.length} projetos` },
            { key: "academicos", label: "🎓 Projetos Acadêmicos", badge: `${ACADEMIC_PROJECTS.length} projetos` },
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
            ? CLIENT_PROJECTS.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="purple" />)
            : activeTab === "academicos"
            ? ACADEMIC_PROJECTS.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="green" />)
            : PERSONAL_PROJECTS.map((p) => <PortfolioCard key={p.title} {...p} badgeColor="blue" />)
          }
        </div>

        {activeTab === "pessoais" && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#A7A7A3", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", border: "1px solid rgba(42,42,50,0.9)", borderRadius: 10, padding: "12px 22px", transition: "all 0.2s", backgroundColor: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)"; e.currentTarget.style.color = "#22C55E"; e.currentTarget.style.backgroundColor = "rgba(34,197,94,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(42,42,50,0.9)"; e.currentTarget.style.color = "#A7A7A3"; e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <a
                href="https://github.com/nicolasfaria-unifesp"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Ver todos os projetos no GitHub
              </a>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ nome: "", whatsapp: "", email: "", ramo: "", tipo: "empresa" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | undefined>(undefined);
  const turnstileToken = useRef<string>("");

  // Renderiza o widget do Cloudflare Turnstile assim que o script (carregado no index.html) estiver pronto.
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
      setErrorMsg("Aguarde a verificação de segurança carregar e tente novamente.");
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
        setErrorMsg("Verifique os campos destacados abaixo.");
        return;
      }
      if (response.status === 403) {
        setErrorMsg("Não foi possível confirmar que você não é um robô. Recarregue a página e tente novamente.");
        return;
      }
      if (response.status === 429) {
        setErrorMsg("Você atingiu o limite de envios. Aguarde alguns minutos e tente novamente.");
        return;
      }
      if (!response.ok) {
        setErrorMsg("Não foi possível enviar seus dados agora. Tente novamente em instantes.");
        return;
      }

      // Sucesso: lead já foi salvo no banco / disparado para as integrações no backend.
      setSent(true);
      setForm({ nome: "", whatsapp: "", email: "", ramo: "", tipo: "empresa" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
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
              Vamos Conversar?
            </h2>
          </div>
          <p style={{ color: "#A7A7A3", lineHeight: 1.8, marginBottom: 32 }}>
            Preencha o formulário e em poucos segundos entrarei em contato com você para conversarmos sobre o seu projeto.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { icon: "⚡", title: "Resposta em até 24h", sub: "Durante o horário comercial" },
              { icon: "💬", title: "Contato direto", sub: "Sem formulários intermináveis" },
              { icon: "🎯", title: "Orçamento personalizado", sub: "Baseado na sua necessidade real" },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="flex items-center gap-4">
                <div style={{ width: 44, height: 44, backgroundColor: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
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
                Nome completo
              </label>
              <input
                type="text"
                required
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                WhatsApp
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 99999-9999"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email
              </label>
              <input
                type="email"
                required
                placeholder="nome@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            
            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Ramo da Empresa
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Clínica médica, e-commerce, consultoria..."
                value={form.ramo}
                onChange={(e) => setForm({ ...form, ramo: e.target.value })}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#7C3AED"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(42,42,50,0.9)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 600, color: "#A7A7A3", display: "block", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Tipo de cliente
              </label>
              <div className="flex gap-3">
                {[["empresa", "🏢 Empresa"], ["agencia", "🏭 Agência"], ["outros", "🧩 Outros"]].map(([val, label], i) => (
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
              {loading ? "Enviando..." : sent ? "✓ Enviado com sucesso!" : "Enviar Mensagem 💬"}
            </button>
          </form>
        </div>
      </div>
      <div className="section-divider" style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
    </section>
  );
}

function Footer() {
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
          © 2026 — Nicolas Almeida Faria. Todos os direitos reservados.
        </div>
        <div className="flex gap-4">
          {["LinkedIn", "GitHub", "Instragram"].map((link) => (
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
  return (
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
  );
}
