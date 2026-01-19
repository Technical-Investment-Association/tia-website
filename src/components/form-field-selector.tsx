/**
 * FormFieldSelector.tsx
 *
 * Purpose: UI for selecting which form fields to collect during event registration
 *
 * Features:
 * - Checkboxes for each available field
 * - Grouped by category (Personal, Academic, Contact, Dietary, Other)
 * - Warning indicator for sensitive data fields
 * - Preview of what the form will look like
 */

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface FormFieldDefinition {
  id: string;
  label: string;
  field_type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "multiselect"
    | "textarea"
    | "phone";
  category: "personal" | "academic" | "dietary" | "contact" | "other";
  validation?: {
    required?: boolean;
    options?: string[];
  };
  is_sensitive: boolean;
  retention_period_days: number;
  order: number;
}

interface FormFieldSelectorProps {
  selectedFields: string[];
  onChange: (selectedFields: string[]) => void;
}

// ============================================================================
// FormFieldSelector Component
// ============================================================================

export const FormFieldSelector = ({
  selectedFields,
  onChange,
}: FormFieldSelectorProps) => {
  const [availableFields, setAvailableFields] = useState<FormFieldDefinition[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Fetch available fields from Firestore
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fieldsRef = collection(db, "form_field_definitions");
        const q = query(fieldsRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);

        const fields: FormFieldDefinition[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as FormFieldDefinition)
        );

        setAvailableFields(fields);
      } catch (err) {
        console.error("Failed to load form fields:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  // Toggle field selection
  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      onChange(selectedFields.filter((id) => id !== fieldId));
    } else {
      onChange([...selectedFields, fieldId]);
    }
  };

  // Group fields by category
  const fieldsByCategory = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FormFieldDefinition[]>);

  const categories = [
    { key: "personal", label: "Personal Information" },
    { key: "contact", label: "Contact Information" },
    { key: "academic", label: "Academic Information" },
    { key: "dietary", label: "Dietary & Health" },
    { key: "other", label: "Other" },
  ];

  const hasSensitiveData = selectedFields.some(
    (fieldId) => availableFields.find((f) => f.id === fieldId)?.is_sensitive
  );

  if (loading) {
    return (
      <div className="text-sm text-[hsl(var(--section-light-foreground))]/70">
        Loading form fields...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sensitive data warning */}
      {hasSensitiveData && (
        <div className="p-3 bg-amber-50 border border-amber-200 flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">
              Sensitive Data Selected
            </p>
            <p className="text-amber-700">
              You've selected fields containing health or dietary information.
              This data will be automatically deleted 30 days after the event
              for GDPR compliance.
            </p>
          </div>
        </div>
      )}

      {/* Field categories */}
      <div className="border border-[hsl(var(--divider))] divide-y divide-[hsl(var(--divider))]">
        {categories.map((category) => {
          const fields = fieldsByCategory[category.key] || [];
          if (fields.length === 0) return null;

          return (
            <div key={category.key} className="p-4">
              <h4 className="font-semibold text-sm text-[hsl(var(--section-light-foreground))] mb-3">
                {category.label}
              </h4>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`field-${field.id}`}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <span>{field.label}</span>
                        {field.is_sensitive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Sensitive
                          </span>
                        )}
                      </Label>
                      <p className="text-xs text-[hsl(var(--section-light-foreground))]/60 mt-0.5">
                        {field.field_type === "select" && "Dropdown menu"}
                        {field.field_type === "multiselect" &&
                          "Multiple selection"}
                        {field.field_type === "textarea" && "Text area"}
                        {field.field_type === "email" && "Email address"}
                        {field.field_type === "phone" && "Phone number"}
                        {field.field_type === "number" && "Number"}
                        {field.field_type === "text" && "Text input"}
                        {" • "}
                        Kept for {field.retention_period_days} days after event
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-sm text-[hsl(var(--section-light-foreground))]/70">
        {selectedFields.length === 0 ? (
          <p>No fields selected. Select fields to collect from participants.</p>
        ) : (
          <p>
            {selectedFields.length} field
            {selectedFields.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
};
