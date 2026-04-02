import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { ChevronDown, Menu, X, Sparkles } from "lucide-react";

const apiKey = "";

const luxuryEase = [0.16, 1, 0.3, 1] as const;

type FetchOptions = RequestInit;

type EngravingSuggestion = {
  language: string;
  phrase: string;
  meaning: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type Product = {
  number: string;
  name: string;
  type: string;
  material: string;
  description: string;
  imageSrc: string;
  imageHoverSrc?: string;
  bgColor?: string;
};

type ProductImageProps = {
  type: string;
  imageSrc: string;
  imageHoverSrc?: string;
  bgColor?: string;
};

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

type FAQItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
};

async function fetchWithRetry(
  url: string,
  options: FetchOptions,
  maxRetries = 5
): Promise<GeminiResponse> {
  let retries = 0;
  let delay = 1000;

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as GeminiResponse;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error("Max retries exceeded");
}

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500&display=swap');
    
    .font-verne-serif {
      font-family: 'Cormorant Garamond', serif;
    }
    .font-verne-sans {
      font-family: 'Montserrat', sans-serif;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    ::selection {
      background: #0d2e26;
      color: #EAF3E8;
    }

    /* Subtle Paper Texture */
    .bg-paper {
      position: relative;
    }
    .bg-paper::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.03;
      pointer-events: none;
      z-index: 1;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    /* 3D Flip Card Styles */
    .flip-card {
      perspective: 1500px;
    }
    .flip-card-inner {
      transform-style: preserve-3d;
      transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .group:hover .flip-card-inner,
    .group:focus-visible .flip-card-inner {
      transform: rotateY(180deg);
    }
    .flip-card-front, .flip-card-back {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      position: absolute;
      inset: 0;
    }
    .flip-card-back {
      transform: rotateY(180deg);
    }
  `}</style>
);

function HeroSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full object-cover"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d2e26" />
          <stop offset="50%" stopColor="#123a31" />
          <stop offset="100%" stopColor="#0d2e26" />
        </linearGradient>
        <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7f2e8" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#f7f2e8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f7f2e8" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#heroGradient)" />

      <g stroke="url(#goldGlow)" strokeWidth="0.03" fill="none" opacity="0.4">
        <motion.path
          d="M50 20 L80 50 L50 80 L20 50 Z"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: luxuryEase }}
        />
        <motion.path
          d="M50 20 L50 80"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, delay: 0.5, ease: luxuryEase }}
        />
        <motion.path
          d="M20 50 L80 50"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, delay: 0.8, ease: luxuryEase }}
        />
      </g>

      <motion.text
        x="50"
        y="44"
        className="font-verne-sans"
        fontSize="1.5"
        fill="#EAF3E8"
        textAnchor="middle"
        letterSpacing="0.5em"
        opacity="0.5"
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ duration: 2, delay: 1, ease: luxuryEase }}
      >
        FIRST ACCESS · SPRING 2026
      </motion.text>

      <motion.text
        x="50"
        y="55"
        className="font-verne-serif"
        fontSize="12"
        fill="#EAF3E8"
        textAnchor="middle"
        letterSpacing="0.25em"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, delay: 1.2, ease: luxuryEase }}
      >
        VERNE
      </motion.text>

      <motion.text
        x="50"
        y="63"
        className="font-verne-serif italic"
        fontSize="2.4"
        fill="#EAF3E8"
        textAnchor="middle"
        opacity="0.6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 1.8, ease: luxuryEase }}
      >
        Rarefied. Artisanal. Yours.
      </motion.text>
    </svg>
  );
}

function ImageLayer({ src, type, bgColor }: { src: string; type: string; bgColor?: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: bgColor || "#f7f2e8" }}>
      {!error ? (
        <img
          src={src}
          alt={`${type} Fine Jewelry`}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-4 md:inset-6 border border-[#0d2e26]/5 flex flex-col items-center justify-center text-[#0d2e26] bg-white/40 backdrop-blur-sm">
          <div className="w-px h-10 md:h-12 bg-[#0d2e26]/10 mb-4 md:mb-6" />
          <span className="font-verne-serif text-lg md:text-xl font-light tracking-[0.2em] opacity-80 text-center px-4">
            {type}
          </span>
          <span className="font-verne-sans mt-3 md:mt-5 text-[8px] tracking-[0.3em] uppercase opacity-40 text-center px-2 leading-relaxed">
            Awaiting Image:<br />{src.replace("/", "")}
          </span>
        </div>
      )}
    </div>
  );
}

function ProductImage({ type, imageSrc, imageHoverSrc, bgColor }: ProductImageProps) {
  const hasFlip = !!imageHoverSrc;

  if (!hasFlip) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden shadow-sm">
        <ImageLayer src={imageSrc} type={type} bgColor={bgColor} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] flip-card group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-1000">
      <div className="w-full h-full relative flip-card-inner">
        <div className="flip-card-front">
          <ImageLayer src={imageSrc} type={type} bgColor={bgColor} />
        </div>
        <div className="flip-card-back">
          <ImageLayer src={imageHoverSrc} type={type} bgColor={bgColor} />
        </div>
      </div>
    </div>
  );
}

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 1.2, delay, ease: luxuryEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: luxuryEase }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-[#EAF3E8]/80 backdrop-blur-xl shadow-sm py-4 border-b border-[#0d2e26]/5"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <motion.a
            href="#"
            className={`font-verne-serif text-xl md:text-2xl tracking-[0.45em] uppercase transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm ${
              isScrolled ? "text-[#0d2e26]" : "text-[#EAF3E8]"
            }`}
            whileHover={{ opacity: 0.6 }}
          >
            VERNE
          </motion.a>

          <div className="hidden md:flex items-center gap-12">
            {["Collection", "About", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`font-verne-sans text-[10px] tracking-[0.3em] uppercase transition-colors duration-300 relative group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm ${
                  isScrolled
                    ? "text-[#0d2e26]/60 hover:text-[#0d2e26]"
                    : "text-[#EAF3E8]/60 hover:text-[#EAF3E8]"
                }`}
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-current transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
            <a
              href="#reserve"
              className={`font-verne-sans text-[10px] tracking-[0.3em] uppercase px-10 py-3.5 transition-all duration-700 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                isScrolled
                  ? "border-[#0d2e26] text-[#0d2e26] hover:bg-[#0d2e26] hover:text-[#EAF3E8]"
                  : "border-[#EAF3E8]/40 text-[#EAF3E8] hover:bg-[#EAF3E8] hover:text-[#0d2e26]"
              }`}
            >
              Reserve
            </a>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className={`md:hidden p-2 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-sm ${
              isScrolled || isMobileMenuOpen ? "text-[#0d2e26]" : "text-[#EAF3E8]"
            }`}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[1.25]" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6 stroke-[1.25]" aria-hidden="true" />
            )}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            className="fixed inset-0 z-40 bg-[#EAF3E8] pt-24 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-10 pb-20">
              {["Collection", "About", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-verne-serif text-3xl tracking-[0.15em] text-[#0d2e26] hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/30 px-4 py-2 rounded-sm"
                >
                  {item}
                </a>
              ))}
              <a
                href="#reserve"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-10 font-verne-sans text-[11px] tracking-[0.4em] uppercase px-12 py-5 border border-[#0d2e26] text-[#0d2e26] hover:bg-[#0d2e26] hover:text-[#EAF3E8] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/30"
              >
                Reserve Your Piece
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 300]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className="relative h-screen overflow-hidden bg-[#0d2e26]">
      <motion.div className="absolute inset-0" style={{ y }}>
        <HeroSVG />
      </motion.div>

      <motion.div
        className="absolute bottom-16 left-0 right-0 flex justify-center z-10"
        style={{ opacity }}
      >
        <motion.button
          aria-label="Scroll to discover"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="cursor-pointer p-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAF3E8]/30 rounded-full"
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#EAF3E8]/30 to-transparent group-hover:via-[#EAF3E8]/60 transition-colors duration-500" />
        </motion.button>
      </motion.div>
    </section>
  );
}

function HookSection() {
  return (
    <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-6 md:px-12 bg-[#EAF3E8]">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <p className="font-verne-sans text-[10px] md:text-[12px] tracking-[0.4em] uppercase text-[#0d2e26]/50 mb-8 md:mb-12">
            Spring Collection First Access
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h1 className="font-verne-serif text-4xl md:text-6xl lg:text-7xl leading-[1.15] md:leading-[1.1] text-[#0d2e26] mb-10 md:mb-12">
            Three Pieces. <br className="hidden md:block" />
            <span className="italic font-light">Five of Each.</span>
            <br />
            This List First.
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="w-px h-16 md:h-20 bg-[#0d2e26]/10 mx-auto mb-10 md:mb-12" />
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="max-w-3xl mx-auto">
          <p className="font-verne-serif text-xl md:text-2xl font-light leading-[1.6] text-[#0d2e26]/80">
            You are receiving this before anyone else. Five First Access reservations per design, offered at a private Founder&apos;s rate.
          </p>
          <p className="font-verne-serif text-2xl md:text-3xl mt-8 text-[#0d2e26] italic font-light tracking-[0.02em]">
            Intentionally limited. Released only once.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function ExpectationSection() {
  const items = [
    "Crafted in 18K solid gold.",
    "Numbered editions. Certificate of Authenticity",
    "Complimentary Engraving & Atelier Credit",
    "8-Week in Creation • Late spring delivery",
  ];

  return (
    <section id="about" className="pt-12 md:pt-16 pb-24 md:pb-32 px-6 md:px-12 bg-[#EAF3E8]">
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedSection delay={0.1}>
          <p className="font-verne-sans text-[9px] tracking-[0.4em] uppercase text-[#0d2e26]/40 mb-10 md:mb-16">
            What to expect
          </p>
        </AnimatedSection>

        <div className="space-y-6 md:space-y-10">
          {items.map((item, index) => (
            <AnimatedSection key={index} delay={index * 0.15 + 0.2}>
              <p className="font-verne-serif text-xl md:text-2xl text-[#0d2e26] font-light tracking-[0.01em]">
                {item}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      number: "01 / 03",
      name: "Lys de Vie",
      type: "Earrings",
      material: "18K SOLID WHITE GOLD | NATURAL DIAMONDS",
      description:
        "These are not earrings you put on for a room. The room notices. The pear-cut diamonds cluster like something gathered, not placed. The petal drop moves when you move. A small, brilliant thing that earns its weight every time you wear it.",
      imageSrc: "/lys-de-vie.jpg",
      imageHoverSrc: "/lys-de-vie-2.jpg",
      bgColor: "#eaf3ee",
    },
    {
      number: "02 / 03",
      name: "Flairis Ring",
      type: "Signature Band",
      material: "18K SOLID YELLOW GOLD | NATURAL DIAMONDS",
      description:
        "A band that holds presence. Detailed enough to reward the person looking closely. The Flairis band sits on the hand like a quiet declaration. Warm gold, diamond-set signature motifs running its face, milgrain edges catching light at the edge of the eye.",
      imageSrc: "/flairis-ring.jpg",
      imageHoverSrc: "/flairis-ring-2.jpg",
      bgColor: "#f7f2e8",
    },
    {
      number: "03 / 03",
      name: "Flairis Pendant",
      type: "Band Necklace",
      material: "18K SOLID YELLOW GOLD | NATURAL DIAMONDS",
      description:
        "For those who want the presence of the band as a dedicated necklace. The pendant keeps the same signature motif, milgrain edge, and pavé diamonds, refined to sit lightly at the collarbone. A piece you reach for when you want the symbolism of a band, held closer to the heart.",
      imageSrc: "/flairis-pendant.jpg",
      imageHoverSrc: "/flairis-pendant-2.jpg",
      bgColor: "#f7f2e8",
    },
  ];

  useEffect(() => {
    document.body.style.overflow = selectedProduct ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProduct]);

  return (
    <section
      id="collection"
      className="py-24 md:py-32 px-6 md:px-12 bg-[#EAF3E8] border-t border-[#0d2e26]/5"
    >
      <div className="max-w-7xl mx-auto">
        {products.map((product, index) => (
          <div key={index} className="mb-24 md:mb-32 last:mb-0">
            <AnimatedSection>
              <div className="flex items-center gap-6 mb-12 md:mb-16">
                <span className="font-verne-sans text-[10px] tracking-[0.4em] text-[#0d2e26]/30 uppercase">
                  {product.number}
                </span>
                <div className="flex-1 h-px bg-[#0d2e26]/5" />
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-12 gap-10 md:gap-16 lg:gap-24 items-center">
              <div
                className={`md:col-span-5 lg:col-span-4 ${
                  index % 2 !== 0 ? "md:order-2" : ""
                }`}
              >
                <AnimatedSection delay={0.1}>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="w-full max-w-[280px] md:max-w-none mx-auto text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/30 focus-visible:ring-offset-4 focus-visible:ring-offset-[#EAF3E8] block"
                    aria-label={`Open details for ${product.name}`}
                  >
                    <ProductImage
                      type={product.name.toUpperCase()}
                      imageSrc={product.imageSrc}
                      imageHoverSrc={product.imageHoverSrc}
                      bgColor={product.bgColor}
                    />
                  </button>
                </AnimatedSection>
              </div>

              <div
                className={`md:col-span-7 lg:col-span-8 flex flex-col justify-center text-center md:text-left ${
                  index % 2 !== 0 ? "md:order-1 md:items-end md:text-right" : "items-center md:items-start"
                }`}
              >
                <AnimatedSection delay={0.2}>
                  <p className="font-verne-sans text-[10px] tracking-[0.4em] uppercase text-[#0d2e26]/40 mb-5">
                    {product.type}
                  </p>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                  <h2 className="font-verne-serif text-5xl md:text-6xl text-[#0d2e26] mb-6 leading-tight">
                    {product.name}
                  </h2>
                </AnimatedSection>

                <AnimatedSection delay={0.4}>
                  <p className="font-verne-sans text-[9px] tracking-[0.3em] text-[#0d2e26]/60 mb-8 border-b border-[#0d2e26]/10 pb-6 inline-block uppercase">
                    {product.material}
                  </p>
                </AnimatedSection>

                <AnimatedSection delay={0.5}>
                  <p className="font-verne-serif text-xl md:text-2xl font-light leading-relaxed text-[#0d2e26]/70 mb-10 max-w-2xl">
                    {product.description}
                  </p>
                </AnimatedSection>

                <AnimatedSection delay={0.6}>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="group relative inline-flex items-center justify-center px-10 py-4 border border-[#0d2e26] overflow-hidden transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#EAF3E8]"
                  >
                    <span className="absolute inset-0 bg-[#0d2e26] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />
                    <span className="relative font-verne-sans text-[10px] tracking-[0.3em] uppercase text-[#0d2e26] group-hover:text-[#EAF3E8] transition-colors duration-700">
                      Explore Details
                    </span>
                  </button>
                </AnimatedSection>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12 bg-[#0d2e26]/95 backdrop-blur-md"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              transition={{ duration: 0.8, ease: luxuryEase }}
              className="bg-[#FAFAF7] w-full max-w-7xl max-h-[95vh] overflow-y-auto flex flex-col md:flex-row relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedProduct.name} Details`}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                aria-label="Close product details"
                className="absolute top-6 right-6 md:top-8 md:right-8 p-3 text-[#0d2e26]/30 hover:text-[#0d2e26] z-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/30 rounded-full"
              >
                <X className="w-8 h-8 stroke-[1]" aria-hidden="true" />
              </button>

              <div className="md:w-5/12 p-8 pt-20 md:p-12 lg:p-24 flex items-center justify-center bg-white">
                <div className="w-full max-w-[280px] md:max-w-sm">
                  {/* Do not pass imageHoverSrc here so modal stays static */}
                  <ProductImage
                    type={selectedProduct.name.toUpperCase()}
                    imageSrc={selectedProduct.imageSrc}
                    bgColor={selectedProduct.bgColor}
                  />
                </div>
              </div>

              <div className="md:w-7/12 p-8 pb-16 md:p-12 lg:p-24 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#0d2e26]/5 text-center md:text-left items-center md:items-start">
                <span className="font-verne-sans text-[9px] tracking-[0.5em] uppercase text-[#0d2e26]/40 mb-6">
                  Collection {selectedProduct.number.split(" / ")[0]}
                </span>
                <h3 className="font-verne-serif text-4xl md:text-5xl lg:text-6xl text-[#0d2e26] mb-8 leading-tight">
                  {selectedProduct.name}
                </h3>
                <p className="font-verne-sans text-[10px] tracking-[0.3em] uppercase text-[#0d2e26]/60 mb-10 pb-10 border-b border-[#0d2e26]/10">
                  {selectedProduct.material}
                </p>
                <p className="font-verne-serif text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-[#0d2e26]/80 mb-12 md:mb-16">
                  {selectedProduct.description}
                </p>

                <div className="mt-auto pt-6 md:pt-8 w-full md:w-auto">
                  <button className="w-full py-5 lg:py-6 px-12 bg-[#0d2e26] hover:bg-[#15463a] text-[#EAF3E8] font-verne-sans text-[11px] tracking-[0.4em] uppercase transition-all duration-700 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF7]">
                    Request Reservation
                  </button>
                  <p className="text-center font-verne-serif italic text-sm text-[#0d2e26]/40 mt-6 md:mt-8 tracking-[0.05em]">
                    Subject to edition availability
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    "A private rate, reserved exclusively for this list.",
    "Complimentary engraving of your name, date, or word.",
    "Individually certified number and signed certificate.",
    "A personal letter from the Founder.",
    "Complimentary signature Verne gift wrapping.",
    "$200 Atelier Credit toward a future Verne piece.",
  ];

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#EAF3E8]">
      <AnimatedSection>
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#f7f2e8] border border-[#0d2e26]/5 p-8 md:p-12 lg:p-24 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0d2e26]/10 to-transparent" />

            <p className="font-verne-sans text-[10px] tracking-[0.5em] uppercase text-[#0d2e26]/30 mb-12 lg:mb-16 text-center">
              The Founder&apos;s Privileges
            </p>

            <div className="grid lg:grid-cols-2 gap-y-10 md:gap-y-12 lg:gap-x-16">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1,
                    delay: index * 0.15,
                    ease: luxuryEase,
                  }}
                  viewport={{ once: true }}
                  className="flex items-start gap-6 lg:gap-8"
                >
                  <div className="w-1.5 h-1.5 bg-[#0d2e26]/20 mt-2.5 flex-shrink-0 rotate-45" aria-hidden="true" />
                  <p className="font-verne-serif text-xl lg:text-2xl font-light leading-[1.5] text-[#0d2e26]/90">
                    {benefit}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#0d2e26]/10 to-transparent" />
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}

