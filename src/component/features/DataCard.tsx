import Card from "../ui/Card";
import { File01Icon } from "hugeicons-react";

export default function DataCard() {
  const mockData = {
    title: "Total Notes",
    value: 42,
    icon: <File01Icon className="w-5 h-5" />,
  };

  return (
    <Card variant="default" size="sm" className="bg-surface">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground-muted">{mockData.title}</p>
          <p className="text-2xl font-bold text-foreground">{mockData.value}</p>
        </div>
        <div className="p-2 rounded-lg bg-accent-muted">
          {mockData.icon}
        </div>
      </div>
    </Card>
  );
}
