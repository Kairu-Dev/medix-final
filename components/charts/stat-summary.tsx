"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Users } from "lucide-react";
import { formatNumber } from "@/utils";
 /* eslint-disable */

export const StatSummary = ({ data, total }: { data: any; total: number }) => {
  const appointment = data?.PENDING + data?.SCHEDULED || 0;
  const consultation = data?.COMPLETED || 0;
  
  // Calculate total for percentage calculation
  const totalInteractions = appointment + consultation;
  
  // Calculate percentages
  const appointmentPercentage = totalInteractions > 0 
    ? (appointment / totalInteractions) * 100 
    : 0;
  
  const consultationPercentage = totalInteractions > 0 
    ? (consultation / totalInteractions) * 100 
    : 0;
  
  const dataInfo = [
    { name: "Total", count: 100, fill: "#fde68a" },
    {
      name: "Appointments",
      count: appointmentPercentage,
      fill: "#48d380",
    },
    { name: "Consultation", count: consultationPercentage, fill: "#2563eb" },
  ];

  return (
    <div className="bg-black-800 rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Summary</h1>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="font-normal text-xs"
        >
          <Link href="/record/appointments">See details</Link>
        </Button>
      </div>

      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={dataInfo}
          >
            <RadialBar background dataKey={"count"} />
          </RadialBarChart>
        </ResponsiveContainer>

        <Users
          size={30}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-300"
        />
      </div>

      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-400 rounded-xl" />
            <h1 className="font-bold">{formatNumber(appointment)}</h1>
          </div>
          <h2 className="text-xs text-gray-400">
            {dataInfo[1].name}({appointmentPercentage.toFixed(0)}%)
          </h2>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#2563eb] rounded-xl" />
            <h1 className="font-bold">{formatNumber(consultation)}</h1>
          </div>

          <h2 className="text-xs text-gray-400">
            {dataInfo[2].name}({consultationPercentage.toFixed(0)}%)
          </h2>
        </div>
      </div>
    </div>
  );
};