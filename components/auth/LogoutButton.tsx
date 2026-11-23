import { signOut } from "@/app/(auth)/actions";

// A plain form posting to a Server Action: works without JavaScript.
export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded px-2 py-1 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-gray-800"
      >
        Log out
      </button>
    </form>
  );
}
