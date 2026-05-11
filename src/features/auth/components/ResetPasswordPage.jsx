import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";

import { Button }       from "@/components/ui";
import { Input }        from "@/components/ui";
import { ErrorMessage } from "@/components/common";
import { ROUTES }       from "@/constants";
import authService      from "../services/authService";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import {
  validatePassword,
  validateConfirmPassword,
} from "../utils/validation";

const ResetPasswordPage = () => {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const [fields,  setFields]  = useState({ password: "", confirm: "" });
  const [errors,  setErrors]  = useState({ password: "", confirm: "" });
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = (name, value) => {
    if (name === "password") return validatePassword(value);
    if (name === "confirm")  return validateConfirmPassword(fields.password, value);
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((p) => ({ ...p, [name]: value }));
    if (touched[name])
      setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { password: true, confirm: true };
    const allErrors  = {
      password: validate("password", fields.password),
      confirm:  validate("confirm",  fields.confirm),
    };
    setTouched(allTouched);
    setErrors(allErrors);
    if (Object.values(allErrors).some(Boolean)) return;

    setLoading(true);
    setServerError("");
    try {
      await authService.resetPassword(token, fields.password);
      setDone(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ??
          "Reset link is invalid or expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Password updated!</h2>
          <p className="text-sm text-gray-500">
            Your password has been changed successfully. You can now sign in
            with your new credentials.
          </p>
        </div>
        <Button fullWidth size="lg" onClick={() => navigate(ROUTES.LOGIN)}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create new password
        </h1>
        <p className="text-sm text-gray-500">
          Your new password must be at least 8 characters long.
        </p>
      </div>

      {serverError && <ErrorMessage message={serverError} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <Input
            label="New password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <PasswordStrengthBar password={fields.password} />
        </div>

        <Input
          label="Confirm new password"
          name="confirm"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          value={fields.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirm ? errors.confirm : ""}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={loading}
          loadingText="Updating password..."
          rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
        >
          Update Password
        </Button>
      </form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  );
};

export default ResetPasswordPage;