import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Employee Login | Academy Management Portal",
  description: "Sign in to access your workspace.",
};

export default function EmployeeLoginPage() {
  return (
    <LoginForm
      role="employee"
      title="Employee Login"
      subtitle="Sign in to access your workspace."
      idLabel="Employee ID"
      idPlaceholder="Enter your Employee ID"
      targetRoute="/employee"
    />
  );
}
