/**
 * EventEditModal.tsx
 *
 * Purpose: Modal for creating and editing events with full registration configuration
 *
 * Features:
 * - Basic event info (title, company, location, date, description)
 * - Image upload to Firebase Storage
 * - Registration type configuration (none, external, email, single, team)
 * - Form field selector for custom signup forms
 * - Publish/Archive controls
 * - Delete event (with confirmation)
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - event: EventDoc | null (null for new event)
 * - onEventUpdated: () => void (callback after save/delete)
 */

import { useState, useEffect } from "react";
import { X, Upload, Trash2, Save, AlertCircle } from "lucide-react";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  collection,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldSelector } from "@/components/form-field-selector";

// ============================================================================
// Types
// ============================================================================

type RegistrationType = "none" | "external" | "email" | "single" | "team";

interface EventFormData {
  // Basic info
  title: string;
  company: string;
  location: string;
  description: string;

  // Dates
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM

  // Image
  image_url: string;

  // Status
  published: boolean;
  archived: boolean;

  // Registration
  registration_type: RegistrationType;

  // External
  external_url: string;

  // Email
  email_address: string;
  email_requirements: string[];

  // Single
  single_capacity: string; // Number as string for input
  single_requires_membership: boolean;
  single_required_fields: string[];

  // Team
  team_max_teams: string;
  team_min_size: string;
  team_max_size: string;
  team_lead_must_be_member: boolean;
  team_collect_all_emails: boolean;
  team_collect_all_names: boolean;
  team_require_team_name: boolean;
  team_required_fields: string[];
}

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null; // null for new event
  onEventUpdated: () => void;
}

// ============================================================================
// EventEditModal Component
// ============================================================================

