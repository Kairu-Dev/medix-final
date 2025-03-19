"use client";

import { AppointmentsChartProps } from "@/types/data-types";
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Legend,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataProps {
  data: AppointmentsChartProps;
}
export const AppointmentChart = ({ data }: DataProps) => {
  return (
    <div className="bg-black-800 rounded-xl p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="header">Appointments</h1>
      </div>

      <ResponsiveContainer width={"100%"} height="90%">
        <BarChart width={100} height={300} data={data} barSize={25}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />

          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#4fd1c5" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#9ca3af" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "#fff", backgroundColor: "#000A12" }}
            // ADDED: This single line controls the gray highlight that appears when hovering
            // You can change 'rgba(74, 85, 104, 0.2)' to any color with transparency:
            // - First 3 numbers (74, 85, 104) represent the color (currently a slate gray)
            // - The last number (0.2) controls transparency (0.1 = very faint, 0.9 = very solid)
            cursor={{ fill: 'rgba(74, 85, 104, 0.2)' }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{
              paddingTop: "20px",
              paddingBottom: "40px",
              textTransform: "capitalize",
            }}
          />
          <Bar
            dataKey="appointment"
            fill="#32CD32"
            legendType="circle"
            radius={[10, 10, 0, 0]}
            
          />
          <Bar
            dataKey="completed"
            fill="#4169E1"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};