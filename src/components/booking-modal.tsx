import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { submitBookingAction } from "@/lib/booking-actions";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot spam protection
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await submitBookingAction({
        data: {
          name,
          email,
          phone,
          message,
          website,
        },
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to submit booking request.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        // Reset form and close modal
        setIsSuccess(false);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setWebsite("");
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting booking:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-card rounded-[2rem] border border-border shadow-[var(--shadow-soft)] p-8 md:p-10 transition duration-500 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[color:var(--brand-blush)]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-[color:var(--brand-clay)]/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-border/80 hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Close booking modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[color:var(--brand-clay)]/15 flex items-center justify-center text-[color:var(--brand-clay)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-3xl">Appointment Requested!</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Thank you, {name}. We have saved your styling request. Our team will contact you shortly to confirm your slot.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-clay)]/10 border border-[color:var(--brand-clay)]/20 px-3 py-1 text-xs tracking-wide uppercase text-[color:var(--brand-clay)]">
                <Sparkles className="w-3 h-3" /> Private Booking
              </span>
              <h3 className="font-serif text-3xl">Book a Styling Slot</h3>
              <p className="text-muted-foreground text-sm">
                Reserve a quiet hour with our team at the Patan boutique. We'll help you explore styles and find your perfect fit.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anjali Shrestha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="anjali@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+977 9807499247 / +977 9808518972"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                  />
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

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferred Date / Notes</label>
                <textarea
                  placeholder="Mention your preferred date/time or specific sizing/styling requests..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving request...
                  </>
                ) : (
                  "Request Styling Slot"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
