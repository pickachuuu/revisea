import Card from "../component/ui/Card";
import Button from "../component/ui/Button";
import { GoogleGeminiIcon, ChromeIcon, GithubIcon, GoogleIcon } from "hugeicons-react";

export default function Home() {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <Card.Header className="font-serif">
            Sign in to Stendhal.
          </Card.Header>

          <Card.Content>
            <Button className="my-2" Icon={GithubIcon}>
              Login with Github
            </Button>

            <Button className="my-2" Icon={GoogleIcon}>
              Login with Google
            </Button>

          </Card.Content>
        </Card>
      </div>
  );
}