export const EventEditModal = ({
  isOpen,
  onClose,
  event,
  onEventUpdated,
}: EventEditModalProps) => {
  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData(eventToFormData(event));
      setImagePreview(event.image_url || "");
    } else {
      setFormData(getInitialFormData());
      setImagePreview("");
    }
    setImageFile(null);
    setError(null);
  }, [event, isOpen]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, image_url: "" });
  };

  // Save event
  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!formData.location.trim()) {
        throw new Error("Location is required");
      }
      if (!formData.start_date || !formData.start_time || !formData.end_time) {
        throw new Error("Date and time are required");
      }

      // Validate registration config
      if (
        formData.registration_type === "external" &&
        !formData.external_url.trim()
      ) {
        throw new Error("External URL is required");
      }
      if (
        formData.registration_type === "email" &&
        !formData.email_address.trim()
      ) {
        throw new Error("Email address is required");
      }

      // Upload image if new file selected
      let imageUrl = formData.image_url;
      if (imageFile) {
        const imageRef = ref(
          storage,
          `event-images/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create timestamps
      const startDateTime = new Date(
        `${formData.start_date}T${formData.start_time}`
      );
      const endDateTime = new Date(
        `${formData.start_date}T${formData.end_time}`
      );

      // Build event document
      const eventDoc: any = {
        title: formData.title.trim(),
        company: formData.company.trim() || null,
        location: formData.location.trim(),
        description: formData.description.trim(),
        starts_at: Timestamp.fromDate(startDateTime),
        ends_at: Timestamp.fromDate(endDateTime),
        image_url: imageUrl || null,
        published: formData.published,
        archived: formData.archived,
        updated_at: Timestamp.now(),
      };

      // Add registration config
      eventDoc.registration = buildRegistrationConfig(formData);

      // Initialize stats if new event
      if (!event) {
        eventDoc.created_at = Timestamp.now();
        eventDoc.stats = {
          total_signups: 0,
          total_participants: 0,
          waitlist_count: 0,
        };
      }

      // Save to Firestore
      if (event) {
        await updateDoc(doc(db, "events", event.id), eventDoc);
      } else {
        const newEventRef = doc(collection(db, "events"));
        await setDoc(newEventRef, eventDoc);
      }

      onEventUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to save event:", err);
      setError(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!event) return;

    setLoading(true);
    setError(null);

    try {
      // Delete image from storage if exists
      if (event.image_url) {
        try {
          const imageRef = ref(storage, event.image_url);
          await deleteObject(imageRef);
        } catch (err) {
          console.warn("Could not delete image:", err);
        }
      }

      // Delete event document
      await deleteDoc(doc(db, "events", event.id));

      onEventUpdated();
      onClose();
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      setError(err.message || "Failed to delete event");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-900 scrollbar-track-transparent">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[hsl(var(--divider))] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[hsl(var(--section-light-foreground))]">
            {event ? "Edit Event" : "Create New Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Basic Information Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Investment Banking Case Competition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company / Partner</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g., Goldman Sachs"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., DTU Building 101, Room 023"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_date">Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the event..."
                  rows={4}
                />
              </div>
            </div>
          </section>

          {/* Event Image Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Event Image
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="max-w-xs max-h-48 object-contain border border-[hsl(var(--divider))]"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[hsl(var(--divider))] p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--divider))]" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-[hsl(var(--section-light-foreground))]/70">
                      Click to upload image (max 5MB)
                    </span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Registration Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Registration
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="registration_type">Registration Type</Label>
                <Select
                  value={formData.registration_type}
                  onValueChange={(value: RegistrationType) =>
                    setFormData({ ...formData, registration_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No Registration Required
                    </SelectItem>
                    <SelectItem value="external">External Website</SelectItem>
                    <SelectItem value="email">Email Registration</SelectItem>
                    <SelectItem value="single">Individual Signup</SelectItem>
                    <SelectItem value="team">Team Signup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* External URL */}
              {formData.registration_type === "external" && (
                <div>
                  <Label htmlFor="external_url">
                    External Registration URL *
                  </Label>
                  <Input
                    id="external_url"
                    type="url"
                    value={formData.external_url}
                    onChange={(e) =>
                      setFormData({ ...formData, external_url: e.target.value })
                    }
                    placeholder="https://example.com/register"
                  />
                </div>
              )}

              {/* Email Registration */}
              {formData.registration_type === "email" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email_address">
                      Registration Email Address *
                    </Label>
                    <Input
                      id="email_address"
                      type="email"
                      value={formData.email_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email_address: e.target.value,
                        })
                      }
                      placeholder="events@tia.com"
                    />
                  </div>
                  <div>
                    <Label>Requirements to Include in Email</Label>
                    <Textarea
                      value={formData.email_requirements.join("\n")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email_requirements: e.target.value
                            .split("\n")
                            .filter(Boolean),
                        })
                      }
                      placeholder="CV / Resume&#10;Transcript&#10;Cover Letter"
                      rows={3}
                    />
                    <p className="text-xs text-[hsl(var(--section-light-foreground))]/60 mt-1">
                      One requirement per line
                    </p>
                  </div>
                </div>
              )}

              {/* Individual Signup */}
              {formData.registration_type === "single" && (
                <div className="space-y-4 border border-[hsl(var(--divider))] p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="single_capacity">
                        Capacity (leave empty for unlimited)
                      </Label>
                      <Input
                        id="single_capacity"
                        type="number"
                        min="1"
                        value={formData.single_capacity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            single_capacity: e.target.value,
                          })
                        }
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="single_membership"
                          checked={formData.single_requires_membership}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              single_requires_membership: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="single_membership"
                          className="cursor-pointer"
                        >
                          Require TIA membership
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Form Fields to Collect</Label>
                    <FormFieldSelector
                      selectedFields={formData.single_required_fields}
                      onChange={(fields) =>
                        setFormData({
                          ...formData,
                          single_required_fields: fields,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Team Signup */}
              {formData.registration_type === "team" && (
                <div className="space-y-4 border border-[hsl(var(--divider))] p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="team_max_teams">Max Teams</Label>
                      <Input
                        id="team_max_teams"
                        type="number"
                        min="1"
                        value={formData.team_max_teams}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            team_max_teams: e.target.value,
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team_min_size">Min Team Size</Label>
                      <Input
                        id="team_min_size"
                        type="number"
                        min="1"
                        value={formData.team_min_size}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            team_min_size: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="team_max_size">Max Team Size</Label>
                      <Input
                        id="team_max_size"
                        type="number"
                        min="1"
                        value={formData.team_max_size}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            team_max_size: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="team_lead_member"
                        checked={formData.team_lead_must_be_member}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            team_lead_must_be_member: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="team_lead_member"
                        className="cursor-pointer"
                      >
                        Team lead must be TIA member
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="team_all_emails"
                        checked={formData.team_collect_all_emails}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            team_collect_all_emails: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="team_all_emails"
                        className="cursor-pointer"
                      >
                        Collect email from all team members
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="team_all_names"
                        checked={formData.team_collect_all_names}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            team_collect_all_names: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="team_all_names"
                        className="cursor-pointer"
                      >
                        Collect name from all team members
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="team_name_required"
                        checked={formData.team_require_team_name}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            team_require_team_name: checked as boolean,
                          })
                        }
                      />
                      <Label
                        htmlFor="team_name_required"
                        className="cursor-pointer"
                      >
                        Require team name
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label>Form Fields (per team member)</Label>
                    <FormFieldSelector
                      selectedFields={formData.team_required_fields}
                      onChange={(fields) =>
                        setFormData({
                          ...formData,
                          team_required_fields: fields,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Status Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--section-light-foreground))]">
              Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked as boolean })
                  }
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Published (visible to public)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="archived"
                  checked={formData.archived}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, archived: checked as boolean })
                  }
                />
                <Label htmlFor="archived" className="cursor-pointer">
                  Archived (hidden from public)
                </Label>
              </div>
            </div>
          </section>

          {/* Delete Section (only for existing events) */}
          {event && (
            <section className="border-t border-red-200 pt-6">
              <h3 className="text-lg font-semibold mb-2 text-red-700">
                Danger Zone
              </h3>
              <p className="text-sm text-[hsl(var(--section-light-foreground))]/70 mb-4">
                Once you delete an event, there is no going back. Please be
                certain.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-700">
                    Are you sure you want to delete this event? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Yes, Delete Event
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[hsl(var(--divider))] px-6 py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : event ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

function getInitialFormData(): EventFormData {
  return {
    title: "",
    company: "",
    location: "",
    description: "",
    start_date: "",
    start_time: "",
    end_time: "",
    image_url: "",
    published: false,
    archived: false,
    registration_type: "none",
    external_url: "",
    email_address: "",
    email_requirements: [],
    single_capacity: "",
    single_requires_membership: false,
    single_required_fields: [],
    team_max_teams: "",
    team_min_size: "2",
    team_max_size: "5",
    team_lead_must_be_member: false,
    team_collect_all_emails: true,
    team_collect_all_names: true,
    team_require_team_name: true,
    team_required_fields: [],
  };
}

function eventToFormData(event: any): EventFormData {
  const startDate = event.starts_at.toDate();
  const endDate = event.ends_at?.toDate();

  return {
    title: event.title || "",
    company: event.company || "",
    location: event.location || "",
    description: event.description || "",
    start_date: startDate.toISOString().split("T")[0],
    start_time: startDate.toTimeString().slice(0, 5),
    end_time: endDate ? endDate.toTimeString().slice(0, 5) : "",
    image_url: event.image_url || "",
    published: event.published ?? false,
    archived: event.archived ?? false,
    registration_type: event.registration?.type || "none",
    external_url: event.registration?.external_url || "",
    email_address: event.registration?.email_address || "",
    email_requirements: event.registration?.email_requirements || [],
    single_capacity: event.registration?.capacity?.toString() || "",
    single_requires_membership:
      event.registration?.requires_membership ?? false,
    single_required_fields: event.registration?.required_fields || [],
    team_max_teams: event.registration?.max_teams?.toString() || "",
    team_min_size: event.registration?.min_team_size?.toString() || "2",
    team_max_size: event.registration?.max_team_size?.toString() || "5",
    team_lead_must_be_member:
      event.registration?.team_lead_must_be_member ?? false,
    team_collect_all_emails: event.registration?.collect_all_emails ?? true,
    team_collect_all_names: event.registration?.collect_all_names ?? true,
    team_require_team_name: event.registration?.require_team_name ?? true,
    team_required_fields: event.registration?.required_fields || [],
  };
}

function buildRegistrationConfig(formData: EventFormData): any {
  const base = {
    type: formData.registration_type,
    status: "open",
  };

  if (formData.registration_type === "none") {
    return base;
  }

  if (formData.registration_type === "external") {
    return {
      ...base,
      external_url: formData.external_url,
    };
  }

  if (formData.registration_type === "email") {
    return {
      ...base,
      email_address: formData.email_address,
      email_requirements: formData.email_requirements,
    };
  }

  if (formData.registration_type === "single") {
    return {
      ...base,
      capacity: formData.single_capacity
        ? parseInt(formData.single_capacity)
        : null,
      requires_membership: formData.single_requires_membership,
      required_fields: formData.single_required_fields,
    };
  }

  if (formData.registration_type === "team") {
    return {
      ...base,
      max_teams: formData.team_max_teams
        ? parseInt(formData.team_max_teams)
        : null,
      min_team_size: parseInt(formData.team_min_size),
      max_team_size: parseInt(formData.team_max_size),
      team_lead_must_be_member: formData.team_lead_must_be_member,
      collect_all_emails: formData.team_collect_all_emails,
      collect_all_names: formData.team_collect_all_names,
      require_team_name: formData.team_require_team_name,
      required_fields: formData.team_required_fields,
    };
  }

  return base;
}
