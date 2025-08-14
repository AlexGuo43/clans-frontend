import { LoginForm } from '@/components/LoginForm';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-sm text-center">
            <p className="font-medium text-blue-600 mb-2">Demo Credentials</p>
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> demo</p>
          </div>
        </CardContent>
      </Card>
      
      <LoginForm />
    </div>
  );
}