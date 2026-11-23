import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireUser } from "@/lib/session";

// Server Component: reads the session, so it renders inside <Suspense>.
export async function TodosHeader() {
  const user = await requireUser();

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
      <span>{user.name}</span>
      <LogoutButton />
    </div>
  );
}
