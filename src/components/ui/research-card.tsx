import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Researcher = {
  name: string;
  role: string;
};

export type ResearchItem = {
  title: string;
  date: string;
  recommendation: string;
  company: string;
  researchers: Researcher[];
  pdfUrl: string; // path to the PDF in /public
};

interface ResearchCardProps {
  item: ResearchItem;
  className?: string;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ item, className }) => {
  return (
    <Card className={cn("p-8 bg-white border-border", className)}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side: text info */}
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-2 text-[hsl(var(--section-light-foreground))]">
            {item.title}
          </h3>

          <div className="space-y-1 text-sm text-[hsl(var(--section-light-foreground))]/70 mb-4">
            <div className="flex gap-2">
              <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                Date:
              </span>
              <span>{item.date}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                Recommendation:
              </span>
              <span>{item.recommendation}</span>
            </div>

            <div className="flex gap-2">
              <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                Company:
              </span>
              <span>{item.company}</span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-[hsl(var(--section-light-foreground))]/60 mb-1">
              Research by
            </p>
            <ul className="space-y-1 text-sm text-[hsl(var(--section-light-foreground))]/80">
              {item.researchers.map((researcher, idx) => (
                <li key={idx}>
                  <span className="font-medium text-[hsl(var(--section-light-foreground))]">
                    {researcher.name}
                  </span>{" "}
                  <span className="text-[hsl(var(--section-light-foreground))]/60">
                    ({researcher.role})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right side: PDF preview */}
        <div className="md:w-1/3">
          <div className="w-full h-48 md:h-64 rounded-md border border-border overflow-hidden bg-muted/10">
            {/* Simple PDF preview */}
            <iframe
              src={item.pdfUrl}
              title={item.title}
              className="w-full h-full"
            />
          </div>
          <p className="mt-2 text-xs text-[hsl(var(--section-light-foreground))]/60 text-center">
            Report preview
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ResearchCard;
