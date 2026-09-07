import React from 'react';
import { Theme } from '../types';

interface PatternProps {
  theme?: Theme;
  height?: number;
  className?: string;
}

/**
 * Authentic, highly intricate Ethiopian Artistic Geometric Border (Tibeb / ጥበብ).
 * Features multi-layered woven diamond medallions, traditional Ethiopian cross/meskel motifs,
 * vibrant silk gold, royal clinical blue, and ruby accent threads on a dignified foundation.
 */
export const EthiopianPatternStrip: React.FC<PatternProps> = ({
  theme = 'light',
  height = 14,
  className = '',
}) => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0E1A' : '#0B1329';
  const goldColor = '#D4AF37';
  const goldBright = '#FCD34D';
  const blueColor = '#2563EB';
  const blueLight = '#60A5FA';
  const rubyColor = '#E11D48';
  const emeraldColor = '#10B981';

  return (
    <div
      className={`w-full overflow-hidden relative select-none shadow-xs ${className}`}
      style={{ height: `${height}px`, backgroundColor: bgColor }}
      role="presentation"
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 120 18"
      >
        <defs>
          <pattern
            id={`ethiopian-artistic-tibeb-${isDark ? 'dark' : 'light'}`}
            width="120"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            {/* Background woven foundation */}
            <rect width="120" height="18" fill={bgColor} />

            {/* Top Ornamental Braided Rails (Artistic Gold & Clinical Blue) */}
            <line x1="0" y1="1" x2="120" y2="1" stroke={blueColor} strokeWidth="1" />
            <line x1="0" y1="2.4" x2="120" y2="2.4" stroke={goldColor} strokeWidth="0.8" strokeDasharray="3,1" />

            {/* Bottom Ornamental Braided Rails */}
            <line x1="0" y1="15.6" x2="120" y2="15.6" stroke={goldColor} strokeWidth="0.8" strokeDasharray="3,1" />
            <line x1="0" y1="17" x2="120" y2="17" stroke={blueColor} strokeWidth="1" />

            {/* Subtle background chevron embroidery lattice */}
            <path
              d="M0 9 L9 18 M9 0 L18 9 L9 18 M18 0 L27 9 L18 18 M27 0 L36 9 L27 18 M36 0 L45 9 L36 18 M45 0 L54 9 L45 18 M54 0 L63 9 L54 18 M63 0 L72 9 L63 18 M72 0 L81 9 L72 18 M81 0 L90 9 L81 18 M90 0 L99 9 L90 18 M99 0 L108 9 L99 18 M108 0 L117 9 L108 18 M117 0 L126 9 L117 18 M9 0 L0 9"
              stroke="#78350F"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              fill="none"
            />
            <path
              d="M0 9 L9 0 M9 18 L18 9 L9 0 M18 18 L27 9 L18 0 M27 18 L36 9 L27 0 M36 18 L45 9 L36 0 M45 18 L54 9 L45 0 M54 18 L63 9 L54 0 M63 18 L72 9 L63 0 M72 18 L81 9 L72 0 M81 18 L90 9 L81 0 M90 18 L99 9 L90 0 M99 18 L108 9 L99 0 M108 18 L117 9 L108 0 M117 18 L126 9 L117 0 M9 18 L0 9"
              stroke="#78350F"
              strokeWidth="0.5"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* Medallion A (Grand Nested Cross-Diamond) centered at x = 30 */}
            {/* Outer Diamond */}
            <polygon points="30,2.5 42,9 30,15.5 18,9" fill="none" stroke={goldColor} strokeWidth="1.2" />
            {/* Middle Blue Stepped Diamond */}
            <polygon points="30,4.5 37,9 30,13.5 23,9" fill="none" stroke={blueColor} strokeWidth="1" />
            {/* Inner Ruby Diamond */}
            <polygon points="30,6.5 33.5,9 30,11.5 26.5,9" fill={rubyColor} />
            {/* Center Gold Starlet */}
            <circle cx="30" cy="9" r="1.1" fill={goldBright} />
            {/* North/South/East/West Cross Beads */}
            <circle cx="30" cy="2.8" r="0.8" fill={goldBright} />
            <circle cx="30" cy="15.2" r="0.8" fill={goldBright} />
            <circle cx="18.5" cy="9" r="0.8" fill={blueLight} />
            <circle cx="41.5" cy="9" r="0.8" fill={blueLight} />

            {/* Medallion B (Grand Nested Cross-Diamond) centered at x = 90 */}
            {/* Outer Diamond */}
            <polygon points="90,2.5 102,9 90,15.5 78,9" fill="none" stroke={goldColor} strokeWidth="1.2" />
            {/* Middle Blue Stepped Diamond */}
            <polygon points="90,4.5 97,9 90,13.5 83,9" fill="none" stroke={blueColor} strokeWidth="1" />
            {/* Inner Emerald Diamond */}
            <polygon points="90,6.5 93.5,9 90,11.5 86.5,9" fill={emeraldColor} />
            {/* Center Gold Starlet */}
            <circle cx="90" cy="9" r="1.1" fill={goldBright} />
            {/* North/South/East/West Cross Beads */}
            <circle cx="90" cy="2.8" r="0.8" fill={goldBright} />
            <circle cx="90" cy="15.2" r="0.8" fill={goldBright} />
            <circle cx="78.5" cy="9" r="0.8" fill={blueLight} />
            <circle cx="101.5" cy="9" r="0.8" fill={blueLight} />

            {/* Intermediate Artistic Cross / Starburst Motif at x = 60 */}
            <polygon points="60,4.5 64,9 60,13.5 56,9" fill={goldColor} />
            <polygon points="60,6.2 62,9 60,11.8 58,9" fill={bgColor} />
            <circle cx="60" cy="9" r="0.9" fill={goldBright} />
            <polygon points="60,3.2 61.2,4.4 58.8,4.4" fill={goldColor} />
            <polygon points="60,14.8 61.2,13.6 58.8,13.6" fill={goldColor} />

            {/* Edge Connecting Motifs at x = 0 and x = 120 */}
            <polygon points="0,4.5 4,9 0,13.5 -4,9" fill={goldColor} />
            <polygon points="0,6.2 2,9 0,11.8 -2,9" fill={bgColor} />
            <circle cx="0" cy="9" r="0.9" fill={goldBright} />

            <polygon points="120,4.5 124,9 120,13.5 116,9" fill={goldColor} />
            <polygon points="120,6.2 122,9 120,11.8 118,9" fill={bgColor} />
            <circle cx="120" cy="9" r="0.9" fill={goldBright} />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill={`url(#ethiopian-artistic-tibeb-${isDark ? 'dark' : 'light'})`}
        />
      </svg>
    </div>
  );
};
