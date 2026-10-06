import { redirect } from "next/navigation";

// 예약 종류가 늘어나면 여기를 목록 페이지로 바꾸면 됩니다.
export default function Home() {
  redirect("/interview");
}
