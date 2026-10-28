import React from 'react';
import { motion } from 'framer-motion';

interface MotionText3DProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  depth?: number;
}

export const MotionText3D: React.FC<MotionText3DProps> = ({
  children,
  delay = 0,
  className = '',
  depth = -60,
}) => {
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        initial={{
          opacity: 0,
          rotateX: 45,
          y: 30,
          z: depth,
          filter: 'blur(6px)',
        }}
        animate={{
          opacity: 1,
          rotateX: 0,
          y: 0,
          z: 0,
          filter: 'blur(0px)',
        }}
        transition={{
          duration: 0.9,
          delay,
          ease: [0.16, 1, 0.3, 1], // Custom smooth easeOutExpo
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
};

export const FloatingCard3D: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  floatY?: number;
}> = ({ children, delay = 0, className = '', floatY = 6 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 25 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.div
        animate={{
          y: [-floatY, floatY, -floatY],
          rotateZ: [-0.5, 0.5, -0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 0.5,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
