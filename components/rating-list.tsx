import React from 'react';
import { Sparkles } from 'lucide-react';

const GenshinPrimogem = (props) => {
  const { filled } = props;
  // Custom Primogem SVG
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path 
        d="M12 2L15.5 8.5L22 9.5L17 14.5L18.5 21L12 18L5.5 21L7 14.5L2 9.5L8.5 8.5L12 2Z" 
        fill={filled ? "#00c2b8" : "transparent"} 
        stroke={filled ? "#00c2b8" : "#6b7280"} 
        strokeWidth="1.5"
      />
    </svg>
  );
};

const RatingList = ({ data }) => {
  return (
    <div className="bg-black-800 rounded-lg mt-6 border border-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="sub-header text-white">Patient Reviews</h1>
      </div>

      <div className="space-y-3 p-4">
        {data?.map((rate) => (
          <div 
            key={rate?.id} 
            className="bg-black-800 p-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 border border-gray-800"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <p className="text-base font-medium text-white">
                  {rate?.patient?.first_name + " " + rate?.patient?.last_name}
                </p>
                <span className="text-sm text-gray-400">
                  {new Date(rate?.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <GenshinPrimogem key={index} filled={index < rate.rating} />
                  ))}
                </div>
                <span className="text-teal-400 font-medium mt-1">{rate.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}

        {data?.length === 0 && (
          <div className="px-2 py-8 text-gray-400 text-center flex flex-col items-center">
            <Sparkles size={24} className="mb-2 text-gray-500" />
            <p>No Reviews Yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingList;