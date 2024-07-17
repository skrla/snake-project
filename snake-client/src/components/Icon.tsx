import React from 'react';
import { IconType } from 'react-icons';

type IconProps = {
    IconName: IconType;
    size?: number;
    className?: string;
    onClick?: () => void | undefined;
};

function Icon({ IconName, size, className, onClick }: IconProps) {
    return (
        <button onClick={onClick} className={`flex items-center justify-center w-16 h-16 bg-white border-[1px] border-gray-50 rounded-lg cursor-pointer ${className}`}>
            <IconName size={size} />
        </button>
    );
}

export default Icon;
