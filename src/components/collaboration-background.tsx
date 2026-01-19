// src/components/CollaborationBackground.tsx

import { motion } from "framer-motion";

const nodes = [
  { id: 1, x: 18, y: 25, r: 3 },
  { id: 2, x: 40, y: 15, r: 2.5 },
  { id: 3, x: 68, y: 22, r: 3 },
  { id: 4, x: 28, y: 60, r: 2 },
  { id: 5, x: 55, y: 70, r: 3 },
  { id: 6, x: 80, y: 55, r: 2.5 },
];

const connections: [number, number][] = [
  [1, 2],
  [2, 3],
  [1, 4],
  [4, 5],
  [5, 6],
  [3, 6],
];

export const CollaborationBackground = () => {
  return (
    <div className="w-full h-full bg-[#f3f2ec]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        {/* Soft background gradient */}
        <defs>
          <radialGradient id="collabGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#e7e3d6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d6cfbe" stopOpacity="1" />
          </radialGradient>
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="url(#collabGradient)"
        />

        {/* Connections */}
        {connections.map(([fromId, toId], index) => {
          const from = nodes.find((n) => n.id === fromId)!;
          const to = nodes.find((n) => n.id === toId)!;

          return (
            <motion.line
              key={index}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#b6a892"
              strokeWidth={0.25}
              initial={{ opacity: 0.3, pathLength: 0.8 }}
              animate={{
                opacity: [0.25, 0.5, 0.25],
                pathLength: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 8 + index * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="#c6b9a1"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 6 + index,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
          />
        ))}
      </svg>
    </div>
  );
};
