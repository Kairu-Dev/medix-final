import { getRole } from '@/utils/roles';
import { LayoutDashboard, List, ListOrdered, LucideIcon, Receipt, Settings, SquareActivity, User, UserRound, Users, UsersRound } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import LogoutButton from './logout-button';

// Import shadcn components
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

const ACCESS_LEVELS_ALL = [
  "admin",
  "doctor",
  "nurse",
  "lab technician",
  "physical therapist",
  "patient",
];

const SidebarIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon className="size-5 text-gray-300 group-hover:text-white transition-colors flex-shrink-0" />;
};

export const sidebar = async() => {
    const role = await getRole();

    const SIDEBAR_LINKS = [
      {
        label: "MENU",
        links: [
          {
            name: "Dashboard",
            href: "/",
            access: ACCESS_LEVELS_ALL,
            icon: LayoutDashboard,
          },
          {
            name: "Profile",
            href: "/patient/self",
            access: ["patient"],
            icon: User,
          },
        ],
      },
      {
        label: "Manage",
        links: [
          {
            name: "Users",
            href: "/record/users",
            access: ["admin"],
            icon: Users,
          },
          {
            name: "Doctors",
            href: "/record/doctors",
            access: ["admin"],
            icon: User,
          },
          {
            name: "Staffs",
            href: "/record/staffs",
            access: ["admin", "doctor"],
            icon: UserRound,
          },
          {
            name: "Patients",
            href: "/record/patients",
            access: ["admin", "doctor", "nurse"],
            icon: UsersRound,
          },
          {
            name: "Appointments",
            href: "/record/appointments",
            access: ["admin", "doctor", "nurse"],
            icon: ListOrdered,
          },
          {
            name: "Medical Records",
            href: "/record/medical-records",
            access: ["admin", "doctor", "nurse"],
            icon: SquareActivity,
          },
          {
            name: "Billing Overview",
            href: "/record/billing",
            access: ["admin", "doctor"],
            icon: Receipt,
          },
          {
            name: "Appointments",
            href: "/record/appointments",
            access: ["patient"],
            icon: ListOrdered,
          },
          {
            name: "Records",
            href: "/patient/self",
            access: ["patient"],
            icon: List,
          },
          {
            name: "Billing",
            href: "/record/billing/patient",
            access: ["patient"],
            icon: Receipt,
          },
          {
            name: "Referrals",
            href: "/doctor/referral-management",
            access: ["doctor"],
            icon: Receipt,
          },
        ],
      },
      {
        label: "System",
        links: [
          {
            name: "Settings",
            href: "/system-settings",
            access: ["admin", "doctor"],
            icon: Settings,
          },
        ],
      },
    ];
    
    return (
      <div className="sidebar w-full flex flex-col justify-between bg-gray-950 border-r border-gray-800 min-h-full shadow-xl">
        {/* Logo and Title */}
        <div className="px-3 lg:px-4 py-4 lg:py-5 border-b border-gray-800">
          <Link href="/" className="flex items-center justify-center lg:justify-start gap-2.5 group">
            <div className="relative flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-200">
              <SquareActivity size={20} className="text-white z-10" />
              <div className="absolute inset-0 bg-black opacity-20 rounded-lg"></div>
            </div>
            <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              MEDIX IHMS
            </span>
          </Link>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 py-2">
          <div className="px-2 lg:px-3 text-sm space-y-4">
            {SIDEBAR_LINKS.map((el) => {
              // Check if this section has any links the current user can access
              const hasAccessibleLinks = el.links.some(link => 
                link.access.includes(role.toLowerCase())
              );
              
              // Only render this section if it has at least one accessible link
              if (!hasAccessibleLinks) return null;

              return (
                <div key={el.label} className="space-y-3">
                  <div className="flex items-center px-2">
                    <span className="hidden lg:block text-xs text-green-500 font-bold uppercase tracking-wider">
                      {el.label}
                    </span>
                    <Separator className="hidden lg:block grow ml-2 bg-gray-800" />
                  </div>

                  <div className="space-y-1">
                    {el.links.map((link) => {
                      if (link.access.includes(role.toLowerCase())) {
                        return (
                          <TooltipProvider key={link.name} delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={link.href} 
                                  className="group flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 text-gray-300 rounded-md hover:bg-green-900/20 hover:text-white transition-all duration-200 ease-in-out relative min-h-[44px] touch-manipulation"
                                >
                                  <SidebarIcon icon={link.icon}/>
                                  <span className="hidden lg:block font-medium truncate">{link.name}</span>
                                  
                                  {/* Active indicator */}
                                  <div className="absolute left-0 w-1 h-0 group-hover:h-4/5 bg-green-500 rounded-r-full transition-all duration-300 ease-out"></div>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="lg:hidden">
                                {link.name}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* User role and Logout section */}
        <div className="mt-auto border-t border-gray-800">
          {/* Role indicator */}
          <div className="hidden lg:flex items-center px-4 py-3">
            <div className="flex items-center text-xs text-gray-400">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-900/30 mr-2 flex-shrink-0">
                <User size={12} className="text-green-500" />
              </div>
              <span className="truncate">
                Logged in as <span className="text-green-500 font-medium capitalize">{role.toLowerCase()}</span>
              </span>
            </div>
          </div>
          
          {/* Logout button */}
          <div className="p-3 lg:p-4 pt-0">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
};

export default sidebar;