import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Clock, Star, Sparkles, Scissors, ShoppingBag, ArrowRight, Instagram, Truck, RefreshCcw, Globe2 } from "lucide-react";
import heroModel from "@/assets/hero-model.jpg";
import aboutStore from "@/assets/about-store.jpg";
import serviceCurated from "@/assets/service-curated.jpg";
import serviceStyling from "@/assets/service-styling.jpg";
import serviceDelivery from "@/assets/service-delivery.jpg";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { seedDatabaseIfNeeded } from "@/lib/db-seeding";
import { BookingModal } from "@/components/booking-modal";
import { OrderModal } from "@/components/order-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Miss Hastag — Premium Women's Boutique in Patan, Lalitpur" },
      { name: "description", content: "Discover hand-curated modern womenswear at Miss Hastag, a premium clothing boutique in Patan, Lalitpur. Visit our store or call to book a styling appointment." },
      { property: "og:title", content: "Miss Hastag — Premium Women's Boutique in Patan" },
      { property: "og:description", content: "Hand-curated modern womenswear in Patan, Lalitpur. Visit our boutique or book a styling appointment." },
    ],
  }),
  component: Index,
});

function Index() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    // Seed initial reviews and products if database is empty
    seedDatabaseIfNeeded();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      <Nav onOpenBooking={() => setIsBookingOpen(true)} />
      <Hero onOpenBooking={() => setIsBookingOpen(true)} />
      <Marquee />
      <Services />
      <NewArrivals 
        onOpenOrder={(product: any) => {
          setSelectedProduct(product);
          setIsOrderOpen(true);
        }}
      />
      <Labels />
      <Policies />
      <About />
      <Testimonials />
      <CTA onOpenBooking={() => setIsBookingOpen(true)} />
      <Footer />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <OrderModal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} product={selectedProduct} />
    </div>
  );
}

function Nav({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a href="#top" className="font-serif text-xl tracking-tight">
          Miss <span className="italic text-[color:var(--brand-clay)]">Hastag</span>
        </a>
        <nav className="hidden md:flex items-center gap-9 text-sm text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition">Services</a>
          <a href="#about" className="hover:text-foreground transition">About</a>
          <a href="#testimonials" className="hover:text-foreground transition">Reviews</a>
          <a href="#visit" className="hover:text-foreground transition">Visit</a>
        </nav>
        <button
          onClick={onOpenBooking}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition cursor-pointer"
        >
          Book styling
        </button>
      </div>
    </header>
  );
}

function Hero({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/70 border border-border px-3 py-1 text-xs tracking-wide uppercase text-muted-foreground">
            <Sparkles className="w-3 h-3" /> Boutique · Patan, Lalitpur
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Quietly modern <em className="italic text-[color:var(--brand-clay)]">wardrobes</em>, made for everyday women.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Miss Hastag is a hand-curated women's clothing boutique in the heart of Patan — pieces you'll reach for again and again, fitted to feel made for you.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:opacity-90 transition shadow-[var(--shadow-soft)] cursor-pointer"
            >
              Book styling session <Sparkles className="w-4 h-4" />
            </button>
            <a href="#visit" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-6 py-3.5 text-sm font-medium hover:bg-background transition">
              Visit the boutique
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[color:var(--brand-clay)] text-[color:var(--brand-clay)]" />
              ))}
              <span className="ml-2 text-foreground font-medium">Loved on Google</span>
            </div>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Open today until 7 PM</span>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[var(--shadow-soft)]">
            <img src={heroModel} alt="Woman wearing a soft pink peplum top from Miss Hastag boutique" width={1080} height={1350} className="w-full h-full object-cover object-top" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border max-w-[220px] hidden sm:block">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">This season</div>
            <div className="font-serif text-lg mt-1">New arrivals, weekly</div>
          </div>
          <div className="absolute -top-4 -right-4 bg-[color:var(--brand-clay)] text-primary-foreground rounded-full w-28 h-28 flex flex-col items-center justify-center text-center shadow-[var(--shadow-card)] rotate-6 hidden sm:flex">
            <span className="font-serif italic text-lg leading-tight">Hand<br/>picked</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Peplum Tops", "Co-ord Sets", "Summer Dresses", "Linen Shirts", "Office Wear", "Occasion Edits", "Daily Staples"];
  return (
    <div className="border-y border-border bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-wrap gap-x-10 gap-y-2 justify-center text-sm text-muted-foreground">
        {items.map((t) => (
          <span key={t} className="font-serif italic">{t}</span>
        ))}
      </div>
    </div>
  );
}

