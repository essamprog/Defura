// src/features/admin/pages/AdminSettingsPage.jsx
import { useState } from "react";
import { Save, Globe, Bell, Shield, Database, Mail, CheckCircle } from "lucide-react";

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, desc, defaultChecked = true }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`relative w-10 h-5 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
};

const Field = ({ label, defaultValue, type = "text" }) => (
  <div>
    <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  </div>
);

const AdminSettingsPage = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage global configuration for Defura-LMS</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <Section icon={Globe} title="General">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Platform Name" defaultValue="Defura-LMS" />
          <Field label="Support Email" defaultValue="support@defura.com" type="email" />
          <Field label="Default Language" defaultValue="English" />
          <Field label="Timezone" defaultValue="Africa/Cairo" />
        </div>
      </Section>

      <Section icon={Mail} title="Email Notifications">
        <Toggle label="Welcome email on registration" desc="Sent automatically when a user signs up" />
        <Toggle label="Course enrollment confirmation" desc="Notify students when they enroll" />
        <Toggle label="Certificate issued" desc="Email students when they earn a certificate" />
        <Toggle label="Instructor payout alerts" defaultChecked={false} desc="Notify instructors of payment processing" />
      </Section>

      <Section icon={Bell} title="System Notifications">
        <Toggle label="New user registrations" desc="Alert admins when new users join" />
        <Toggle label="New course submissions" desc="Alert when instructors submit courses for review" />
        <Toggle label="Failed payments" desc="Alert on payment failures" />
      </Section>

      <Section icon={Shield} title="Security">
        <Toggle label="Require email verification" desc="Users must verify email before accessing the platform" />
        <Toggle label="Two-factor authentication" defaultChecked={false} desc="Enforce 2FA for admin accounts" />
        <Toggle label="Session timeout (30 min)" desc="Automatically log out inactive users" />
        <div className="pt-2">
          <Field label="JWT Secret Rotation (days)" defaultValue="30" type="number" />
        </div>
      </Section>

      <Section icon={Database} title="Content & Storage">
        <Toggle label="Auto-publish approved courses" desc="Courses go live immediately after admin approval" defaultChecked={false} />
        <Toggle label="Allow free courses" desc="Instructors can offer free courses" />
        <Toggle label="Enable course reviews" desc="Students can leave ratings and reviews" />
        <div className="pt-2">
          <Field label="Max upload size (MB)" defaultValue="500" type="number" />
        </div>
      </Section>
    </div>
  );
};

export default AdminSettingsPage;
