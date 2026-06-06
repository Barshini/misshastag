import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2, ShoppingBag, MapPin, Phone, Mail, CreditCard } from "lucide-react";
import { createOrderAction } from "@/lib/order-actions";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    image_url: string;
  } | null;
}

export function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState("M");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti">("cod");
  const [website, setWebsite] = useState(""); // Honeypot spam protection
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !product) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await createOrderAction({
        data: {
          name,
          email,
          phone,
          address,
          size,
          productName: product.name,
          productPrice: product.price,
          paymentMethod,
          website,
        },
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to place order.");
      }

      // COD Flow: directly show success
      if (paymentMethod === "cod") {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setName("");
          setEmail("");
          setPhone("");
          setAddress("");
          setSize("M");
          setPaymentMethod("cod");
          setWebsite("");
          onClose();
        }, 3500);
      } 
      // eSewa Flow: POST to eSewa portal
      else if (paymentMethod === "esewa" && response.esewaParams) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // UAT sandbox URL
        
        Object.entries(response.esewaParams).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } 
      // Khalti Flow: Redirect to Khalti checkout page
      else if (paymentMethod === "khalti" && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (err: any) {
      console.error("Order submission error:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-card rounded-[2rem] border border-border shadow-[var(--shadow-soft)] p-8 md:p-10 transition duration-500 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[color:var(--brand-blush)]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-[color:var(--brand-clay)]/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-border/80 hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer z-10"
          aria-label="Close order modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl">Order Placed!</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Thank you, {name}. Your Cash on Delivery order for the <strong>{product.name}</strong> has been received. 
              We have sent a confirmation email to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-clay)]/10 border border-[color:var(--brand-clay)]/20 px-3 py-1 text-xs tracking-wide uppercase text-[color:var(--brand-clay)]">
                <ShoppingBag className="w-3 h-3" /> Checkout
              </span>
              <h3 className="font-serif text-3xl">Secure Checkout</h3>
            </div>

            {/* Product summary */}
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
              <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-lg leading-tight truncate">{product.name}</h4>
                <div className="text-muted-foreground text-xs mt-1">Free Delivery in Kathmandu valley</div>
                <div className="text-foreground font-semibold mt-1">Rs. {product.price.toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sulyoon Seo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="sulyoon@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="9808518972"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jhamsikhel, Lalitpur"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition cursor-pointer"
                  >
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                  </select>
                </div>
              </div>

              {/* Honeypot field for bot/spam protection */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl cursor-pointer transition text-center space-y-1 ${
                    paymentMethod === "cod" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold uppercase">COD</span>
                    <span className="text-[10px] opacity-80">Pay at door</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl cursor-pointer transition text-center space-y-1 ${
                    paymentMethod === "esewa" 
                      ? "border-[color:var(--brand-clay)] bg-[color:var(--brand-clay)]/5 text-[color:var(--brand-clay)]" 
                      : "border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="esewa" 
                      checked={paymentMethod === "esewa"}
                      onChange={() => setPaymentMethod("esewa")}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold uppercase">eSewa</span>
                    <span className="text-[10px] opacity-80">Sandbox UAT</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl cursor-pointer transition text-center space-y-1 ${
                    paymentMethod === "khalti" 
                      ? "border-purple-600 bg-purple-500/5 text-purple-600" 
                      : "border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="khalti" 
                      checked={paymentMethod === "khalti"}
                      onChange={() => setPaymentMethod("khalti")}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold uppercase">Khalti</span>
                    <span className="text-[10px] opacity-80">Online pay</span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {paymentMethod === "cod" ? "Confirm Order" : `Pay with ${paymentMethod === "esewa" ? "eSewa" : "Khalti"}`}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
