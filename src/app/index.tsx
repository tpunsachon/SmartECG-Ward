import { Redirect } from "expo-router";

export default function Index() {
  // บังคับให้เปลี่ยนหน้าแรกเป็น /login ทันทีที่เปิดแอป
  return <Redirect href="/login" />;
}