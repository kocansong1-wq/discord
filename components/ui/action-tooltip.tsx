"use-client";

import { Tooltip,TooltipContent,TooltipProvider,TooltipTrigger } from "./tooltip";


interface ActionTooltipProps {
    children: React.ReactNode;
    label: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";

}

export const ActionTooltip = ({children, label, side, align}:ActionTooltipProps) =>{
    if (!label) return <>{children}</>;
    
    return (
        <TooltipProvider>
            <Tooltip delayDuration={50} >
                <TooltipTrigger asChild>
                    {children}  
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p className="font-semibold text-sm capitalize">
                    {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )

}
