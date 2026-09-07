import React from 'react';
import { Theme } from '../types';
import { EthiopianPatternStrip } from './EthiopianPattern';

interface Props {
  theme: Theme;
  height?: number;
  className?: string;
}

/**
 * Artistic Ethiopian Border Ribbon (Tibeb).
 * Provides authentic, high-contrast Ethiopian geometric embroidery border trimming.
 */
export const TibebBorder: React.FC<Props> = ({ theme, height = 12, className = '' }) => {
  return (
    <div
      id="tibeb-artistic-border-strip"
      className={`w-full overflow-hidden border-y border-blue-600/30 dark:border-blue-400/20 shadow-xs ${className}`}
    >
      <EthiopianPatternStrip theme={theme} height={height} />
    </div>
  );
};
