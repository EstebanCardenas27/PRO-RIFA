import { Icon as IconElement } from "@iconify/react";

export interface Props {
    name?            : string;
    width?           : string | number;
    height?          : string | number;
    className?       : string;
    onClick?         : () => void;
}

export const Icon    = ({
    name             = "solar:4k-bold-duotone",
    width,
    height,
    className,
    onClick, 
} : Props) => {
    return (
        <IconElement 
            icon        = {name}
            width       = {width}
            height      = {height}
            className   = {className}         
            onClick     = {onClick}   
            style       = {{ cursor: onClick ? "pointer" : undefined }}
        />  
    );
};