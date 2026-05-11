import { useState } from "react";

const Tabs = ({
  tabs = [],
  defaultIndex = 0,
  onChange,
  variant = "underline",
  className = "",
}) => {
  const [active, setActive] = useState(defaultIndex);

  const handleChange = (index) => {
    if (tabs[index]?.disabled) return;
    setActive(index);
    onChange?.(index, tabs[index]);
  };

  const isUnderline = variant === "underline";
  const isPill = variant === "pill";

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        className={[
          "flex items-center gap-1",
          isUnderline
            ? "border-b border-gray-200"
            : "bg-gray-100 rounded-xl p-1 w-fit",
        ].join(" ")}
      >
        {tabs.map((tab, index) => {
          const isActive = active === index;
          const Icon = tab.icon;

          return (
            <button
              key={index}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => handleChange(index)}
              className={[
                "inline-flex items-center gap-2 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed",
                isUnderline
                  ? [
                      "px-1 pb-3 pt-1 border-b-2 -mb-px",
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    ].join(" ")
                  : [
                      "px-3 py-1.5 rounded-lg",
                      isActive
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    ].join(" "),
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={[
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-500",
                  ].join(" ")}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs[active]?.content}
      </div>
    </div>
  );
};

export default Tabs;