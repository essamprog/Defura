import { useRef, useState } from "react";
import { User, Mail, Lock, Camera, Save, AlertCircle, CheckCircle, Globe } from "lucide-react";

// Inline SVG brand icons (removed from lucide-react v1.x)
const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { Button, Input, Avatar, Tabs } from "@/components/ui";
import { useAuthStore, useUIStore } from "@/store";
import profileService from "../services/profileService";

// ─── Tab panels ───────────────────────────────────────────────────────────────
const ProfileTab = ({ user, onSave, isSaving = false, serverError = "" }) => {
  // Use full_name with fallback to name for compatibility
  const displayName = user?.full_name ?? user?.name ?? "";

  const [fields, setFields] = useState({
    full_name: displayName,
    email: user?.email ?? "",
    bio: user?.bio ?? "",
    website: user?.website ?? "",
    linkedin: user?.linkedin ?? "",
    github: user?.github ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(fields);
    setSaving(false);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-5">
      {serverError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" name="full_name" value={fields.full_name} onChange={e => setFields(p => ({ ...p, full_name: e.target.value }))} leftIcon={<User className="w-4 h-4" />} required />
        <Input label="Email Address" name="email" type="email" value={fields.email} onChange={e => setFields(p => ({ ...p, email: e.target.value }))} leftIcon={<Mail className="w-4 h-4" />} required />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
        <textarea
          value={fields.bio}
          onChange={e => setFields(p => ({ ...p, bio: e.target.value }))}
          rows={3}
          placeholder="Tell us a little about yourself..."
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Website" name="website" placeholder="https://yoursite.com" value={fields.website} onChange={e => setFields(p => ({ ...p, website: e.target.value }))} leftIcon={<Globe className="w-4 h-4" />} />
        <Input label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/you" value={fields.linkedin} onChange={e => setFields(p => ({ ...p, linkedin: e.target.value }))} leftIcon={<LinkedinIcon className="w-4 h-4" />} />
        <Input label="GitHub" name="github" placeholder="github.com/you" value={fields.github} onChange={e => setFields(p => ({ ...p, github: e.target.value }))} leftIcon={<GithubIcon className="w-4 h-4" />} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} isLoading={saving} loadingText="Saving..." leftIcon={!saving && <Save className="w-4 h-4" />}>
          Save Changes
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" /> Profile saved!
          </div>
        )}
      </div>
    </div>
  );
};

const PasswordTab = ({ onSave, isSaving = false, serverError = "" }) => {
  const [fields, setFields] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (fields.next !== fields.confirm) { setError("New passwords do not match."); return; }
    if (fields.next.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setSaving(true);

    const successResponse = await onSave({ current: fields.current, next: fields.next });
    setSaving(false);

    if (successResponse) {
      setSuccess(true);
      setFields({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      {(serverError || error) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {serverError || error}
        </div>
      )}
      <Input label="Current Password" name="current" type="password" value={fields.current} onChange={e => setFields(p => ({ ...p, current: e.target.value }))} leftIcon={<Lock className="w-4 h-4" />} />
      <Input label="New Password" name="next" type="password" value={fields.next} onChange={e => setFields(p => ({ ...p, next: e.target.value }))} leftIcon={<Lock className="w-4 h-4" />} hint="Min 8 characters with uppercase & number" />
      <Input label="Confirm New Password" name="confirm" type="password" value={fields.confirm} onChange={e => setFields(p => ({ ...p, confirm: e.target.value }))} leftIcon={<Lock className="w-4 h-4" />} />
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} isLoading={saving || isSaving} loadingText="Updating...">Update Password</Button>
        {success && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Password updated!</span>}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { showSuccess } = useUIStore();

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Unified display name: prefer full_name, fall back to name
  const displayName   = user?.full_name ?? user?.name ?? "Your Name";
  const displayAvatar = user?.profile_picture ?? user?.avatar;

  const handleSaveProfile = async (fields) => {
    setProfileLoading(true);
    setProfileError("");

    try {
      const { data } = await profileService.updateProfile({
        full_name: fields.full_name,
        email: fields.email,
        bio: fields.bio,
      });

      updateUser(data.data?.user ?? data.user ?? fields);
      showSuccess("Profile updated successfully!");
      return true;
    } catch (err) {
      setProfileError(err.response?.data?.message ?? "Failed to save profile.");
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (payload) => {
    setPasswordLoading(true);
    setPasswordError("");

    try {
      await profileService.changePassword(payload);
      showSuccess("Password updated successfully!");
      return true;
    } catch (err) {
      setPasswordError(err.response?.data?.message ?? "Failed to change password.");
      return false;
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const { data } = await profileService.uploadAvatar(file);
      // avatar.php returns: { data: { avatar: "url" } }
      const newAvatar = data.data?.avatar ?? data.data?.profile_picture;
      updateUser({ profile_picture: newAvatar, avatar: newAvatar });
      showSuccess("Avatar uploaded successfully!");
    } catch (err) {
      setProfileError(err.response?.data?.message ?? "Failed to upload avatar.");
    } finally {
      setAvatarLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Profile Header ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar with upload */}
        <div className="relative shrink-0">
          <Avatar src={displayAvatar} name={displayName} size="2xl" />
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={avatarLoading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Info */}
        <div className="text-center sm:text-right flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
              {user?.role ?? "student"}
            </span>
            {user?.created_at && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                Member since {new Date(user.created_at).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <Tabs
          variant="underline"
          tabs={[
            {
              label: "Profile Info",
              content: <div className="pt-5"><ProfileTab user={user} onSave={handleSaveProfile} isSaving={profileLoading} serverError={profileError} /></div>,
            },
            {
              label: "Password",
              content: <div className="pt-5"><PasswordTab onSave={handleChangePassword} isSaving={passwordLoading} serverError={passwordError} /></div>,
            },
            {
              label: "Notifications",
              content: (
                <div className="pt-5 space-y-4">
                  {[
                    { label: "Course updates", desc: "Get notified when course content is updated" },
                    { label: "New certificates", desc: "Receive alerts when you earn a certificate" },
                    { label: "Promotions & offers", desc: "Occasional discounts on new courses" },
                    { label: "Weekly digest", desc: "A weekly summary of your learning progress" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>

    </div>
  );
};

export default ProfilePage;