/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
    name: string;
    color: string;
    className?: string;
    size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
    name,
    color,
    className = '',
    size = 18
}) => {
    // Safe lookup with fallback
    // Fallback to DollarSign or CircleHelp if icon is not found
    const LucideIcon = (Icons as any)[name] || Icons.CircleDot;

    return (
        <div
            className={`flex items-center justify-center rounded-xl p-2 ${className}`}
            style={{ backgroundColor: `${color}15`, color: color }}
        >
            <LucideIcon size={size} strokeWidth={2.5} />
        </div>
    );
};

export default CategoryIcon;
