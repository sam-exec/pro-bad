import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Admin Login | Academy Management Portal",
  description: "Secure access for administrators and owners.",
};

export default function AdminLoginPage() {
  return (
    <LoginForm
      role="admin"
      title="Admin Login"
      subtitle="Secure access for administrators and owners."
      idLabel="Admin ID"
      idPlaceholder="e.g. ADM-001"
      targetRoute="/admin"
    />
  );
}
