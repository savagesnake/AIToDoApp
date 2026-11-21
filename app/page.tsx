import { redirect } from "next/navigation";

// TODO(auth): redirect to /login when there's no session (SPEC.md §4).
export default function Home() {
  redirect("/todos");
}
