'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Random position generator for nodes
const getRandomPos = () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
});

export function KineticDiagram() {
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    // Generate initial nodes
    const initialNodes = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      ...getRandomPos(),
    }));
    setNodes(initialNodes);
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-[#FDFCF8] rounded-3xl overflow-hidden border border-[#E5E0D5]/50 shadow-inner">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating Nodes */}
      {nodes.map((node, i) => (
        <Node key={node.id} index={i} total={nodes.length} />
      ))}

      {/* Central "Core" Node */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
      >
        <div className="w-16 h-16 bg-[#C2410C]/10 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-[#C2410C] rounded-full animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}

function Node({ index, total }: { index: number; total: number }) {
  // Calculate orbital position
  const angle = (index / total) * Math.PI * 2;
  const radius = 120; // Base radius from center

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
    >
      {/* Connection Line */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-[1px] bg-gray-300 origin-left"
        style={{ width: radius, x: 0, y: 0, rotate: `${(angle * 180) / Math.PI + 180}deg` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
      />

      {/* The Node Itself */}
      <motion.div
        className="relative -ml-6 -mt-6 w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: Math.random() * 2,
        }}
      >
        <div className="w-6 h-1 bg-gray-200 rounded-full" />
      </motion.div>
    </motion.div>
  );
}
