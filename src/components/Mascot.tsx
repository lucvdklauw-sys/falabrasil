import { motion } from "framer-motion";

type MascotMood = "happy" | "sad" | "excited" | "neutral";

export function Mascot({
  mood = "happy",
  size = 120,
  className = "",
}: {
  mood?: MascotMood;
  size?: number;
  className?: string;
}) {
  const bounce = mood === "excited";
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={
        bounce
          ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{ duration: bounce ? 0.6 : 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        {/* Tucano mascotte "Tuca" */}
        <ellipse cx="100" cy="175" rx="34" ry="8" fill="#00000014" />
        {/* body */}
        <path d="M70 90 C70 60 90 40 115 42 C150 45 165 80 158 115 C153 145 130 168 105 168 C78 168 62 138 62 115 C62 105 65 96 70 90 Z" fill="#0b1b2b" />
        {/* white belly */}
        <path d="M85 95 C82 115 85 140 102 150 C118 140 122 115 118 96 C108 104 96 104 85 95 Z" fill="#ffffff" />
        {/* wing */}
        <path d="M140 95 C155 100 160 120 150 140 C142 152 128 155 122 150 C130 135 132 112 140 95Z" fill="#009739" />
        {/* eye */}
        <circle cx="118" cy="70" r="15" fill="#ffffff" />
        <circle cx="121" cy="70" r="7" fill="#0b1b2b" />
        {/* beak */}
        <path
          d="M132 66 C170 55 195 62 198 75 C200 84 185 88 170 86 C185 92 190 100 185 106 C175 112 150 100 132 84 Z"
          fill="#FFDF00"
        />
        <path d="M132 66 C160 60 180 64 190 72" stroke="#f7931e" strokeWidth="2" fill="none" opacity="0.6" />
        {/* legs */}
        <path d="M92 165 L88 180 M110 165 L114 180" stroke="#f7931e" strokeWidth="5" strokeLinecap="round" />
        {/* feet accents */}
        <circle cx="88" cy="182" r="3" fill="#f7931e" />
        <circle cx="114" cy="182" r="3" fill="#f7931e" />
      </svg>
    </motion.div>
  );
}
