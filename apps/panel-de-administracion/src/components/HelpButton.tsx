import { useState, useRef, useEffect, type ReactNode } from "react";
import { IconButton } from "./IconButton";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

export interface HelpButtonProps {
  title: string;
  children: ReactNode;
}

export const HelpButton = ({ title, children }: HelpButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block ml-2" ref={popoverRef}>
      <IconButton
        icon={faQuestionCircle}
        ariaLabel="Ver ayuda"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-70 sm:max-w-sm p-4 bg-white rounded-md shadow-card z-50">
          {title && <h4 className="mb-1 label-normal text-dark-1">{title}</h4>}
          <div className="body-normal text-dark-3">{children}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
};
