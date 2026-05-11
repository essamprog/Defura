import { getPasswordStrength } from "../utils/validation";

const PasswordStrengthBar = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Segments */}
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? color : "bg-gray-200",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Label */}
      <p
        className={[
          "text-xs font-medium transition-colors",
          score <= 1 ? "text-red-500"
          : score === 2 ? "text-amber-500"
          : score === 3 ? "text-blue-600"
          : "text-green-600",
        ].join(" ")}
      >
        {label}
      </p>

      {/* Hints */}
      {score < 4 && (
        <ul className="text-xs text-gray-400 space-y-0.5 list-none">
          {password.length < 8    && <li>· At least 8 characters</li>}
          {!/[A-Z]/.test(password) && <li>· One uppercase letter</li>}
          {!/\d/.test(password)    && <li>· One number</li>}
          {!/[^A-Za-z0-9]/.test(password) && <li>· One special character</li>}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthBar;