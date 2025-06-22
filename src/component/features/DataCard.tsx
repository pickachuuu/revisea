import Card from "../ui/Card";
import { File01Icon } from "hugeicons-react";

export default function DataCard() {
  const mockData = {
    title: "Total Notes",
    value: 42,
    icon: <File01Icon/>,
  };

  return (
    <Card size={'md'} className="bg-background border-1 border-zinc-200">
      <Card.Header className="flex justify-between items-center gap-2 font-semibold text-xl">
        {mockData.title}
        {mockData.icon}
      </Card.Header>
      <Card.Content>
        <p className="text-lg font-bold">{mockData.value}</p>
      </Card.Content>
    </Card>
  );
}
