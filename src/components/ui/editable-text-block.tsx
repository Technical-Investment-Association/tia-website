// src/components/ui/editable-text-block.tsx
import { useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type EditableTextBlockProps = {
  contentId: string;
  defaultText: string; // also used as the empty-state hint, e.g. "Add title"
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  editByDefault?: boolean;
  variant?: "auto" | "light" | "dark";
};

const EditableTextBlock = ({
  contentId,
  defaultText,
  as = "p",
  className,
  editByDefault = false,
  variant = "auto",
}: EditableTextBlockProps) => {
  const { user, role, previewAsPublic } = useAuth();
  const isRealAdmin = role === "admin";
  const isAdminView = isRealAdmin && !previewAsPublic;

  const containerRef = useRef<HTMLDivElement>(null);

  // Detect background brightness when variant="auto"
  const [effectiveVariant, setEffectiveVariant] =
    useState<"light" | "dark">("dark");

  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const Tag = as as any;

  useEffect(() => {
    if (variant !== "auto") {
      setEffectiveVariant(variant);
      return;
    }

    // detect if the section background is light
    const el = containerRef.current;
    if (!el) return;

    const bg = window.getComputedStyle(el).backgroundColor;

    // Extract RGB
    const match = bg.match(/rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)/);

    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);

      // Perceived luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luminance > 140) {
        setEffectiveVariant("light");
      } else {
        setEffectiveVariant("dark");
      }
    }
  }, [variant]);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "static_content", contentId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          if (typeof data.text === "string") setText(data.text);
        } else {
          setText("");
        }
      } finally {
        setLoaded(true);
        if (isAdminView && editByDefault) setEditing(true);
      }
    };
    load();
  }, [contentId, isAdminView, editByDefault]);

  const handleSave = async () => {
    if (!isAdminView || !user) return;

    try {
      setSaving(true);
      setError(null);

      const ref = doc(db, "static_content", contentId);
      await setDoc(
        ref,
        { text, updated_at: serverTimestamp(), updated_by: user.uid },
        { merge: true }
      );

      // Close after save – simpler workflow
      setEditing(false);
    } catch (err) {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const hasText = text.trim().length > 0;

  const textareaStyles =
    effectiveVariant === "light"
      ? "bg-white border-gray-300 text-black placeholder-gray-400"
      : "bg-background border-border text-foreground placeholder-gray-500";

  const hintTextStyle =
    effectiveVariant === "light"
      ? "text-gray-500"
      : "text-[hsl(var(--section-light-foreground))]/70";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Admin edit mode */}
      {loaded && isAdminView && editing && (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={defaultText}
            className={cn(
              "w-full min-h-[120px] rounded-md p-2 text-sm border",
              textareaStyles
            )}
          />

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="sm" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>

          <p className={cn("text-[11px]", hintTextStyle)}>
            Note: Saved changes are stored in Firestore and are public to
            everyone visiting the site.
          </p>

          {!hasText && (
            <p className={cn("text-xs italic", hintTextStyle)}>
              This text is currently empty on the public site.
            </p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* Admin view but not editing */}
      {loaded && isAdminView && !editing && (
        <div>
          {hasText ? (
            <Tag>{text}</Tag>
          ) : (
            <Tag className={cn("italic", hintTextStyle)}>{defaultText}</Tag>
          )}

            <span
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEditing(true);
                }
            }}
            className={cn(
                "mt-1 text-[11px] underline-offset-2 hover:underline focus:outline-none cursor-pointer",
                effectiveVariant === "light"
                ? "text-gray-600"
                : "text-muted-foreground"
            )}
            >
      Edit text
    </span>

        </div>
      )}

      {/* Public / preview mode */}
      {loaded && !isAdminView && hasText && <Tag>{text}</Tag>}

      {/* Public / preview with no content = show nothing */}
      {loaded && !isAdminView && !hasText && null}
    </div>
  );
};

export default EditableTextBlock;

// Convenience wrappers so you can easily define H1/H2/H3 etc. with custom empty-state hints.
type EditableHeadingProps = Omit<EditableTextBlockProps, "as"> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export const EditableHeading = ({
  level = 2,
  ...rest
}: EditableHeadingProps) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <EditableTextBlock as={Tag} {...rest} />;
};

export const EditableParagraph = (
  props: Omit<EditableTextBlockProps, "as">
) => <EditableTextBlock as="p" {...props} />;
