import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
}

export const Button = ({
  children,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const base =
    "flex w-full items-center justify-center px-6 py-3.5 rounded-lg label-large transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 gap-3 cursor-pointer";
  const variants = {
    primary: disabled
      ? "bg-brand-subtle text-white cursor-not-allowed"
      : "bg-brand-primary text-white hover:bg-brand-lighter active:bg-brand-darker focus:ring-brand-primary",
    secondary: disabled
      ? "bg-info-subtle text-white cursor-not-allowed"
      : "bg-info-primary text-white hover:bg-info-darker active:bg-info-darker focus:ring-info-primary",
    success: disabled
      ? "bg-success-subtle text-white cursor-not-allowed"
      : "bg-success-primary text-white hover:bg-success-darker active:bg-success-darker focus:ring-success-primary",
    error: disabled
      ? "bg-error-subtle text-white cursor-not-allowed"
      : "bg-error-primary text-white hover:bg-error-darker active:bg-error-darker focus:ring-error-primary",

    warning: disabled
      ? "bg-warning-subtle text-white cursor-not-allowed"
      : "bg-warning-primary text-white hover:bg-warning-darker active:bg-warning-darker focus:ring-warning-primary",

    info: disabled
      ? "bg-info-subtle text-white cursor-not-allowed"
      : "bg-info-primary text-white hover:bg-info-darker active:bg-info-darker focus:ring-info-primary",
  };

  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