function Services() {
  const services = [
    { icon: ShoppingBag, title: "Curated Collections", desc: "New silhouettes added every week — selected piece by piece, never mass-stocked.", img: serviceCurated },
    { icon: Scissors, title: "Personal Styling & Fit", desc: "Walk in, try on, and get honest styling guidance from our team in-store.", img: serviceStyling },
    { icon: Sparkles, title: "Wrapped & Ready", desc: "Beautifully packaged for yourself or for gifting — with care, every time.", img: serviceDelivery },
  ];
  return (
    <section id="services" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="max-w-2xl mb-16">
        <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-clay)]">What we do</span>
        <h2 className="font-serif text-4xl md:text-5xl mt-3">More than a clothing store.</h2>
        <p className="text-muted-foreground mt-4 text-lg">From the first try-on to the final wrap, every step is built around helping you feel beautifully yourself.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((s) => (
          <article key={s.title} className="group bg-card rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-card)] hover:-translate-y-1 transition duration-500">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={s.img} alt={s.title} loading="lazy" width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            </div>
            <div className="p-7 space-y-3">
              <s.icon className="w-5 h-5 text-[color:var(--brand-clay)]" />
              <h3 className="font-serif text-2xl">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function About() {
  return AboutInner();
}

function Policies() {
  return PoliciesInner();
}

function Labels() {
  const labels = [
    { handle: "@miss.hastag", title: "Miss Hastag", desc: "The main label — modern, everyday womenswear, hand-picked weekly." },
    { handle: "@hastag.men", title: "Hastag Men", desc: "Menswear edits from the Hastag family — same eye, made for him." },
    { handle: "@mh_traditional", title: "MH Traditional", desc: "Traditional and occasion wear designed in-house by Miss Hastag." },
  ];
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-14">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-clay)]">Our labels</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-3">One family, three wardrobes.</h2>
          <p className="text-muted-foreground mt-4 text-lg">From everyday staples to traditional couture and menswear — explore the full Hastag world.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {labels.map((l) => (
            <a
              key={l.handle}
              href={`https://instagram.com/${l.handle.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-border bg-card p-7 hover:-translate-y-1 transition duration-500 shadow-[var(--shadow-card)] flex flex-col gap-3"
            >
              <Instagram className="w-5 h-5 text-[color:var(--brand-clay)]" />
              <div className="font-serif text-2xl">{l.title}</div>
              <div className="text-sm text-muted-foreground">{l.handle}</div>
              <p className="text-muted-foreground leading-relaxed mt-1">{l.desc}</p>
              <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Follow on Instagram <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PoliciesInner() {
  const items = [
    { icon: Globe2, title: "Worldwide shipping", desc: "We ship our edits to wherever you call home — anywhere in the world." },
    { icon: Truck, title: "Free delivery over Rs. 5,000", desc: "Spend over Rs. 5,000 in a single order and delivery within Nepal is on us." },
    { icon: RefreshCcw, title: "Easy 7-day exchange", desc: "Not quite the fit? Exchange any piece within a week of receiving your order." },
  ];
  return (
    <section className="border-y border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-3 gap-10">
        {items.map((i) => (
          <div key={i.title} className="flex gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center">
              <i.icon className="w-5 h-5 text-[color:var(--brand-clay)]" />
            </div>
            <div>
              <div className="font-serif text-xl">{i.title}</div>
              <p className="text-muted-foreground mt-1 leading-relaxed text-sm">{i.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutInner() {
  return (
    <section id="about" className="py-24 lg:py-32" style={{ background: "var(--gradient-warm)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-[5/4] rounded-[2rem] overflow-hidden shadow-[var(--shadow-soft)]">
            <img src={aboutStore} alt="Inside the Miss Hastag boutique in Patan" loading="lazy" width={1280} height={960} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-8 -right-4 bg-background rounded-2xl px-6 py-5 shadow-[var(--shadow-card)] border border-border">
            <div className="font-serif text-3xl">5★</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Google rated</div>
          </div>
        </div>
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-clay)]">Our story</span>
          <h2 className="font-serif text-4xl md:text-5xl">A little boutique in Patan, with a big love for good clothes.</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Miss Hastag began with a simple idea — that women in Lalitpur deserve a thoughtfully edited wardrobe, without the overwhelm of fast fashion. Every piece in our store is chosen for fit, feel, and how it makes you stand a little taller.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Walk in, take your time, and let us help you find something you'll love wearing for years.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60">
            <div>
              <div className="font-serif text-3xl">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Hand-picked</div>
            </div>
            <div>
              <div className="font-serif text-3xl">Weekly</div>
              <div className="text-sm text-muted-foreground mt-1">New arrivals</div>
            </div>
            <div>
              <div className="font-serif text-3xl">In-store</div>
              <div className="text-sm text-muted-foreground mt-1">Styling help</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { data: dbReviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const fallbackReviews = [
    { customer_name: "Anjali S.", review_text: "Such a lovely little store. The staff helped me put together two whole outfits — I left feeling so confident.", location: "Patan", rating: 5 },
    { customer_name: "Priya M.", review_text: "Easily my favourite boutique in Lalitpur. The pieces are unique and the fit is always spot on.", location: "Kathmandu", rating: 5 },
    { customer_name: "Sneha R.", review_text: "Beautifully curated. I keep coming back every few weeks because there's always something new.", location: "Jhamsikhel", rating: 5 }
  ];

  const reviews = dbReviews && dbReviews.length > 0 ? dbReviews : fallbackReviews;

  return (
    <section id="testimonials" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="max-w-2xl mb-16">
        <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-clay)]">Kind words</span>
        <h2 className="font-serif text-4xl md:text-5xl mt-3">From the women who shop with us.</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <figure key={i} className="bg-card rounded-3xl p-8 border border-border shadow-[var(--shadow-card)] flex flex-col gap-6">
            <div className="flex gap-1">
              {[...Array(r.rating || 5)].map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-[color:var(--brand-clay)] text-[color:var(--brand-clay)]" />
              ))}
            </div>
            <blockquote className="font-serif text-xl leading-snug">"{r.review_text}"</blockquote>
            <figcaption className="mt-auto">
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-sm text-muted-foreground">{r.location}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function NewArrivals({ onOpenOrder }: { onOpenOrder: (product: any) => void }) {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <section className="py-24 lg:py-32 bg-card/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-clay)]">The Collection</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">New arrivals, weekly.</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Explore a hand-picked selection of this season's key wardrobes. Stop by our Patan store to try them on.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-muted rounded-3xl" />
                <div className="h-6 bg-muted rounded-md w-3/4" />
                <div className="h-4 bg-muted rounded-md w-1/2" />
                <div className="h-4 bg-muted rounded-md w-1/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-3xl">
            Could not load the latest collection. Try reloading the page.
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-3xl">
            No products available at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((p) => (
              <article key={p.id} className="group flex flex-col bg-card rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-card)] hover:-translate-y-1 transition duration-500">
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-background/85 backdrop-blur-md border border-border/40 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide uppercase text-foreground">
                    New In
                  </div>
                </div>
                <div className="p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-2xl group-hover:text-[color:var(--brand-clay)] transition">{p.name}</h3>
                      <span className="font-medium text-foreground whitespace-nowrap">Rs. {p.price?.toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onOpenOrder({
                        name: p.name,
                        price: p.price,
                        image_url: p.image_url
                      })}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold py-3 hover:opacity-90 transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Order online
                    </button>
                    <a
                      href="tel:+9779807499247"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border hover:bg-accent text-xs font-medium py-3 transition text-center"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call to hold
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CTA({ onOpenBooking }: { onOpenBooking: () => void }) {
  return (
    <section id="visit" className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center space-y-10">
        <h2 className="font-serif text-4xl md:text-6xl leading-tight">
          Come say hello.<br />
          <em className="italic text-[color:var(--brand-blush)]">We'd love to dress you.</em>
        </h2>
        <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
          Visit our boutique in Patan, or book a private styling session with our team online. You can also reach us at +977 9807499247 or +977 9808518972.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={onOpenBooking}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-blush)] text-[color:var(--brand-ink)] px-7 py-4 text-sm font-medium hover:opacity-90 transition cursor-pointer shadow-lg"
          >
            <Sparkles className="w-4 h-4" /> Book styling session
          </button>
          <a href="tel:+9779807499247" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-4 text-sm font-medium hover:bg-primary-foreground/10 transition">
            <Phone className="w-4 h-4" /> Call store
          </a>
          <a href="https://maps.google.com/?q=Miss+Hastag+Lalitpur" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-7 py-4 text-sm font-medium hover:bg-primary-foreground/10 transition">
            <MapPin className="w-4 h-4" /> Get directions
          </a>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto text-left">
          <InfoBlock icon={MapPin} title="Find us" lines={["Patan", "Lalitpur 44600, Nepal"]} />
          <InfoBlock icon={Clock} title="Open today" lines={["Mon – Sun", "Until 7:00 PM"]} />
          <InfoBlock icon={Instagram} title="Follow along" lines={["@miss.hastag", "@hastag.men · @mh_traditional"]} />
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ icon: Icon, title, lines }: { icon: typeof MapPin; title: string; lines: string[] }) {
  return (
    <div className="border-t border-primary-foreground/20 pt-5">
      <Icon className="w-4 h-4 mb-3 text-[color:var(--brand-blush)]" />
      <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">{title}</div>
      {lines.map((l) => (
        <div key={l} className="mt-1 text-primary-foreground/90">{l}</div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="font-serif text-lg text-foreground">Miss <span className="italic text-[color:var(--brand-clay)]">Hastag</span></div>
        <div>© {new Date().getFullYear()} Miss Hastag · Clothing boutique in Patan, Lalitpur · +977 9807499247 / +977 9808518972</div>
      </div>
    </footer>
  );
}
