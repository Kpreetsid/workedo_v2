import React from "react";
import { View, StyleSheet, Text } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import { useUserFormStore } from "@/src/store/useUserFormStore";

// 🧩 Inline field components for render isolation
const UsernameInput = React.memo(() => {
  const username = useUserFormStore((s: any) => s.username);
  const setFormValue = useUserFormStore((s: any) => s.setFormValue);

  console.log("Render → UsernameInput", username);

  return (
    <FormInput
      label="Username"
      placeholder="Enter Username"
      value={username}
      onChangeText={(text: string) => setFormValue("username", text)}
    />
  );
});

const EmailInput = React.memo(() => {
  const email = useUserFormStore((s: any) => s.email);
  const setFormValue = useUserFormStore((s: any) => s.setFormValue);

  console.log("Render → EmailInput", email);

  return (
    <FormInput
      label="Email"
      placeholder="Enter Email"
      value={email}
      onChangeText={(text: string) => setFormValue("email", text)}
    />
  );
});

export default function ZustandFormTest() {
  console.log("Render → ZustandFormTest (parent)");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zustand Test Form</Text>
      <UsernameInput />
      <EmailInput />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
});
