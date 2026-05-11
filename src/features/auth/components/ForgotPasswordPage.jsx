import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { ErrorMessage } from "@/components/common";
import { ROUTES } from "@/constants";
import authService from "../services/authService";
import { validateEmail } from "../utils/validation";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [serverError, setServerError] = useState("");

  const fieldError = touched ? validateEmail(email) : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    if (err) return;

    setLoading(true);
    setServerError("");
    setResetLink("");

    try {
      const response = await authService.forgotPassword(email);
      const token = response?.data?.data?.resetToken;
      if (token) {
        setResetLink(`${window.location.origin}${ROUTES.resetPassword(token)}`);
      }
      setSent(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            We sent a password reset link to{" "}
            <span className="font-medium text-gray-700">{email}</span>. It
            expires in 30 minutes.
          </p>
          {resetLink && (
            <div className="mt-3 text-left bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-2">Demo reset link</p>
              <a href={resetLink} className="text-blue-600 hover:underline break-all">
                {resetLink}
              </a>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Didn't receive it?{" "}
          <button
            onClick={() => { setSent(false); setTouched(false); setResetLink(""); }}
            className="text-blue-600 hover:underline underline-offset-2"
          >
            Try again
          </button>
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      {serverError && <ErrorMessage message={serverError} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (touched) setTouched(false); }}
          onBlur={() => setTouched(true)}
          error={fieldError}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={loading}
          loadingText="Sending link..."
          rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
        >
          Send Reset Link
        </Button>
      </form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
};

export default ForgotPasswordPage;