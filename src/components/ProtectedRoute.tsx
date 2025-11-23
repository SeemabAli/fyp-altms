"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
  allowedRoles?: string[]; 
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (
      allowedRoles &&
      (!session.user?.role || !allowedRoles.includes(session.user.role))
    ) {
      router.push("/unauthorized");
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading") return <p>Loading...</p>;

  return <>{children}</>;
}
