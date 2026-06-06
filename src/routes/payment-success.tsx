import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle, ShoppingBag, MapPin, ArrowRight } from "lucide-react";
import { verifyEsewaPaymentAction, verifyKhaltiPaymentAction } from "@/lib/order-actions";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Miss Hastag" },
      { name: "description", content: "Your order payment has been successfully verified." },
    ],
  }),
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const search = Route.useSearch() as any;
  const gateway = search.gateway || "";
  const dataParam = search.data || ""; // eSewa v2 success data parameter
  const pidxParam = search.pidx || ""; // Khalti success pidx parameter

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        if (gateway === "esewa" && dataParam) {
          console.log("Calling server to verify eSewa payment...");
          const res = await verifyEsewaPaymentAction({ data: { data: dataParam } });
          if (!active) return;
          if (res.success && res.order) {
            setOrder(res.order);
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMsg(res.message || "Failed to verify eSewa transaction.");
          }
        } else if (gateway === "khalti" && pidxParam) {
          console.log("Calling server to verify Khalti payment...");
          const res = await verifyKhaltiPaymentAction({ data: { pidx: pidxParam } });
          if (!active) return;
          if (res.success && res.order) {
            setOrder(res.order);
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMsg(res.message || "Failed to verify Khalti transaction.");
          }
        } else {
          // If no gateway parameters, but COD success or manual visit
          setStatus("error");
          setErrorMsg("Missing query parameters to verify payment.");
        }
      } catch (err: any) {
        if (!active) return;
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMsg(err.message || "An unexpected error occurred during payment verification.");
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [gateway, dataParam, pidxParam]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[color:var(--brand-blush)]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[color:var(--brand-clay)]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-card rounded-[2rem] border border-border shadow-[var(--shadow-soft)] p-8 md:p-10 relative z-10 text-center space-y-6">
        
        {status === "verifying" && (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-[color:var(--brand-clay)] mx-auto" />
            <h2 className="font-serif text-2xl">Verifying your payment...</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please wait while we confirm your transaction with the bank secure portal.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl">Payment Verification Failed</h2>
              <p className="text-destructive text-sm max-w-sm mx-auto">
                {errorMsg}
              </p>
            </div>
            <div className="pt-2">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition shadow-md"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        )}

        {status === "success" && order && (
          <div className="space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-3xl">Order Confirmed!</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Your payment via <strong className="capitalize">{gateway}</strong> has been verified. 
                A receipt has been emailed to <strong>{order.email}</strong>.
              </p>
            </div>

            {/* Order recap card */}
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/60 text-left space-y-4">
              <h4 className="font-serif text-base border-b border-border/60 pb-2 flex items-center gap-2 text-foreground">
                <ShoppingBag className="w-4 h-4 text-[color:var(--brand-clay)]" /> Delivery Summary
              </h4>
              <div className="text-sm space-y-2.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Product:</span>
                  <span className="text-foreground font-medium">{order.product_name} ({order.size})</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Paid:</span>
                  <span className="text-foreground font-semibold">Rs. {order.product_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <span className="text-foreground font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="text-foreground font-medium">{order.phone}</span>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-border/40 mt-1">
                  <MapPin className="w-4 h-4 text-[color:var(--brand-clay)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider block font-semibold text-muted-foreground">Ship To</span>
                    <span className="text-foreground font-medium">{order.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium hover:opacity-90 transition shadow-md"
              >
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
