// ─── Field Validators ────────────────────────────────────────────────────────
export const validateEmail = (value) => {
  if (!value.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Please enter a valid email address.";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
};

export const validateFullName = (value) => {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 3) return "Name must be at least 3 characters.";
  return "";
};

// ─── Password Strength ───────────────────────────────────────────────────────
/**
 * Returns { score: 0‒4, label, color }
 * 0 = too short | 1 = weak | 2 = fair | 3 = good | 4 = strong
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length < 6)
    return { score: 0, label: "Too short", color: "bg-red-400" };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password))   score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = [
    { label: "Too short",  color: "bg-red-400"    },
    { label: "Weak",       color: "bg-red-400"    },
    { label: "Fair",       color: "bg-amber-400"  },
    { label: "Good",       color: "bg-blue-500"   },
    { label: "Strong",     color: "bg-green-500"  },
  ];

  return { score, ...levels[score] };
};