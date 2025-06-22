import Button from "@/component/ui/Button";
import { File01Icon, PencilEdit02Icon } from "hugeicons-react";

export default function DashboardContentLayout({ children }:Readonly<{
  children: React.ReactNode;
}>){
    return (
        <div className="">
            <div className="flex gap-3">
            <Button Icon={PencilEdit02Icon} variant={'secondary'} size={'sm'} className="font-serifs font-semibold text-lg bg-foreground">
                New Note
            </Button>

            <Button Icon={File01Icon} variant={'secondary'} size={'sm'} className="font-serifs font-semibold text-lg text-foreground">
                Import Markdown
            </Button>
            </div>

            {children}
        </div>
    )
}