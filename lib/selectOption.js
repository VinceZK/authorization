/**
 * Created by VinceZK on 1/30/17.
 */
"use strict";

export { contains };

function contains(selectOption, value){
    if(!selectOption || !value)return false;

    switch (selectOption.Operator){
        case 'Between':
            if(selectOption.Option === 'Include')return value >= selectOption.Low && value <= selectOption.High;
            else if(selectOption.Option === 'Exclude')return value < selectOption.Low || value > selectOption.High;
            break;
        default :
            return true;
    }
}