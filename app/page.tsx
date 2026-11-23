import { Suspense } from "react";

import { RedirectBySession } from "@/components/auth/RedirectBySession";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectBySession />
    </Suspense>
  );
}
