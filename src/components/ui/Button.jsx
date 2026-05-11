import { forwardRef } from "react";
import Spinner from "./Spinner";

// ─── Variants ──────────────────────────────────────────────────────────────
const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-200 disabled:bg-blue-300",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
  outline:
    "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-200 disabled:bg-red-300",
  ghost:
    "text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50",
  link:
    "text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline disabled:opacity-50 p-0 h-auto",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm shadow-green-200 disabled:bg-green-300",
};

// ─── Sizes ────────────────────────────────────────────────────────────────
const sizes = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  xl: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
  "icon-lg": "h-12 w-12 p-0",
};

// ─── Component ────────────────────────────────────────────────────────────
const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = "rounded-lg",
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md,
          rounded,
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" color={variant === "primary" || variant === "danger" || variant === "success" ? "white" : "blue"} />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;