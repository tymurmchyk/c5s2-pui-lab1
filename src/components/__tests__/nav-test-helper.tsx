import { useEffect } from "react";
import { useAuth } from "@/backend";
import Navigation from "../Navigation";

export function LoginAndNav() {
  const { login } = useAuth();
  useEffect(() => {
    login("demo@example.com", "demo");
  }, [login]);
  return <Navigation />;
}
