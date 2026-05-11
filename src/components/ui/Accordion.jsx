import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultOpen = [],
  className = "",
}) => {
  const [openItems, setOpenItems] = useState(new Set(defaultOpen));

  const toggle = (index) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={["divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden bg-white", className].filter(Boolean).join(" ")}>
      {items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div key={index}>
            {/* Trigger */}
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-right hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon && (
                  <span className="shrink-0 text-gray-400">{item.icon}</span>
                )}
                <span className="text-sm font-medium text-gray-800 text-right">
                  {item.title}
                </span>
                {item.badge && (
                  <span className="mr-auto text-xs text-gray-400 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
              <ChevronDown
                className={[
                  "w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200",
                  isOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {/* Content */}
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                <div className="pt-3">{item.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;