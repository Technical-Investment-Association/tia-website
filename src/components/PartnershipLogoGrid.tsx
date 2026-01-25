// src/components/PartnershipLogoGrid.tsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

type PartnershipKind = "corporate" | "student_club";

type PartnershipLogo = {
  id: string;
  name: string;
  logo_url?: string | null;
  kind?: PartnershipKind | null;
};

type BaseProps = {
  kind: PartnershipKind;
};

/**
 * Base grid that actually fetches and renders partners of a given kind.
 * All public components below just wrap this with a fixed `kind` value.
 */
const BasePartnershipLogoGrid = ({ kind }: BaseProps) => {
  const [partners, setPartners] = useState<PartnershipLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "partnerships"),
          where("published", "==", true),
          where("archived", "==", false),
          where("kind", "==", kind)
        );

        const snap = await getDocs(q);
        const items: PartnershipLogo[] = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          logo_url: d.data().logo_url,
          kind: (d.data().kind as PartnershipKind | undefined) ?? null,
        }));

        setPartners(items);
      } catch (err) {
        console.error("Failed to load partnerships for kind:", kind, err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [kind]);

  if (loading) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Loading partnerships…
      </div>
    );
  }

  // Few logos: center them with flex
  if (partners.length <= 3) {
    return (
      <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-6">
        {partners.map((p) =>
          p.logo_url ? (
            <div
              key={p.id}
              className="h-16 md:h-20 max-w-[160px] flex items-center justify-center"
            >
              <img
                src={p.logo_url}
                alt={p.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              key={p.id}
              className="h-16 md:h-20 max-w-[160px] flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md px-3 text-center"
            >
              {p.name}
            </div>
          )
        )}
      </div>
    );
  }

  // 4+ logos: regular grid
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-8 justify-items-center">
      {partners.map((p) =>
        p.logo_url ? (
          <div
            key={p.id}
            className="h-16 md:h-20 max-w-[160px] flex items-center justify-center"
          >
            <img
              src={p.logo_url}
              alt={p.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div
            key={p.id}
            className="h-16 md:h-20 max-w-[160px] flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md px-3 text-center"
          >
            {p.name}
          </div>
        )
      )}
    </div>
  );
};

/**
 * Public components
 * Use these in your pages:
 *  - <CorporatePartnershipLogoGrid />
 *  - <StudentClubPartnershipLogoGrid />
 *  - <UniversityClubPartnershipLogoGrid />
 */

export const CorporatePartnershipLogoGrid = () => (
  <BasePartnershipLogoGrid kind="corporate" />
);

export const StudentClubPartnershipLogoGrid = () => (
  <BasePartnershipLogoGrid kind="student_club" />
);

/**
 * Default export kept for backwards compatibility.
 * It behaves like the corporate partnerships grid.
 */
export default CorporatePartnershipLogoGrid;
