import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Lock, 
  Mail, 
  LogOut, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  Phone, 
  MessageSquare,
  ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Miss Hastag" },
      { name: "description", content: "Boutique bookings management and appointment dashboard." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      if (!session) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setSession(data.session);
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthError(err.message || "Invalid email or password");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // 1. RENDER LOGIN SCREEN
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-[color:var(--brand-blush)]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-[color:var(--brand-clay)]/10 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-card rounded-[2rem] border border-border shadow-[var(--shadow-soft)] p-8 md:p-10 relative z-10">
          <div className="text-center space-y-3 mb-8">
            <h1 className="font-serif text-3xl leading-tight">Boutique Admin</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to manage appointments & bookings
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="admin@misshastag.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-clay)] transition"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-4 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {authLoading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. RENDER ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/75 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl tracking-tight">
              Miss <span className="italic text-[color:var(--brand-clay)]">Hastag</span> Admin
            </span>
            <span className="hidden sm:inline-flex rounded-full bg-[color:var(--brand-clay)]/10 border border-[color:var(--brand-clay)]/20 px-2.5 py-0.5 text-xs font-medium text-[color:var(--brand-clay)]">
              Dashboard
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl">Booking Inquiries</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Review and manage private styling session requests submitted online.
            </p>
          </div>
          <div className="bg-card px-5 py-3.5 rounded-2xl border border-border shadow-[var(--shadow-card)] flex items-center gap-8">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Requests</div>
              <div className="text-2xl font-semibold mt-0.5">{bookings.length}</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Pending</div>
              <div className="text-2xl font-semibold mt-0.5 text-[color:var(--brand-clay)]">
                {bookings.filter((b: any) => b.status === "pending").length}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table / Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            Loading bookings...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-destructive text-sm border border-dashed border-destructive/20 rounded-3xl bg-destructive/5">
            Failed to retrieve bookings: {error.message}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground border border-dashed border-border rounded-3xl bg-card/40 flex flex-col items-center justify-center gap-2">
            <Calendar className="w-8 h-8 text-muted-foreground/60 mb-2" />
            <h3 className="text-lg font-medium">No bookings yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Any private styling requests submitted through the site will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-[2rem] border border-border shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-4 px-6 md:px-8">Customer</th>
                    <th className="py-4 px-6">Phone / Email</th>
                    <th className="py-4 px-6">Notes / Time Requested</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right md:pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-muted/10 transition">
                      {/* Customer Info */}
                      <td className="py-5 px-6 md:px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[color:var(--brand-clay)]/10 flex items-center justify-center text-[color:var(--brand-clay)] shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{booking.customer_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-5 px-6">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <a href={`tel:${booking.phone}`} className="hover:text-foreground transition">{booking.phone}</a>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <a href={`mailto:${booking.email}`} className="hover:text-foreground transition text-xs">{booking.email}</a>
                          </div>
                        </div>
                      </td>

                      {/* Notes / Message */}
                      <td className="py-5 px-6 max-w-xs md:max-w-md">
                        {booking.message ? (
                          <div className="flex gap-1.5 text-muted-foreground">
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-2 leading-relaxed">{booking.message}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 italic">No notes provided</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                          booking.status === "confirmed" 
                            ? "bg-green-500/10 border-green-500/20 text-green-600" 
                            : booking.status === "cancelled"
                            ? "bg-destructive/10 border-destructive/20 text-destructive"
                            : "bg-[color:var(--brand-clay)]/10 border-[color:var(--brand-clay)]/20 text-[color:var(--brand-clay)]"
                        }`}>
                          {booking.status === "confirmed" && <CheckCircle className="w-3.5 h-3.5" />}
                          {booking.status === "cancelled" && <XCircle className="w-3.5 h-3.5" />}
                          {booking.status === "pending" && <Clock className="w-3.5 h-3.5" />}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right md:pr-8">
                        <div className="flex items-center justify-end gap-2">
                          {/* Confirm */}
                          {booking.status !== "confirmed" && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                              className="p-1.5 rounded-lg border border-border hover:bg-green-500/10 hover:text-green-600 transition cursor-pointer"
                              title="Confirm Appointment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {/* Cancel */}
                          {booking.status === "pending" && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                              className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the booking for ${booking.customer_name}?`)) {
                                deleteMutation.mutate(booking.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
