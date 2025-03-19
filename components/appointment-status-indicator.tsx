import clsx from 'clsx'; // or { cn } from '@/lib/utils'
import { AppointmentStatus } from '@prisma/client';
import React from 'react';
import Image from 'next/image';
import { StatusIcon } from '@/lib/constants';

export const AppointmentStatusIndicator = ({
  status,
}: {
  status: AppointmentStatus;
}) => {
  return (
    <div
      className={clsx("status-badge flex items-center justify-center gap-2 px-3 py-1 rounded-md min-w-[100px] text-center", {
        "bg-yellow-500/20 text-yellow-400": status === "PENDING",
        "bg-emerald-500/20 text-emerald-400": status === "SCHEDULED",
        "bg-red-500/20 text-red-400": status === "CANCELLED",
        "bg-blue-500/20 text-blue-400": status === "COMPLETED",
      })}
    >
      <Image
        src={StatusIcon[status]}
        alt={`${status} icon`}
        width={24}
        height={24}
        className="h-fit w-3"
      />
      
      <p
        className={clsx("text-sm font-medium capitalize", {
          "text-yellow-400": status === "PENDING",
          "text-emerald-400": status === "SCHEDULED",
          "text-red-400": status === "CANCELLED",
          "text-blue-400": status === "COMPLETED",
        })}
      >
        {status}
      </p>
    </div>
  );
};

export default AppointmentStatusIndicator;