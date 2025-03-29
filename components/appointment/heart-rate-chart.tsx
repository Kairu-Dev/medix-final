"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DataProps {
  average: string;
  data: {
    label: string;
    value1: number;
    value2: number;
  }[];
}

export function HeartRateChart({ average, data }: DataProps) {
  const lastData = data[data.length - 1];

  return (
    <Card className="py-6 px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm col-span-2">
      
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>

      <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
      
      <CardHeader  className="relative z-10">
        <CardTitle className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase">Heart Rate</CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex justify-between items-center mb-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div>
            <p className="text-lg xl:text-xl font-semibold text-emerald-200 font-mono">
              {lastData?.value1 || 0}-{lastData?.value2 || 0}
            </p>
            <p className="text-sm text-emerald-300/80">Recent Reading</p>
          </div>
          <div>
            <p className="text-lg xl:text-xl font-semibold text-emerald-200 font-mono">{average}</p>
            <p className="text-sm text-emerald-300/80">Average Rate</p>
          </div>
          <VisuallyHidden>
          <Button 
            variant={"outline"} 
            size={"sm"}
            className="bg-emerald-900/70 text-emerald-100 border-emerald-500/40 hover:bg-emerald-800/60 hover:text-emerald-50 transition-colors duration-200"
          >
            See Insight
          </Button>
          </VisuallyHidden>
        </div>

        <div className="bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#34d399"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tick={{ fill: "#a7f3d0" }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#a7f3d0" }}
              tickLine={false}
            />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "rgba(6, 78, 59, 0.8)", 
                  borderRadius: "10px", 
                  borderColor: "#10b981",
                  color: "#ecfdf5" 
                }}
              />
            <Line
              type="monotone"
              dataKey="value1"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}