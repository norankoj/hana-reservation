import { redirect } from "next/navigation";

// 첫 주소는 지금 받는 굿즈 주문으로. 면담 예약은 /interview 로 그대로 열림.
export default function Home() {
  redirect("/goods");
}
