// src/components/PartnershipLogoGrid.tsx
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

type PartnershipKind = "corporate" | "student_club";

type PartnershipLogo = {
  id: string;
  name: string;
  logo_url?: string | null;
  website?: string | null;
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
          website: d.data().website ?? null,
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

  const n = partners.length;
  const fullRows = Math.floor(n / 6);
  const lastRowSize = n % 6;

  const getColStart = (index: number) => {
    const inLastRow = index >= fullRows * 6;
    const rowSize = inLastRow ? lastRowSize : 6;
    const pos = inLastRow ? index - fullRows * 6 : index % 6;
    if (rowSize === 6) return 1 + pos * 2;
    if (rowSize === 5) return 2 + pos * 2;
    if (rowSize === 4) return 3 + pos * 2;
    if (rowSize === 3) return 4 + pos * 2;
    if (rowSize === 2) return 5 + pos * 2;
    return 6; // rowSize === 1
  };

  const colStartClass: Record<number, string> = {
    1: "md:col-start-1",
    2: "md:col-start-2",
    3: "md:col-start-3",
    4: "md:col-start-4",
    5: "md:col-start-5",
    6: "md:col-start-6",
    7: "md:col-start-7",
    8: "md:col-start-8",
    9: "md:col-start-9",
    10: "md:col-start-10",
    11: "md:col-start-11",
  };

  return (
    <div className="mt-10 grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10 md:gap-x-8 justify-items-center items-center">
      {partners.map((p, i) => {
        const href = p.website?.trim()
          ? /^https?:\/\//i.test(p.website)
            ? p.website
            : `https://${p.website}`
          : null;
        const content = p.logo_url ? (
          <img
            src={p.logo_url}
            alt={p.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs text-muted-foreground text-center border border-dashed rounded-md px-3 py-2 inline-block">
            {p.name}
          </span>
        );
        const wrapperClass =
          "h-16 md:h-20 w-full max-w-[200px] flex items-center justify-center col-span-1 md:col-span-2 " +
          (colStartClass[getColStart(i)] ?? "");
        return (
          <div key={p.id} className={wrapperClass}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full w-full flex items-center justify-center hover:opacity-80 transition-opacity"
                title={`Visit ${p.name}`}
              >
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}
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
