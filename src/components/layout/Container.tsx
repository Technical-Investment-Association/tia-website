import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container
 *
 * Single place to control max-width and horizontal padding.
 * Keeps content aligned to the same grid across pages.
 */
export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-[1440px] mx-auto px-5 sm:px-6 md:px-10 xl:px-[120px]",
        className,
      )}
    >
      {children}
    </div>
  );
};

