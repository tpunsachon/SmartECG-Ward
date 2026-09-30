import { Redirect } from "expo-router";

export default function Index() {
  // สั่งให้สแกนเปิดแอปแล้วเด้งไปหน้า Login ทันที
  return <Redirect href="/login" />;
}