/**
 * SignupsViewModal.tsx
 *
 * Purpose: Modal for viewing and managing event registrations
 *
 * Features:
 * - List all registrations with status
 * - View individual registration details
 * - Export to CSV
 * - Check-in functionality
 * - Filter by status (confirmed, waitlist)
 * - Search by name/email
 * - Statistics summary
 */

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Download,
  Search,
  CheckCircle,
  Clock,
  User,
  Users,
  Mail,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Types
// ============================================================================

interface EventRegistration {
  data_retention_until: any;
  gdpr_consent: any;
  id: string;
  event_id: string;
  registration_type: "single" | "team";
  status: "confirmed" | "waitlist" | "cancelled";
  waitlist_position?: number | null;
  registered_at: Timestamp;

  // Single person
  user_email?: string;
  user_data?: Record<string, any>;

  // Team
  team_name?: string;
  team_lead_email?: string;
  team_members?: Array<{
    email: string;
    name?: string;
    member_data?: Record<string, any>;
  }>;

  // Admin
  checked_in?: boolean;
  admin_notes?: string;
}

interface SignupsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
}

// ============================================================================
// SignupsViewModal Component
// ============================================================================

export const SignupsViewModal = ({
  isOpen,
  onClose,
  event,
}: SignupsViewModalProps) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] =
    useState<EventRegistration | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch registrations when modal opens
  useEffect(() => {
    if (!isOpen || !event) {
      setRegistrations([]);
      setSelectedRegistration(null);
      setSearchQuery("");
      setStatusFilter("all");
      return;
    }

    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const regsRef = collection(db, "event_registrations");
        const q = query(regsRef, where("event_id", "==", event.id));
        const snapshot = await getDocs(q);

        const regs: EventRegistration[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as EventRegistration)
        );

        // Sort by registration date (newest first)
        regs.sort(
          (a, b) => b.registered_at.toMillis() - a.registered_at.toMillis()
        );

        setRegistrations(regs);
      } catch (err) {
        console.error("Failed to load registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [isOpen, event]);

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    let filtered = registrations;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((reg) => {
        if (reg.registration_type === "single") {
          const email = reg.user_email?.toLowerCase() || "";
          const name = reg.user_data?.full_name?.toLowerCase() || "";
          return email.includes(query) || name.includes(query);
        } else {
          const teamName = reg.team_name?.toLowerCase() || "";
          const leadEmail = reg.team_lead_email?.toLowerCase() || "";
          return teamName.includes(query) || leadEmail.includes(query);
        }
      });
    }

    return filtered;
  }, [registrations, statusFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = registrations.length;
    const confirmed = registrations.filter(
      (r) => r.status === "confirmed"
    ).length;
    const waitlist = registrations.filter(
      (r) => r.status === "waitlist"
    ).length;
    const checkedIn = registrations.filter((r) => r.checked_in).length;
    const totalParticipants = registrations.reduce((sum, reg) => {
      if (reg.registration_type === "team") {
        return sum + (reg.team_members?.length || 0);
      }
      return sum + 1;
    }, 0);

    return { total, confirmed, waitlist, checkedIn, totalParticipants };
  }, [registrations]);

  // Toggle check-in
  const handleCheckIn = async (registration: EventRegistration) => {
    try {
      const regRef = doc(db, "event_registrations", registration.id);
      await updateDoc(regRef, {
        checked_in: !registration.checked_in,
      });

      // Update local state
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id ? { ...r, checked_in: !r.checked_in } : r
        )
      );
    } catch (err) {
      console.error("Failed to update check-in:", err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    // Prepare CSV data
    const headers = [
      "Registration Date",
      "Type",
      "Status",
      "Name/Team Name",
      "Email",
      "Checked In",
      "Waitlist Position",
    ];

    const rows = registrations.map((reg) => {
      const date = reg.registered_at.toDate().toLocaleDateString();
      const type = reg.registration_type === "single" ? "Individual" : "Team";
      const status = reg.status.charAt(0).toUpperCase() + reg.status.slice(1);
      const name =
        reg.registration_type === "single"
          ? reg.user_data?.full_name || "N/A"
          : reg.team_name || "N/A";
      const email =
        reg.registration_type === "single"
          ? reg.user_email || "N/A"
          : reg.team_lead_email || "N/A";
      const checkedIn = reg.checked_in ? "Yes" : "No";
      const waitlistPos = reg.waitlist_position || "N/A";

      return [date, type, status, name, email, checkedIn, waitlistPos];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, "_")}_registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
              Event Signups
            </h2>
            <p className="text-sm text-[hsl(var(--section-light-foreground))]/70 mt-1">
              {event?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-[hsl(var(--divider))]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                Total Signups
              </div>
              <div className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
                {stats.total}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                Confirmed
              </div>
              <div className="text-2xl font-semibold text-green-600">
                {stats.confirmed}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                Waitlist
              </div>
              <div className="text-2xl font-semibold text-amber-600">
                {stats.waitlist}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                Checked In
              </div>
              <div className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
                {stats.checkedIn}
              </div>
            </div>
            {event?.registration?.type === "team" && (
              <div>
                <div className="text-xs uppercase tracking-wider text-[hsl(var(--section-light-foreground))]/60 mb-1">
                  Total People
                </div>
                <div className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
                  {stats.totalParticipants}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="px-6 py-4 border-b border-[hsl(var(--divider))] flex flex-wrap gap-3">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--section-light-foreground))]/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="waitlist">Waitlist</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Registrations List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-[hsl(var(--section-light-foreground))]/70">
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--section-light-foreground))]/70">
              No registrations found.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="border border-[hsl(var(--divider))] p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRegistration(registration)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Type Icon */}
                        {registration.registration_type === "single" ? (
                          <User className="w-5 h-5 text-[hsl(var(--section-light-foreground))]/60" />
                        ) : (
                          <Users className="w-5 h-5 text-[hsl(var(--section-light-foreground))]/60" />
                        )}

                        {/* Name/Team Name */}
                        <h4 className="font-medium text-[hsl(var(--section-light-foreground))]">
                          {registration.registration_type === "single"
                            ? registration.user_data?.full_name || "Unnamed"
                            : registration.team_name || "Unnamed Team"}
                        </h4>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border ${
                            registration.status === "confirmed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : registration.status === "waitlist"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {registration.status === "confirmed" && (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          {registration.status === "waitlist" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {registration.status.charAt(0).toUpperCase() +
                            registration.status.slice(1)}
                          {registration.waitlist_position &&
                            ` #${registration.waitlist_position}`}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2 text-sm text-[hsl(var(--section-light-foreground))]/70">
                        <Mail className="w-4 h-4" />
                        <span>
                          {registration.registration_type === "single"
                            ? registration.user_email
                            : registration.team_lead_email}
                        </span>
                      </div>

                      {/* Team size */}
                      {registration.registration_type === "team" && (
                        <div className="text-sm text-[hsl(var(--section-light-foreground))]/70 mt-1">
                          {registration.team_members?.length || 0} member
                          {registration.team_members?.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    {/* Check-in */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-[hsl(var(--section-light-foreground))]/60">
                        {registration.registered_at
                          .toDate()
                          .toLocaleDateString()}
                      </div>
                      <Button
                        size="sm"
                        variant={
                          registration.checked_in ? "default" : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckIn(registration);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {registration.checked_in ? "Checked In" : "Check In"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--divider))] px-6 py-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Registration Detail Modal (nested) */}
      {selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          onClose={() => setSelectedRegistration(null)}
        />
      )}
    </div>
  );
};

