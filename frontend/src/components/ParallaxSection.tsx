import { motion } from "framer-motion";
import type { ReactNode } from "react";
interface Props {
  children: ReactNode;
}

const ParallaxSection = ({ children }: Props) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative z-10"
    >
      {children}
    </motion.section>
  );
};

export default ParallaxSection;
