import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Employee Login | Employee Management System",
  description: "Sign in to manage daily records.",
};

export default function EmployeeLoginPage() {
  return (
    <LoginForm
      role="employee"
      title="Employee Login"
      subtitle="Sign in to manage daily records."
      idLabel="Employee ID"
      idPlaceholder="e.g. EMP-1042"
      targetRoute="/employee"
    />
  );
}
