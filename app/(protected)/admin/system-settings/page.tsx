import { ServiceSettings } from "@/components/settings/services-settings";
import { KeywordManagement } from "@/components/keyword-management";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SystemSettingPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const cat = (searchParams?.cat || "services") as string;

  const categories = [
    { id: "services", label: "Services", description: "Manage system services" },
    { id: "keywords", label: "Keywords", description: "Manage symptom keywords" },
  ];

  return (
    <div className="p-6 flex flex-col lg:flex-row w-full min-h-screen gap-10">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-[25%] flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-4">System Settings</h2>
        {categories.map((category) => (
          <Link key={category.id} href={`?cat=${category.id}`}>
            <Button
              variant={cat === category.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 flex-col items-start",
                cat === category.id && "bg-primary text-primary-foreground"
              )}
            >
              <span className="font-medium">{category.label}</span>
              <span className="text-sm opacity-80">{category.description}</span>
            </Button>
          </Link>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full lg:w-[75%] flex flex-col gap-4">
        <Card className="shadow-none rounded-xl p-6">
          {cat === "services" && <ServiceSettings />}
          {cat === "keywords" && <KeywordManagement />}
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingPage;