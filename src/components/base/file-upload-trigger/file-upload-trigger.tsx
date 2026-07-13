"use client";

import React, { useRef } from "react";
import type { FileTriggerProps } from "@/types/base-components.types";

/**
 * A FileTrigger allows a user to access the file system with any pressable React Aria or React Spectrum component, or custom components built with usePress.
 */
export const FileTrigger = (props: FileTriggerProps) => {
    const { children, onSelect, acceptedFileTypes, allowsMultiple, defaultCamera, acceptDirectory, ...rest } = props;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const domProps = rest as React.InputHTMLAttributes<HTMLInputElement>;

    const handleClick = React.useCallback(() => {
        if (inputRef.current?.value) {
            inputRef.current.value = "";
        }
        inputRef.current?.click();
    }, []);

    return (
        <>
            <div onClick={handleClick} style={{ display: "contents" }}>
                {children}
            </div>
            <input
                {...domProps}
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                accept={acceptedFileTypes?.toString()}
                onChange={(e) => onSelect?.(e.target.files)}
                capture={defaultCamera}
                multiple={allowsMultiple}
                // @ts-expect-error - webkitdirectory is a non-standard attribute but required for directory selection
                webkitdirectory={acceptDirectory ? "" : undefined}
            />
        </>
    );
};
