import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AnalyticsProps {
  data: any[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 h-[250px] sm:h-[300px] flex flex-col gap-2 sm:gap-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#8E9299]">Sensor Activity Fusion</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff30" 
                fontSize={10} 
                tickFormatter={(val) => val.split(':')[1] + ':' + val.split(':')[2]}
              />
              <YAxis stroke="#ffffff30" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid #ffffff10', fontSize: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="vibration" 
                stroke="#00A3FF" 
                fillOpacity={1} 
                fill="url(#colorVib)" 
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke="#00FF9D" 
                fillOpacity={0.1} 
                fill="#00FF9D" 
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 h-[250px] sm:h-[300px] flex flex-col gap-2 sm:gap-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#8E9299]">Risk Probability Index</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#ffffff30" 
                fontSize={10}
                tickFormatter={(val) => val.split(':')[1] + ':' + val.split(':')[2]}
              />
              <YAxis stroke="#ffffff30" fontSize={10} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid #ffffff10', fontSize: '10px' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="risk" 
                stroke="#FF4444" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
