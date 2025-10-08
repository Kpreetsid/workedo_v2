import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function AppLayout() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  console.log('user on app layout = ', user)

  useEffect(() => {
    // 🚫 If not logged in, redirect to login
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  return <Slot />; // render protected screens (overview, etc.)
}
