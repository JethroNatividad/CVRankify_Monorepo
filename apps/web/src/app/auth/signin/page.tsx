import LoginForm from "./_components/login-form";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your CVRankify account
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Sign In</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Enter your credentials to access your account.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
