import Button from "@/component/ui/Button";
import { File01Icon, PencilEdit02Icon } from "hugeicons-react";
import DataCard from "@/component/features/DataCard";
import RecentCard from "@/component/features/RecentCard";

export default function DashboardContentLayout({ children }:Readonly<{
  children: React.ReactNode;
}>){
    return (
        <div className="w-ful">
            <div className="flex gap-3">
            <Button Icon={PencilEdit02Icon} variant={'secondary'} size={'sm'} className="font-serifs font-semibold text-lg bg-foreground">
                New Note
            </Button>

            <Button Icon={File01Icon} variant={'secondary'} size={'sm'} className="font-serifs font-semibold text-lg text-foreground">
                Import Markdown
            </Button>
            </div>

            <div className="grid grid-cols-4 gap-3 my-7 w-full">
                <DataCard/>
                <DataCard/>
                <DataCard/>
                <DataCard/>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                    <RecentCard/>
                </div>
                <div>
                    <RecentCard/>
                </div>
            </div>
            {children}
        </div>
    )
}