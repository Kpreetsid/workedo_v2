import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function AuthLayout() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // ✅ If a user is already stored, skip auth screens and go to overview
    if (user) {
      router.replace("/overview");
    }
  }, [user]);

  return <Slot />; // render nested pages (login, register, etc.)
}
