import { SignupForm } from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign up</h1>
      <SignupForm />
    </div>
  );
}