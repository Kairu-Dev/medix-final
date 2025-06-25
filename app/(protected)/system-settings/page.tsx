import { ServiceSettings } from "@/components/settings/services-settings";
import { KeywordManagement } from "@/components/keyword-management";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { checkRole } from "@/utils/roles";

const SystemSettingPage = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const cat = (searchParams?.cat || "services") as string;

  // Check user roles
  const isAdmin = await checkRole("ADMIN");
  const isDoctor = await checkRole("DOCTOR");

  // Define categories with role requirements
  const allCategories = [
    { 
      id: "services", 
      label: "Services", 
      description: "Manage system services",
      allowedRoles: ["ADMIN"] // Only admins can see services
    },
    { 
      id: "keywords", 
      label: "Keywords", 
      description: "Manage symptom keywords",
      allowedRoles: ["ADMIN", "DOCTOR"] // Doctors and admins can see keywords
    },
  ];

  // Filter categories based on user roles
  const categories = allCategories.filter(category => {
    if (category.allowedRoles.includes("ADMIN") && isAdmin) return true;
    if (category.allowedRoles.includes("DOCTOR") && isDoctor) return true;
    return false;
  });

  // If no categories are available for the user, show access denied
  if (categories.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <Card className="shadow-none rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access system settings.
          </p>
        </Card>
      </div>
    );
  }

  // Check if current category is accessible to user
  const currentCategory = categories.find(c => c.id === cat);
  const effectiveCat = currentCategory ? cat : categories[0].id;

  return (
    <div className="p-6 flex flex-col lg:flex-row w-full min-h-screen gap-10">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-[25%] flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-4">System Settings</h2>
        {categories.map((category) => (
          <Link key={category.id} href={`?cat=${category.id}`}>
            <Button
              variant={effectiveCat === category.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 flex-col items-start",
                effectiveCat === category.id && "bg-primary text-primary-foreground"
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
          {/* Services - Admin only */}
          {effectiveCat === "services" && isAdmin && <ServiceSettings />}
          
          {/* Keywords - Doctor and Admin only */}
          {effectiveCat === "keywords" && (isDoctor || isAdmin) && <KeywordManagement />}
          
          {/* Fallback for unauthorized access to specific category */}
          {effectiveCat === "services" && !isAdmin && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Only administrators can access service settings.
              </p>
            </div>
          )}
          
          {effectiveCat === "keywords" && !isDoctor && !isAdmin && (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Only doctors and administrators can access keyword management.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SystemSettingPage;