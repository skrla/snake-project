import React from 'react';
import Icon from './Icon';
import { IoIosArrowBack, IoIosArrowDown, IoIosArrowForward, IoIosArrowUp } from 'react-icons/io';

function Arrows() {
    return (
        <div className="w-full grid grid-cols-3 grid-rows-3 gap-3 justify-center items-center lg:hidden">
            <Icon IconName={IoIosArrowUp} size={45} className="col-start-2 row-start-1 justify-self-center" />
            <Icon IconName={IoIosArrowForward} size={45} className="col-start-3 row-start-2 justify-self-center" />
            <Icon IconName={IoIosArrowDown} size={45} className="col-start-2 row-start-3 justify-self-center" />
            <Icon IconName={IoIosArrowBack} size={45} className="col-start-1 row-start-2 justify-self-center" />
        </div>
    );
}

export default Arrows;
