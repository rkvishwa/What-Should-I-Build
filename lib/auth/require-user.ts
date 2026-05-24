import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/get-user";
import type { User } from "@supabase/supabase-js";

export async function requireUser(): Promise<
  { user: User } | { response: NextResponse }
> {
  const user = await getUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  return { user };
}
