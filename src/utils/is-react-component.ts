/* We cannot use type `unknown` instead of `any` here because it will break the type assertion `isReactComponent` function is providing. */
import type React from "react";

// Type for React component props - using Record<string, unknown> to allow any props while avoiding `any`
type ReactComponentProps = Record<string, unknown>;
type ReactComponent = React.FC<ReactComponentProps> | React.ComponentClass<ReactComponentProps, ReactComponentProps>;

/**
 * Checks if a given value is a function component.
 * @param component - The value to check
 * @returns True if the value is a function component
 */
export const isFunctionComponent = (component: unknown): component is React.FC<ReactComponentProps> => {
    return typeof component === "function";
};

/**
 * Checks if a given value is a class component.
 * @param component - The value to check
 * @returns True if the value is a class component
 */
export const isClassComponent = (component: unknown): component is React.ComponentClass<ReactComponentProps, ReactComponentProps> => {
    return (
        typeof component === "function" &&
        component !== null &&
        "prototype" in component &&
        component.prototype !== null &&
        typeof component.prototype === "object" &&
        ("isReactComponent" in component.prototype || "render" in component.prototype)
    );
};

/**
 * Checks if a given value is a forward ref component.
 * @param component - The value to check
 * @returns True if the value is a forward ref component
 */
export const isForwardRefComponent = (component: unknown): component is React.ForwardRefExoticComponent<ReactComponentProps> => {
    return (
        typeof component === "object" &&
        component !== null &&
        "$$typeof" in component &&
        typeof component.$$typeof === "symbol" &&
        component.$$typeof.toString() === "Symbol(react.forward_ref)"
    );
};

/**
 * Checks if a given value is a valid React component.
 * @param component - The value to check
 * @returns True if the value is a valid React component
 */
export const isReactComponent = (component: unknown): component is ReactComponent => {
    return isFunctionComponent(component) || isForwardRefComponent(component) || isClassComponent(component);
};