function EngravingAtelierSection() {
  const [sentiment, setSentiment] = useState("");
  const [engravings, setEngravings] = useState<EngravingSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!sentiment.trim()) return;

    setIsGenerating(true);
    setError("");
    setEngravings([]);

    const systemPrompt = `You are the master engraver for Verne, an exclusive, luxury fine jewelry house.
    The user will provide a sentiment, memory, or feeling they want captured on their bespoke piece.
    Suggest 3 elegant, minimalist engravings (absolute maximum of 3 words each) that perfectly encapsulate their sentiment.
    Provide one suggestion in Latin, one in French, and one in English. 
    Return the response as structured JSON.`;

    const schema = {
      type: "OBJECT",
      properties: {
        suggestions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              language: { type: "STRING" },
              phrase: { type: "STRING" },
              meaning: { type: "STRING" },
            },
          },
        },
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const data = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Sentiment: ${sentiment}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      });

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Invalid response");
      }

      const parsed = JSON.parse(rawText) as {
        suggestions?: EngravingSuggestion[];
      };

      setEngravings(parsed.suggestions ?? []);
    } catch {
      setError(
        "Our artisan engraver is momentarily stepping away. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#EAF3E8] border-t border-[#0d2e26]/5">
      <AnimatedSection>
        <div className="max-w-4xl mx-auto border border-[#0d2e26]/10 p-8 md:p-12 lg:p-20 relative bg-white/30 shadow-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EAF3E8] px-6 md:px-8">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#0d2e26]/20" strokeWidth={1} aria-hidden="true" />
          </div>

          <div className="text-center mb-10 md:mb-12">
            <p className="font-verne-sans text-[10px] tracking-[0.4em] uppercase text-[#0d2e26]/40 mb-5 md:mb-6">
              The Artisan&apos;s Atelier
            </p>
            <h3 className="font-verne-serif text-3xl md:text-5xl text-[#0d2e26] mb-5 md:mb-6 leading-tight">
              Discover Your Engraving
            </h3>
            <p className="font-verne-serif text-lg md:text-xl font-light text-[#0d2e26]/70 max-w-xl mx-auto leading-relaxed">
              Share the sentiment you wish to hold close, and our master engraver
              will suggest the perfect words for your piece.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center justify-center mb-10 md:mb-12">
            <div className="w-full md:w-2/3 relative">
              <label htmlFor="sentiment-input" className="sr-only">Enter your sentiment, memory, or feeling</label>
              <input
                id="sentiment-input"
                type="text"
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
                placeholder="e.g., A reminder of my own resilience..."
                className="w-full bg-transparent border-b border-[#0d2e26]/20 text-[#0d2e26] px-2 py-4 md:py-5 focus:outline-none focus:border-[#0d2e26] placeholder-[#0d2e26]/30 font-verne-serif text-xl md:text-2xl italic transition-all duration-500"
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sentiment.trim()}
              className="w-full md:w-auto shrink-0 px-10 md:px-12 py-4 md:py-5 bg-[#0d2e26] text-[#EAF3E8] font-verne-sans text-[10px] tracking-[0.3em] uppercase hover:bg-[#15463a] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EAF3E8]"
            >
              {isGenerating ? "Consulting..." : "Inspire Me"}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center font-verne-serif text-sm text-red-900/50 font-light mb-6"
                role="alert"
              >
                {error}
              </motion.p>
            )}

            {engravings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: luxuryEase }}
                className="grid gap-6 md:gap-8 mt-10 md:mt-12"
                aria-live="polite"
              >
                {engravings.map((eng, idx) => (
                  <div
                    key={idx}
                    className="bg-[#f7f2e8]/40 p-8 md:p-12 border border-[#0d2e26]/5 text-center shadow-sm"
                  >
                    <p className="font-verne-sans text-[9px] tracking-[0.4em] uppercase text-[#0d2e26]/30 mb-4 md:mb-5">
                      {eng.language}
                    </p>
                    <p className="font-verne-serif text-3xl md:text-4xl text-[#0d2e26] mb-4 md:mb-5 leading-tight">
                      &quot;{eng.phrase}&quot;
                    </p>
                    <p className="font-verne-serif text-base md:text-xl font-light text-[#0d2e26]/60 italic">
                      {eng.meaning}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedSection>
    </section>
  );
}

function CTASection() {
  return (
    <section id="reserve" className="py-24 md:py-36 px-6 md:px-12 bg-[#EAF3E8]">
      <div className="max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <div className="w-px h-16 md:h-20 bg-[#0d2e26]/10 mx-auto mb-12 md:mb-16" />
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="font-verne-serif text-4xl md:text-5xl lg:text-6xl text-[#0d2e26] mb-6 md:mb-8 leading-tight">
            Secure Your Place
          </h2>
          <p className="font-verne-serif text-xl md:text-2xl italic font-light leading-relaxed text-[#0d2e26]/70 mb-12 md:mb-16">
            Five pieces per design.
            <br />
            Once claimed, this form of the piece will not return.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <a
            href="#reserve-form"
            className="group relative inline-flex items-center justify-center px-14 md:px-20 py-5 md:py-6 border border-[#0d2e26] overflow-hidden transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#EAF3E8]"
          >
            <span className="absolute inset-0 bg-[#0d2e26] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1]" />
            <span className="relative font-verne-sans text-[11px] tracking-[0.4em] uppercase text-[#0d2e26] group-hover:text-[#EAF3E8] transition-colors duration-700">
              Reserve Your Piece
            </span>
          </a>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="mt-8 md:mt-10 font-verne-serif text-sm md:text-base italic font-light text-[#0d2e26]/40 tracking-wide">
            One click. We confirm your place and share First Access pricing
            privately.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-[#0d2e26]/5 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full py-6 md:py-10 flex items-center justify-between gap-6 md:gap-8 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2e26]/20 rounded-sm"
      >
        <h3 className="font-verne-serif text-xl md:text-2xl lg:text-3xl text-[#0d2e26]/90 group-hover:text-[#0d2e26] transition-colors font-light leading-tight">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.6, ease: luxuryEase }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-[#0d2e26]/30 stroke-[1]" aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            className="overflow-hidden"
          >
            <p className="pb-6 md:pb-10 font-verne-serif text-lg md:text-xl font-light leading-relaxed text-[#0d2e26]/70 pr-8 md:pr-24">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "When will my piece arrive?",
      answer:
        "Each piece is crafted to order. You can expect delivery in late spring, approximately 8 weeks from the close of First Access.",
    },
    {
      question: "How does pre-order pricing work?",
      answer:
        "After you register your interest, we share First Access pricing privately. Payment is confirmed before production begins. No charge until you approve.",
    },
    {
      question: "Can I personalize my piece?",
      answer:
        "Yes. Complimentary engraving is included for all First Access clients. You choose the word, date, or name. We take care of the rest.",
    },
    {
      question: "What if only five are available?",
      answer:
        "Five pieces per design is the edition limit. Once claimed, this form of the piece does not return. If you are on the fence, write to us.",
    },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 px-6 md:px-12 bg-[#EAF3E8] border-t border-[#0d2e26]/5">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <p className="font-verne-sans text-[10px] tracking-[0.4em] uppercase text-[#0d2e26]/30 text-center mb-12 md:mb-16">
            A few things worth knowing
          </p>
        </AnimatedSection>

        <div className="divide-y divide-[#0d2e26]/5 border-t border-b border-[#0d2e26]/5">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0d2e26] pt-24 pb-12 px-6 md:px-12 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <p className="font-verne-serif text-3xl md:text-5xl tracking-[0.5em] uppercase text-[#f7f2e8]">
            VERNE
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 md:mb-20">
          {["Collection", "Our Story", "Instagram", "Client Services"].map(
            (item, index) => (
              <a
                key={index}
                href="#"
                className="font-verne-sans text-[9px] tracking-[0.3em] uppercase text-[#f7f2e8]/40 hover:text-[#f7f2e8] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f7f2e8]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm"
              >
                {item}
              </a>
            )
          )}
        </div>

        <div className="text-center space-y-6 border-t border-[#f7f2e8]/5 pt-10 md:pt-12">
          <p className="font-verne-serif text-sm md:text-base font-light text-[#f7f2e8]/30 tracking-[0.02em] leading-relaxed">
            Verne Group LLC · Raleigh, North Carolina 27609, United States
            <br />
            client.relations@vernejewels.com
          </p>
          <div className="flex justify-center gap-8 mt-8 md:mt-10">
            <a
              href="#"
              className="font-verne-sans text-[9px] tracking-[0.4em] text-[#f7f2e8]/20 hover:text-[#f7f2e8]/50 uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f7f2e8]/30 rounded-sm"
            >
              Privacy
            </a>
            <a
              href="#"
              className="font-verne-sans text-[9px] tracking-[0.4em] text-[#f7f2e8]/20 hover:text-[#f7f2e8]/50 uppercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f7f2e8]/30 rounded-sm"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-[#EAF3E8] bg-paper overflow-x-hidden selection:bg-[#0d2e26] selection:text-[#EAF3E8]">
      <FontStyles />
      <Navigation />
      <HeroSection />
      <HookSection />
      <ExpectationSection />
      <ProductSection />
      <BenefitsSection />
      <EngravingAtelierSection />
      <CTASection />
      <FAQSection />

      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#EAF3E8] text-center border-t border-[#0d2e26]/5">
        <p className="font-verne-serif text-2xl md:text-4xl italic font-light text-[#0d2e26]/80 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
          Choose your talisman for the season ahead.
        </p>
        <div className="w-1.5 h-1.5 bg-[#0d2e26]/10 rotate-45 mx-auto" aria-hidden="true" />
      </section>

      <Footer />
    </main>
  );
}
