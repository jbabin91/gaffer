import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({ component: AuthLayout });

function AuthLayout() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12">
      <Outlet />
    </main>
  );
}
