import Card from "../ui/Card";
import { File01Icon } from "hugeicons-react";

export default function RecentCard() {
  return (
    <Card size={'auto'} className="bg-background border-1 border-zinc-200">
        <Card.Header className="font-semibold text-xl">
            Recent Cards
        </Card.Header>

        <Card.Subtitle className="">
            Your recently modified cards
        </Card.Subtitle>
    </Card>
  );
}
