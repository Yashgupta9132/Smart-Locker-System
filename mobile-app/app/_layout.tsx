import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack screenOptions={{title:'Smart Locker System'}}>
    <Stack.Screen name="(tabs)" />
  </Stack>
  )
};
