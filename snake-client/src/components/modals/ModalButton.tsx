import React from 'react';
import { ReactComponent as Logo } from '../../assets/solanaLogoMark.svg';

type ModalButtonProps = {
    text: string;
    className?: string;
    secondary?: boolean;
    onClick?: () => void;
    visible?: boolean;
    disabled?: boolean;
};

function ModalButton({ text, className, secondary, onClick, visible, disabled }: ModalButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 w-full cursor-pointer text-base font-medium rounded-sm ${
                secondary ? 'bg-white-500 font-semibold' : 'bg-green-500 text-white-500 font-semibold'
            } ${disabled && 'cursor-not-allowed'} ${className} `}
        >
            {text}
            <Logo className={`${!visible ? 'hidden' : 'h-7 w-7 ml-3 bg-dark-500 rounded-lg p-1'}`} />
        </button>
    );
}

export default ModalButton;
