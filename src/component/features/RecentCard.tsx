import Card from "../ui/Card";
import { File01Icon } from "hugeicons-react";

export default function RecentCard() {
  return (
    <Card variant="default" size="md" className="bg-surface">
      <Card.Header>
        <Card.Title>Recent Cards</Card.Title>
        <Card.Description>Your recently modified cards</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-muted transition-colors">
            <File01Icon className="w-4 h-4 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium">JavaScript Basics</p>
              <p className="text-xs text-foreground-muted">Updated 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-muted transition-colors">
            <File01Icon className="w-4 h-4 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium">React Hooks</p>
              <p className="text-xs text-foreground-muted">Updated 4 hours ago</p>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
