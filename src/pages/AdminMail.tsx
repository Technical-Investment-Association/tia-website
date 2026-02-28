/**
 * Admin Mail – Compose, send and edit emails.
 * Tabs: Templates (new email + preview system templates), Drafts, Recently sent.
 * Modal for compose/edit/view with Firebase.
 */

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Section } from "@/components/layout/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GreyPillSelect } from "@/components/ui/grey-pill-select";
import { EmailComposeModal } from "@/components/modals/email-compose-modal";
import { SystemTemplateEditModal } from "@/components/modals/system-template-edit-modal";
import type { AdminEmail } from "@/services/admin-emails";
import { fetchDrafts, fetchRecentlySent } from "@/services/admin-emails";

const EDIT_TEMPLATE_OPTIONS = [
  { value: "welcome", label: "Welcome email" },
  { value: "profile-updated", label: "Profile updated email" },
  { value: "confirm-email", label: "Confirm email" },
] as const;

type TabId = "templates" | "drafts" | "recently-sent";

export default function AdminMail() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("templates");
  const [drafts, setDrafts] = useState<AdminEmail[]>([]);
  const [recentlySent, setRecentlySent] = useState<AdminEmail[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState<AdminEmail | null>(null);
  const [systemTemplateEditId, setSystemTemplateEditId] = useState<"welcome" | "profile-updated" | "confirm-email" | null>(null);
  const [editTemplate, setEditTemplate] = useState<string>("welcome");
  const [previewKey, setPreviewKey] = useState(0);

  const refreshDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    try {
      const list = await fetchDrafts();
      setDrafts(list);
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  const refreshRecentlySent = useCallback(async () => {
    setLoadingSent(true);
    try {
      const list = await fetchRecentlySent();
      setRecentlySent(list);
    } finally {
      setLoadingSent(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "drafts") refreshDrafts();
  }, [activeTab, refreshDrafts]);

  useEffect(() => {
    if (activeTab === "recently-sent") refreshRecentlySent();
  }, [activeTab, refreshRecentlySent]);

  const openNewEmail = () => {
    setModalEmail(null);
    setModalOpen(true);
  };

  const openDraft = (email: AdminEmail) => {
    setModalEmail(email);
    setModalOpen(true);
  };

  const openSent = (email: AdminEmail) => {
    setModalEmail(email);
    setModalOpen(true);
  };

  const editTemplatePreviewUrl = `/api/admin/email-preview?template=${encodeURIComponent(editTemplate)}`;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="grid-outer bg-white">
          <Section>
            <div className="grid-inner py-16">
              <p className="text-[hsl(var(--section-light-foreground))]/70">Access denied.</p>
            </div>
          </Section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="grid-outer bg-white">
        <Section>
          <div className="grid-inner py-16 md:py-20">
            <div className="col-span-12">
              <div className="mb-8">
                <h1 className="text-center text-3xl font-normal text-gray-900 md:text-4xl">
                  Compose, send and edit emails
                </h1>
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    onClick={openNewEmail}
                    className="rounded-full bg-primary text-white hover:bg-primary/85 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    New email
                  </Button>
                </div>
                <div className="mt-4 flex justify-center gap-1 rounded-full bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("templates")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "templates"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("drafts")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "drafts"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Drafts
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("recently-sent")}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "recently-sent"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Recently sent
                  </button>
                </div>
              </div>

              {/* Templates tab */}
              {activeTab === "templates" && (
                <Card className="overflow-hidden border-0 bg-white shadow-none">
                  <div className="space-y-6 px-6 py-4">
                    <div>
                      <h2 className="mb-3 text-xl font-normal text-gray-900">
                        System templates
                      </h2>
                      <p className="mb-3 text-sm text-gray-700">
                        Preview the automated membership emails. These are used when members sign up or update their profile.
                      </p>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <GreyPillSelect
                          value={editTemplate}
                          onValueChange={setEditTemplate}
                          options={EDIT_TEMPLATE_OPTIONS}
                          triggerClassName="w-full max-w-[280px] rounded-full border-0 bg-gray-200 pr-7 text-sm text-gray-900 outline-none focus:ring-0 focus:ring-offset-0"
                        />
                        <button
                          type="button"
                          onClick={() => setSystemTemplateEditId(editTemplate as "welcome" | "profile-updated" | "confirm-email")}
                          className="text-sm text-gray-900 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900"
                        >
                          Edit template
                        </button>
                      </div>
                      <div className="rounded-lg bg-gray-50/50">
                        <iframe
                          key={previewKey}
                          title="Template preview"
                          src={editTemplatePreviewUrl}
                          className="h-[420px] w-full border-0 bg-white"
                          sandbox="allow-same-origin"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewKey((k) => k + 1)}
                        className="mt-2 text-sm text-gray-700 underline decoration-gray-400 underline-offset-2 hover:decoration-gray-700"
                      >
                        Refresh preview
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Drafts tab */}
              {activeTab === "drafts" && (
                <Card className="overflow-hidden border-0 bg-white shadow-none">
                  <div className="px-6 py-4">
                    <h2 className="mb-4 text-xl font-normal text-gray-900">
                      Drafts
                    </h2>
                    {loadingDrafts ? (
                      <p className="text-sm text-gray-600">Loading…</p>
                    ) : drafts.length === 0 ? (
                      <p className="text-sm text-gray-600">No drafts yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {drafts.map((d) => (
                          <li key={d.id}>
                            <button
                              type="button"
                              onClick={() => openDraft(d)}
                              className="w-full rounded-lg bg-gray-100/80 px-4 py-3 text-left transition-colors hover:bg-gray-200/80"
                            >
                              <span className="font-medium text-gray-900">
                                {d.subject || "(No subject)"}
                              </span>
                              <span className="ml-2 text-sm text-gray-600">
                                {d.audience} · updated {d.updated_at.toLocaleDateString()}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              )}

              {/* Recently sent tab */}
              {activeTab === "recently-sent" && (
                <Card className="overflow-hidden border-0 bg-white shadow-none">
                  <div className="px-6 py-4">
                    <h2 className="mb-4 text-xl font-normal text-gray-900">
                      Recently sent
                    </h2>
                    {loadingSent ? (
                      <p className="text-sm text-gray-600">Loading…</p>
                    ) : recentlySent.length === 0 ? (
                      <p className="text-sm text-gray-600">No sent emails yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {recentlySent.map((e) => (
                          <li key={e.id}>
                            <button
                              type="button"
                              onClick={() => openSent(e)}
                              className="w-full rounded-lg bg-gray-100/80 px-4 py-3 text-left transition-colors hover:bg-gray-200/80"
                            >
                              <span className="font-medium text-gray-900">
                                {e.subject || "(No subject)"}
                              </span>
                              <span className="ml-2 text-sm text-gray-600">
                                {e.audience} · sent {e.sent_at?.toLocaleDateString() ?? ""}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />

      <EmailComposeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        email={modalEmail}
        onSaved={refreshDrafts}
        onSent={() => {
          refreshDrafts();
          refreshRecentlySent();
        }}
      />

      {systemTemplateEditId && (
        <SystemTemplateEditModal
          isOpen={true}
          onClose={() => setSystemTemplateEditId(null)}
          templateId={systemTemplateEditId}
          onSaved={() => setPreviewKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
