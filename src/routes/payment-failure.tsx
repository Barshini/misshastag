import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/payment-failure")({
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Miss Hastag" },
      { name: "description", content: "Your checkout transaction was cancelled or failed." },
    ],
  }),
  component: PaymentFailurePage,
});

function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[color:var(--brand-blush)]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[color:var(--brand-clay)]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-card rounded-[2rem] border border-border shadow-[var(--shadow-soft)] p-8 md:p-10 relative z-10 text-center space-y-6">
        
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-3xl">Payment Cancelled</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your transaction was cancelled, timed out, or rejected by the payment gateway portal. 
            No money has been charged.
          </p>
        </div>

        {/* Security / Help card */}
        <div className="bg-muted/30 p-5 rounded-2xl border border-border/60 text-left flex gap-3.5 items-start">
          <ShieldAlert className="w-5 h-5 text-[color:var(--brand-clay)] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-foreground">Need help with payment?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If your payment app was debited but you see this page, please contact Miss Hastag support at 
              <strong> +977 9807499247</strong> or email us with your phone number.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:opacity-90 transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back to Shop
          </Link>
        </div>

      </div>
    </div>
  );
}
