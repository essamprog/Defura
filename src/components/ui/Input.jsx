import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const sizes = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-sm px-3.5",
  lg: "h-12 text-base px-4",
};

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = "md",
      type = "text",
      fullWidth = true,
      required,
      className = "",
      containerClassName = "",
      labelClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    const hasLeft = !!leftIcon;
    const hasRight = !!rightIcon || isPassword;

    return (
      <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : "", containerClassName].filter(Boolean).join(" ")}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={["text-sm font-medium text-gray-700", labelClassName].filter(Boolean).join(" ")}
          >
            {label}
            {required && <span className="text-red-500 mr-0.5">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Left Icon */}
          {hasLeft && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={[
              "w-full rounded-lg border bg-white text-gray-800 placeholder-gray-400 transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
              "read-only:bg-gray-50",
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-gray-400",
              sizes[size] ?? sizes.md,
              hasLeft ? "pr-10" : "",
              hasRight ? "pl-10" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {(hasRight) && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {isPassword ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              ) : (
                <span className="pointer-events-none">{rightIcon}</span>
              )}
            </span>
          )}
        </div>

        {/* Error / Hint */}
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;