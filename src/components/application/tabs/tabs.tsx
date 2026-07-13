"use client";

import type { ComponentPropsWithRef } from "react";
import { Fragment, createContext, useContext } from "react";
import { Tab as AriaTab, TabList as AriaTabList, TabPanel as AriaTabPanel, Tabs as AriaTabs, TabsContext, useSlottedContext } from "react-aria-components";
import type { BadgeColors } from "@/components/base/badges/badge-types";
import { Badge } from "@/components/base/badges/badges";
import { TAB_SIZES } from "@/constants/application.constants";
import type { HorizontalTabTypes, TabComponentProps, TabListComponentProps, TabsOrientation } from "@/types/application.types";
import { cx } from "@/utils/cx";
import { getTabColorStyles, getTabHorizontalStyles, getTabStyles } from "@/utils/tabs.utils";

const TabListContext = createContext<Omit<TabListComponentProps<TabComponentProps, TabsOrientation>, "items">>({
    size: "sm",
    type: "button-brand",
});

export const TabList = <T extends TabsOrientation>({
    size = "sm",
    type = "button-brand",
    orientation: orientationProp,
    fullWidth,
    className,
    children,
    ...otherProps
}: TabListComponentProps<TabComponentProps, T>) => {
    const context = useSlottedContext(TabsContext);

    const orientation = orientationProp ?? context?.orientation ?? "horizontal";

    return (
        <TabListContext.Provider value={{ size, type, orientation, fullWidth }}>
            <AriaTabList
                {...otherProps}
                className={(state) =>
                    cx(
                        "group flex",

                        getTabHorizontalStyles({
                            size,
                            fullWidth,
                        })[type as HorizontalTabTypes],

                        orientation === "vertical" && "w-max flex-col",

                        // Only horizontal tabs with underline type have bottom border
                        orientation === "horizontal" &&
                            type === "underline" &&
                            "relative before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border-secondary",

                        typeof className === "function" ? className(state) : className,
                    )
                }
            >
                {children ?? ((item) => <Tab {...item}>{item.children}</Tab>)}
            </AriaTabList>
        </TabListContext.Provider>
    );
};

export const TabPanel = (props: ComponentPropsWithRef<typeof AriaTabPanel>) => {
    return (
        <AriaTabPanel
            {...props}
            className={(state) =>
                cx(
                    "outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                    typeof props.className === "function" ? props.className(state) : props.className,
                )
            }
        />
    );
};

export const Tab = (props: TabComponentProps) => {
    const { label, children, badge, ...otherProps } = props;
    const { size = "sm", type = "button-brand", fullWidth } = useContext(TabListContext);

    return (
        <AriaTab
            {...otherProps}
            className={(prop) =>
                cx(
                    "z-10 flex h-max cursor-pointer items-center justify-center gap-2 rounded-md whitespace-nowrap text-quaternary transition duration-100 ease-linear",
                    "group-orientation-vertical:justify-start",
                    fullWidth && "w-full flex-1",
                    TAB_SIZES[size][type],
                    getTabStyles(prop)[type],
                    typeof props.className === "function" ? props.className(prop) : props.className,
                )
            }
        >
            {(state) => (
                <Fragment>
                    {typeof children === "function" ? children(state) : children || label}
                    {badge && (
                        <Badge
                            size={size}
                            type="pill-color"
                            color={getTabColorStyles(state)[type] as BadgeColors}
                            className={cx("hidden transition-inherit-all md:flex", size === "sm" && "-my-px")}
                        >
                            {badge}
                        </Badge>
                    )}
                </Fragment>
            )}
        </AriaTab>
    );
};

export const Tabs = ({ className, ...props }: ComponentPropsWithRef<typeof AriaTabs>) => {
    return (
        <AriaTabs
            keyboardActivation="manual"
            {...props}
            className={(state) => cx("flex w-full flex-col", typeof className === "function" ? className(state) : className)}
        />
    );
};

Tabs.Panel = TabPanel;
Tabs.List = TabList;
Tabs.Item = Tab;
