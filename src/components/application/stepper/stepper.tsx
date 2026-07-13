import React from "react";
import type { StepItem, StepperProps } from "@/types/application.types";

export type { StepItem };

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, className = "" }) => {
    return (
        <div className={`flex w-full justify-center ${className}`}>
            <div className="flex w-full flex-row items-start justify-between">
                {steps.map((stepItem, index) => (
                    <React.Fragment key={stepItem.step}>
                        <div className="relative z-10 flex shrink-0 flex-col items-center gap-[8px] md:w-[180px]">
                            <div
                                className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full text-[18px] leading-[28px] font-semibold transition-colors duration-300 ${
                                    currentStep >= stepItem.step
                                        ? "border-none bg-blue-400 text-white shadow-none ring-4 ring-blue-50"
                                        : "bg-slate-200 text-slate-600"
                                }`}
                            >
                                {stepItem.step}
                            </div>
                            <div className="flex w-full flex-col items-center text-center leading-[18px]">
                                <span className="text-[14px] font-bold text-slate-700">{stepItem.title}</span>
                                <span className="w-[82px] text-[12px] text-slate-500 md:w-full">{stepItem.subtitle}</span>
                            </div>
                        </div>

                        {/* Connecting Line between steps */}
                        {index < steps.length - 1 && (
                            <div className="relative z-0 -mx-[64px] mt-[20px] h-[1px] flex-1 bg-slate-200">
                                <div
                                    className={`h-full w-full transition-colors duration-300 ${currentStep > stepItem.step ? "bg-blue-400" : "bg-transparent"}`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