// ============================================================================
// Registration Detail Modal (Nested)
// ============================================================================

interface RegistrationDetailModalProps {
  registration: EventRegistration;
  onClose: () => void;
}

const RegistrationDetailModal = ({
  registration,
  onClose,
}: RegistrationDetailModalProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-[hsl(var(--section-light-foreground))]">
            Registration Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {registration.registration_type === "single" ? (
            <>
              <div>
                <h4 className="text-sm font-medium text-[hsl(var(--section-light-foreground))]/60 mb-2">
                  Participant Information
                </h4>
                <div className="space-y-2">
                  {Object.entries(registration.user_data || {}).map(
                    ([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-4">
                        <div className="text-sm font-medium text-[hsl(var(--section-light-foreground))]">
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          :
                        </div>
                        <div className="col-span-2 text-sm text-[hsl(var(--section-light-foreground))]/70">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : String(value)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium text-[hsl(var(--section-light-foreground))]/60 mb-2">
                  Team Information
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-[hsl(var(--section-light-foreground))]">
                      Team Name:
                    </div>
                    <div className="col-span-2 text-sm text-[hsl(var(--section-light-foreground))]/70">
                      {registration.team_name || "N/A"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-sm font-medium text-[hsl(var(--section-light-foreground))]">
                      Team Lead:
                    </div>
                    <div className="col-span-2 text-sm text-[hsl(var(--section-light-foreground))]/70">
                      {registration.team_lead_email}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[hsl(var(--section-light-foreground))]/60 mb-2">
                  Team Members ({registration.team_members?.length || 0})
                </h4>
                <div className="space-y-4">
                  {registration.team_members?.map((member, index) => (
                    <div
                      key={index}
                      className="border border-[hsl(var(--divider))] p-3"
                    >
                      <div className="font-medium text-sm text-[hsl(var(--section-light-foreground))] mb-2">
                        {member.name || `Member ${index + 1}`}
                      </div>
                      <div className="text-sm text-[hsl(var(--section-light-foreground))]/70 mb-2">
                        {member.email}
                      </div>
                      {member.member_data &&
                        Object.keys(member.member_data).length > 0 && (
                          <div className="space-y-1 text-xs">
                            {Object.entries(member.member_data).map(
                              ([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium">
                                    {key
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    :
                                  </span>
                                  <span className="text-[hsl(var(--section-light-foreground))]/70">
                                    {Array.isArray(value)
                                      ? value.join(", ")
                                      : String(value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* GDPR Consent Info */}
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--section-light-foreground))]/60 mb-2">
              Consent & Privacy
            </h4>
            <div className="space-y-1 text-xs text-[hsl(var(--section-light-foreground))]/70">
              <div>✓ Data processing consent given</div>
              {registration.gdpr_consent?.event_communications && (
                <div>✓ Event communications consent given</div>
              )}
              {registration.gdpr_consent?.photo_consent && (
                <div>✓ Photo consent given</div>
              )}
              <div className="mt-2">
                Data will be automatically deleted on:{" "}
                {registration.data_retention_until
                  ?.toDate()
                  .toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[hsl(var(--divider))] px-6 py-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};
