import { Chat }  from "@/components/Chat";
import { randomString } from "@/lib/randomString";

export default function Home() {
  return (
    <main>
      <Chat chatId={randomString(32)} />
    </main>
  );
}
