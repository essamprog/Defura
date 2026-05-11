import { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  debounce    = 400,
  isLoading   = false,
  size        = "md",
  className   = "",
  autoFocus   = false,
}) => {
  const inputRef = useRef(null);
  const [internal, setInternal] = useState(value ?? "");
  const debounced = useDebounce(internal, debounce);

  // Propagate debounced value
  useEffect(() => {
    onChange?.(debounced);
    onSearch?.(debounced);
  }, [debounced]);

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const heights = { sm: "h-9 text-sm", md: "h-10 text-sm", lg: "h-12 text-base" };

  return (
    <div className={`relative ${className}`}>
      {/* Left icon */}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Search className="w-4 h-4" />}
      </span>

      <input
        ref={inputRef}
        type="search"
        value={internal}
        onChange={e => setInternal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSearch?.(internal); }}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400",
          "pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "transition-all duration-150 shadow-sm",
          heights[size] ?? heights.md,
          internal ? "pr-16" : "pr-10",
        ].join(" ")}
      />

      {/* Clear button */}
      {internal && (
        <button
          type="button"
          onClick={() => { setInternal(""); onChange?.(""); onSearch?.(""); inputRef.current?.focus(); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;