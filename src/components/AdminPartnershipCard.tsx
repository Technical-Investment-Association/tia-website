// src/components/admin-partnership-card.tsx
import { Button } from "@/components/ui/button";
import { Partnership } from "@/types/partnerships";

type Props = {
  partnership: Partnership;
  onEdit: (partnership: Partnership) => void;
};

export const AdminPartnershipCard = ({ partnership, onEdit }: Props) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        {/* Left: logo + text */}
        <div className="flex items-start gap-4">
          {partnership.logoUrl && (
            <img
              src={partnership.logoUrl}
              alt={partnership.name}
              className="h-12 w-12 object-contain"
            />
          )}

          <div>
            <h3 className="text-lg font-medium text-slate-900">
              {partnership.name}
            </h3>

            {partnership.description && (
              <p className="mt-1 text-sm text-slate-600">
                {partnership.description}
              </p>
            )}

            <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
              {partnership.category === "corporate"
                ? "Corporate partnership"
                : "Student club partnership"}
            </p>
          </div>
        </div>

        {/* Right: edit only */}
        <Button variant="outline" size="sm" onClick={() => onEdit(partnership)}>
          Edit
        </Button>
      </div>
    </article>
  );
};
