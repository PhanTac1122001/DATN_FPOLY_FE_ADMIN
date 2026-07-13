/**
 * Base Components Types
 * Extracted interfaces and types from src/components/base/ folder
 */
import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ChangeEvent,
    ComponentType,
    DetailedHTMLProps,
    FC,
    FocusEventHandler,
    HTMLAttributes,
    PointerEventHandler,
    ReactNode,
    Ref,
    RefAttributes,
    RefObject,
    SelectHTMLAttributes,
} from "react";
import type { Editor } from "@tiptap/react";
import type { IconProps } from "iconsax-react";
import type { Placement } from "react-aria";
import type {
    ButtonProps as AriaButtonProps,
    CheckboxProps as AriaCheckboxProps,
    ComboBoxProps as AriaComboBoxProps,
    GroupProps as AriaGroupProps,
    LabelProps as AriaLabelProps,
    ListBoxItemProps as AriaListBoxItemProps,
    ListBoxProps as AriaListBoxProps,
    MenuItemProps as AriaMenuItemProps,
    MenuProps as AriaMenuProps,
    PopoverProps as AriaPopoverProps,
    SelectProps as AriaSelectProps,
    TextFieldProps as AriaTextFieldProps,
    TextProps as AriaTextProps,
} from "react-aria-components";
import type {
    RadioGroupProps as AriaRadioGroupProps,
    RadioProps as AriaRadioProps,
    SliderProps as AriaSliderProps,
    SwitchProps as AriaSwitchProps,
    TagGroupProps as AriaTagGroupProps,
    TagProps as AriaTagProps,
    TextAreaProps as AriaTextAreaProps,
    TooltipProps as AriaTooltipProps,
    TooltipTriggerComponentProps as AriaTooltipTriggerComponentProps,
    ToggleButtonGroupProps,
    ToggleButtonProps,
} from "react-aria-components";
import type { ListData } from "react-stately";
// ============================================================================
// Avatar Types (avatar/*.tsx)
// ============================================================================

import type { IconComponentType } from "@/components/base/badges/badge-types";

// ============================================
// Button Types (buttons/button.tsx)
// ============================================

// Button sizes and colors - defined inline to avoid circular dependency
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonColor =
    | "primary"
    | "secondary"
    | "secondary-gray"
    | "tertiary"
    | "link-gray"
    | "link-color"
    | "primary-destructive"
    | "secondary-destructive"
    | "tertiary-destructive"
    | "link-destructive"
    | "ai";

/**
 * Common props shared between button and anchor variants
 */
export interface ButtonCommonProps {
    /** Disables the button and shows a disabled state */
    isDisabled?: boolean;
    /** Shows a loading spinner and disables the button */
    isLoading?: boolean;
    /** The size variant of the button */
    size?: ButtonSize;
    /** The color variant of the button */
    color?: ButtonColor;
    /** Icon component or element to show before the text */
    iconLeading?: FC<{ className?: string }> | ReactNode;
    /** Icon component or element to show after the text */
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    /** Removes horizontal padding from the text content */
    noTextPadding?: boolean;
    /** When true, keeps the text visible during loading state */
    showTextWhileLoading?: boolean;
    /** Callback for press events (react-aria) */
    onPress?: AriaButtonProps["onPress"];
    /** Pending state (react-aria) */
    isPending?: boolean;
}

/**
 * Props for the button variant (non-link)
 */
export interface ButtonButtonProps
    extends ButtonCommonProps, DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">, HTMLButtonElement> {
    /** Slot name for react-aria component */
    slot?: AriaButtonProps["slot"];
}

/**
 * Props for the link variant (anchor tag)
 */
export type ButtonLinkProps = ButtonCommonProps & DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement>;

/** Union type of button and link props */
export type ButtonProps = ButtonButtonProps | ButtonLinkProps;

// ============================================
// Close Button Types (buttons/close-button.tsx)
// ============================================

export interface CloseButtonProps extends AriaButtonProps {
    theme?: "light" | "dark";
    size?: "xs" | "sm" | "md" | "lg";
    label?: string;
}

// ============================================
// Social Button Types (buttons/social-button.tsx)
// ============================================

export type SocialButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface SocialButtonCommonProps {
    social: "google" | "facebook" | "apple" | "twitter" | "figma" | "dribble";
    disabled?: boolean;
    theme?: "brand" | "color" | "gray";
    size?: SocialButtonSize;
}

export interface SocialButtonButtonProps
    extends SocialButtonCommonProps, DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">, HTMLButtonElement> {
    slot?: AriaButtonProps["slot"];
}

export type SocialButtonLinkProps = SocialButtonCommonProps & DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement>;

export type SocialButtonProps = SocialButtonButtonProps | SocialButtonLinkProps;

// ============================================
// Button Utility Types (buttons/button-utility.tsx)
// ============================================

/**
 * Common props shared between button utility and anchor variants
 */
export interface ButtonUtilityCommonProps {
    /** Disables the button and shows a disabled state */
    isDisabled?: boolean;
    /** The size variant of the button */
    size?: "xs" | "sm";
    /** The color variant of the button */
    color?: "secondary" | "tertiary";
    /** The icon to display in the button */
    icon?: FC<{ className?: string }> | ReactNode;
    /** The tooltip to display when hovering over the button */
    tooltip?: string;
    /** The placement of the tooltip */
    tooltipPlacement?: Placement;
}

/**
 * Props for the button utility variant (non-link)
 */
export interface ButtonUtilityButtonProps
    extends ButtonUtilityCommonProps, DetailedHTMLProps<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "slot">, HTMLButtonElement> {
    /** Slot name for react-aria component */
    slot?: AriaButtonProps["slot"];
}

/**
 * Props for the link variant (anchor tag)
 */
export type ButtonUtilityLinkProps = ButtonUtilityCommonProps & DetailedHTMLProps<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color">, HTMLAnchorElement>;

/** Union type of button utility and link props */
export type ButtonUtilityProps = ButtonUtilityButtonProps | ButtonUtilityLinkProps;

// ============================================
// Checkbox Types (checkbox/checkbox.tsx)
// ============================================

export interface CheckboxBaseProps {
    size?: "sm" | "md";
    className?: string;
    isFocusVisible?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isIndeterminate?: boolean;
}

export interface CheckboxProps extends AriaCheckboxProps {
    ref?: Ref<HTMLLabelElement>;
    size?: "sm" | "md";
    label?: ReactNode;
    hint?: ReactNode;
    boxClassName?: string;
}

export interface NumberedCheckboxProps {
    isSelected: boolean;
    orderNumber?: number;
    onChange?: () => void;
    className?: string;
    size?: "sm" | "md";
}

// ============================================
// Divider Types (divider/divider.tsx)
// ============================================

export interface DividerProps {
    /**
     * The orientation of the divider
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";

    /**
     * The visual style of the divider
     * @default "solid"
     */
    variant?: "solid" | "dashed" | "dotted";

    /**
     * Spacing around the divider
     * @default "md"
     */
    spacing?: "none" | "sm" | "md" | "lg" | "xl";

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Text or content to display in the middle of the divider (only for horizontal)
     */
    children?: ReactNode;
}

// ============================================
// Dropdown Types (dropdown/dropdown.tsx)
// ============================================

export interface DropdownItemProps extends AriaMenuItemProps {
    /** The label of the item to be displayed. */
    label?: string;
    /** An addon to be displayed on the right side of the item. */
    addon?: string;
    /** If true, the item will not have any styles. */
    unstyled?: boolean;
    /** An icon to be displayed on the left side of the item. */
    icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement> | IconsaxIconProps>;
    /** Icon size */
    iconSize?: number | string;
    /** Icon variant (for iconsax-react icons) */
    iconVariant?: "Linear" | "Bold" | "Broken" | "Bulk" | "Outline" | "TwoTone";
    /** Icon color */
    iconColor?: string;
}

export type DropdownMenuProps<T extends object> = AriaMenuProps<T>;

export type DropdownPopoverProps = AriaPopoverProps;

// ============================================
// Editor Types (editor/tiptap-editor.tsx, editor/toolbar.tsx, editor/table-bubble-menu.tsx)
// ============================================

export interface MenuButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean;
    title: string;
    children: ReactNode;
    isDanger?: boolean;
}

export interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
    /** Fires when the editor loses focus (e.g. for field-level validation). */
    onBlur?: () => void;
    placeholder?: string;
    readOnly?: boolean;
    hideToolbar?: boolean;
    className?: string;
    editorClassName?: string;
    onImageUpload?: (file: File) => Promise<string>;
}

export interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: ReactNode;
    title?: string;
}

export interface ToolbarProps {
    editor: Editor | null;
    onImageUpload?: (file: File) => Promise<string>;
}

// ============================================
// Input Types (input/hint-text.tsx, input/label.tsx, input/input.tsx, input/input-group.tsx, input/input-payment.tsx)
// ============================================

export interface HintTextProps extends AriaTextProps {
    /** Indicates that the hint text is an error message. */
    isInvalid?: boolean;
    ref?: Ref<HTMLElement>;
    children: ReactNode;
}

export interface LabelProps extends AriaLabelProps {
    children: ReactNode;
    isRequired?: boolean;
    tooltip?: string;
    tooltipDescription?: string;
    ref?: Ref<HTMLLabelElement>;
}

// Type for iconsax-react icons
export type IconsaxIconProps = {
    size?: number | string;
    variant?: "Linear" | "Bold" | "Broken" | "Bulk" | "Outline" | "TwoTone";
    color?: string;
    className?: string;
};

export interface InputBasePropsInternal {
    /** Label text for the input */
    label?: string;
    /** Helper text displayed below the input */
    hint?: ReactNode;
}

export interface InputTextFieldProps
    extends
        InputBasePropsInternal,
        AriaTextFieldProps,
        Pick<InputBaseProps, "size" | "wrapperClassName" | "inputClassName" | "iconClassName" | "tooltipClassName"> {
    ref?: Ref<HTMLDivElement>;
}

export interface InputBaseProps extends InputTextFieldProps {
    /** Tooltip message on hover. */
    tooltip?: string;
    /**
     * Input size.
     * @default "sm"
     */
    size?: "sm" | "md";
    /** Placeholder text. */
    placeholder?: string;
    /** Class name for the icon. */
    iconClassName?: string;
    /** Class name for the trailing icon. */
    iconTrailingClassName?: string;
    /** Class name for the input. */
    inputClassName?: string;
    /** Class name for the input wrapper. */
    wrapperClassName?: string;
    /** Class name for the tooltip. */
    tooltipClassName?: string;
    /** Keyboard shortcut to display. */
    shortcut?: string | boolean;
    /** Icon color (for iconsax-react icons) */
    iconColor?: string;
    /** Trailing icon color (for iconsax-react icons) */
    iconTrailingColor?: string;
    /** Icon variant (for iconsax-react icons) */
    iconVariant?: IconsaxIconProps["variant"];
    /** Trailing icon variant (for iconsax-react icons) */
    iconTrailingVariant?: IconsaxIconProps["variant"];
    /** Icon size */
    iconSize?: number | string;
    /** Trailing icon size */
    iconTrailingSize?: number | string;
    ref?: Ref<HTMLInputElement>;
    groupRef?: Ref<HTMLDivElement>;
    /** Icon component to display on the left side of the input. */
    icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement> | IconsaxIconProps>;
    /** Icon component to display on the right side of the input. */
    iconTrailing?: ComponentType<HTMLAttributes<HTMLOrSVGElement> | IconsaxIconProps>;
    /** Whether password is visible (for password inputs) */
    showPassword?: boolean;
    /** Callback to toggle password visibility */
    onTogglePassword?: () => void;
    /** Label for show password button */
    showPasswordLabel?: string;
    /** Label for hide password button */
    hidePasswordLabel?: string;
    /** Minimum value for number inputs */
    min?: number;
    /** Maximum value for number inputs */
    max?: number;
    /** Step value for number inputs */
    step?: string | number;
    /** Accepted file types for file inputs */
    accept?: string;
    /** Callback when file input changes */
    onFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Callback for key down capture events */
    onKeyDownCapture?: (e: React.KeyboardEvent) => void;
}

export interface InputProps extends InputBaseProps, InputBasePropsInternal {
    /** Whether to hide required indicator from label */
    hideRequiredIndicator?: boolean;
}

export interface InputPrefixProps extends HTMLAttributes<HTMLDivElement> {
    /** The position of the prefix. */
    position?: "leading" | "trailing";
    /** The size of the prefix. */
    size?: "sm" | "md";
    /** Indicates that the prefix is disabled. */
    isDisabled?: boolean;
}

// `${string}ClassName` is used to omit any className prop that ends with a `ClassName` suffix
export interface InputGroupProps extends Omit<InputBaseProps, "type" | "icon" | "placeholder" | "tooltip" | "shortcut" | `${string}ClassName`> {
    /** A prefix text that is displayed in the same box as the input.*/
    prefix?: string;
    /** A leading addon that is displayed with visual separation from the input. */
    leadingAddon?: ReactNode;
    /** A trailing addon that is displayed with visual separation from the input. */
    trailingAddon?: ReactNode;
    /** The class name to apply to the input group. */
    className?: string;
    /** The children of the input group (i.e `<InputBase />`) */
    children: ReactNode;
}

export type PaymentInputProps = Omit<InputBaseProps, "icon">;

// ============================================
// Select Types (select/select.tsx, select/combobox.tsx, select/multi-combobox.tsx, select/multi-select.tsx, select/popover.tsx, select-item.tsx, select-native.tsx)
// ============================================

export type SelectItemType = {
    id: string;
    label?: string;
    avatarUrl?: string;
    isDisabled?: boolean;
    supportingText?: string;
    icon?: FC | ReactNode;
};

export interface SelectCommonProps {
    hint?: string;
    label?: string;
    tooltip?: string;
    size?: "sm" | "md";
    placeholder?: string;
    trailingIcon?: FC | ReactNode;
    /** When true, shows a clear (X) button to reset the selected value to null */
    isClearable?: boolean;
}

export interface SelectProps extends Omit<AriaSelectProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement>, SelectCommonProps {
    items?: SelectItemType[];
    popoverClassName?: string;
    placeholderIcon?: FC | ReactNode;
    trailingIcon?: FC | ReactNode;
    matchTriggerWidth?: boolean;
    children: ReactNode | ((item: SelectItemType) => ReactNode);
}

export interface SelectValueProps {
    isOpen: boolean;
    size: "sm" | "md";
    isFocused: boolean;
    isDisabled: boolean;
    isInvalid: boolean;
    placeholder?: string;
    trailingIcon?: FC | ReactNode;
    ref?: Ref<HTMLButtonElement>;
    placeholderIcon?: FC | ReactNode;
    isClearable?: boolean;
    onClear?: () => void;
}

export interface ComboBoxProps extends Omit<AriaComboBoxProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement>, SelectCommonProps {
    shortcut?: boolean;
    items?: SelectItemType[];
    popoverClassName?: string;
    shortcutClassName?: string;
    children: AriaListBoxProps<SelectItemType>["children"];
    isLoading?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasNextPage?: boolean;
    /** Debounce delay (ms) for onInputChange. When set, the component maintains an immediate internal
     *  display value for responsive typing but delays the onInputChange callback to the parent. */
    debounceMs?: number;
}

export interface ComboBoxValueProps extends AriaGroupProps {
    size: "sm" | "md";
    shortcut: boolean;
    placeholder?: string;
    shortcutClassName?: string;
    onFocus?: FocusEventHandler;
    onPointerEnter?: PointerEventHandler;
    ref?: RefObject<HTMLDivElement | null>;
    isClearable?: boolean;
    onClear?: () => void;
}

export interface MultiComboBoxProps extends RefAttributes<HTMLDivElement>, SelectCommonProps {
    items?: SelectItemType[];
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    onInputChange?: (value: string) => void;
    inputValue?: string;
    popoverClassName?: string;
    shortcutClassName?: string;
    children?: AriaListBoxProps<SelectItemType>["children"];
    isRequired?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
    /** Enable server-side filtering. If false (default), filtering is done on client-side */
    enableServerFilter?: boolean;
    showCheckbox?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
    hasNextPage?: boolean;
    isLoading?: boolean;
    scrollTagsOnMobile?: boolean;
    /** Debounce delay (ms) for onInputChange when enableServerFilter is true.
     *  Input updates immediately for responsive typing, but the onInputChange callback is debounced. */
    debounceMs?: number;
}

export interface MultiSelectComboBoxValueProps extends AriaGroupProps {
    size: "sm" | "md";
    shortcut?: boolean;
    isDisabled?: boolean;
    placeholder?: string;
    shortcutClassName?: string;
    placeholderIcon?: IconComponentType | null;
    ref?: RefObject<HTMLDivElement | null>;
    onFocus?: FocusEventHandler;
    onPointerEnter?: PointerEventHandler;
}

export interface MultiSelectProps extends Omit<AriaComboBoxProps<SelectItemType>, "children" | "items">, RefAttributes<HTMLDivElement> {
    hint?: string;
    label?: string;
    tooltip?: string;
    size?: "sm" | "md";
    placeholder?: string;
    shortcut?: boolean;
    items?: SelectItemType[];
    popoverClassName?: string;
    shortcutClassName?: string;
    selectedItems: ListData<SelectItemType>;
    placeholderIcon?: IconComponentType | null;
    children: AriaListBoxProps<SelectItemType>["children"];
    onItemCleared?: (key: React.Key) => void;
    onItemInserted?: (key: React.Key) => void;
}

export interface SelectPopoverProps extends AriaPopoverProps, RefAttributes<HTMLElement> {
    size: "sm" | "md";
    matchTriggerWidth?: boolean;
}

export type SelectItemProps = Omit<AriaListBoxItemProps<SelectItemType>, "id"> & SelectItemType;

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    hint?: string;
    selectClassName?: string;
    options: { label: string; value: string; disabled?: boolean }[];
}

export type AvatarSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    size?: AvatarSize;
    className?: string;
    src?: string | null;
    alt?: string;
    contrastBorder?: boolean;
    badge?: ReactNode;
    status?: "online" | "offline";
    verified?: boolean;
    initials?: string;
    placeholderIcon?: FC<{ className?: string }>;
    placeholder?: ReactNode;
    focusable?: boolean;
}

export interface AvatarLabelGroupProps extends Omit<AvatarProps, "title"> {
    size: "sm" | "md" | "lg" | "xl";
    title: string | ReactNode;
    subtitle: string | ReactNode;
}

export interface AvatarProfilePhotoProps extends AvatarProps {
    size: "sm" | "md" | "lg";
}

export interface AvatarAddButtonProps extends AriaButtonProps {
    size: "xs" | "sm" | "md";
    title?: string;
    className?: string;
}

export interface AvatarCompanyIconProps {
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    src: string;
    alt?: string;
}

export interface AvatarOnlineIndicatorProps {
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    status: "online" | "offline";
    className?: string;
}

export interface VerifiedTickProps {
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    className?: string;
}

// ============================================================================
// Badge Types (badges/*.tsx)
// ============================================================================

export type BadgeIconComponentType = FC<{ className?: string; strokeWidth?: string | number }>;
export type BadgeSizes = "sm" | "md" | "lg";
export type BadgeColors = "gray" | "brand" | "error" | "warning" | "success" | "gray-blue" | "blue-light" | "blue" | "indigo" | "purple" | "pink" | "orange";

export type FlagTypes =
    | "AD"
    | "AE"
    | "AF"
    | "AG"
    | "AI"
    | "AL"
    | "AM"
    | "AO"
    | "AR"
    | "AS"
    | "AT"
    | "AU"
    | "AW"
    | "AX"
    | "AZ"
    | "BA"
    | "BB"
    | "BD"
    | "BE"
    | "BF"
    | "BG"
    | "BH"
    | "BI"
    | "BJ"
    | "BL"
    | "BM"
    | "BN"
    | "BO"
    | "BQ-1"
    | "BQ-2"
    | "BQ"
    | "BR"
    | "BS"
    | "BT"
    | "BW"
    | "BY"
    | "BZ"
    | "CA"
    | "CC"
    | "CD-1"
    | "CD"
    | "CF"
    | "CH"
    | "CK"
    | "CL"
    | "CM"
    | "CN"
    | "CO"
    | "CR"
    | "CU"
    | "CW"
    | "CX"
    | "CY"
    | "CZ"
    | "DE"
    | "DJ"
    | "DK"
    | "DM"
    | "DO"
    | "DS"
    | "DZ"
    | "earth"
    | "EC"
    | "EE"
    | "EG"
    | "EH"
    | "ER"
    | "ES"
    | "ET"
    | "FI"
    | "FJ"
    | "FK"
    | "FM"
    | "FO"
    | "FR"
    | "GA"
    | "GB-2"
    | "GB"
    | "GD"
    | "GE"
    | "GG"
    | "GH"
    | "GI"
    | "GL"
    | "GM"
    | "GN"
    | "GQ"
    | "GR"
    | "GT"
    | "GU"
    | "GW"
    | "GY"
    | "HK"
    | "HN"
    | "HR"
    | "HT"
    | "HU"
    | "ID"
    | "IE"
    | "IL"
    | "IM"
    | "IN"
    | "IO"
    | "IQ"
    | "IR"
    | "IS"
    | "IT"
    | "JE"
    | "JM"
    | "JO"
    | "JP"
    | "KE"
    | "KG"
    | "KH"
    | "KI"
    | "KM"
    | "KN"
    | "KP"
    | "KR"
    | "KW"
    | "KY"
    | "KZ"
    | "LA"
    | "LB"
    | "LC"
    | "LI"
    | "LK"
    | "LR"
    | "LS"
    | "LT"
    | "LU"
    | "LV"
    | "LY"
    | "MA"
    | "MC"
    | "MD"
    | "ME"
    | "MG"
    | "MH"
    | "MK"
    | "ML"
    | "MM"
    | "MN"
    | "MO"
    | "MP"
    | "MQ"
    | "MR"
    | "MS"
    | "MT"
    | "MU"
    | "MV"
    | "MW"
    | "MX"
    | "MY"
    | "MZ"
    | "NA"
    | "NE"
    | "NF"
    | "NG"
    | "NI"
    | "NL"
    | "NO"
    | "NP"
    | "NR"
    | "NU"
    | "NZ"
    | "OM"
    | "PA"
    | "PE"
    | "PF"
    | "PG"
    | "PH"
    | "PK"
    | "PL"
    | "PM"
    | "PN"
    | "PR"
    | "PT"
    | "PW"
    | "PY"
    | "QA"
    | "RE"
    | "RO"
    | "RS"
    | "RU"
    | "RW"
    | "SA"
    | "SB"
    | "SC"
    | "SD"
    | "SE"
    | "SG"
    | "SH"
    | "SI"
    | "SJ"
    | "SK"
    | "SL"
    | "SM"
    | "SN"
    | "SO"
    | "SR"
    | "SS"
    | "ST"
    | "SV"
    | "SX"
    | "SY"
    | "SZ"
    | "TC"
    | "TD"
    | "TF"
    | "TG"
    | "TH"
    | "TJ"
    | "TK"
    | "TL"
    | "TM"
    | "TN"
    | "TO"
    | "TR"
    | "TT"
    | "TV"
    | "TZ"
    | "UA"
    | "UG"
    | "UM"
    | "US"
    | "UY"
    | "UZ"
    | "VA"
    | "VC"
    | "VE"
    | "VG"
    | "VI"
    | "VN"
    | "VU"
    | "WF"
    | "WS"
    | "YE"
    | "YT"
    | "ZA"
    | "ZM"
    | "ZW";

export type ExtractColorKeys<T> = T extends { styles: infer C } ? keyof C : never;
export type ExtractBadgeKeys<T> = keyof T;
export type BadgeTypeToColorMap<T> = { [K in ExtractBadgeKeys<T>]: ExtractColorKeys<T[K]> };
export type BadgeTypeColors<T> = ExtractColorKeys<T[keyof T]>;
export type BadgeTypes = "pill-color" | "color" | "modern";

// Badge color type - generic type for badge component color prop
// Note: This references internal badge color mappings
export type GenericBadgeColor =
    | "gray"
    | "brand"
    | "error"
    | "warning"
    | "success"
    | "gray-blue"
    | "blue-light"
    | "blue"
    | "indigo"
    | "purple"
    | "pink"
    | "orange";

// Badge Component Props
export interface BadgeProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    color?: BadgeColors;
    children: ReactNode;
    className?: string;
}

export interface BadgeWithDotProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    color?: BadgeColors;
    className?: string;
    children: ReactNode;
}

export interface BadgeWithIconProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    color?: BadgeColors;
    iconLeading?: IconComponentType;
    iconTrailing?: IconComponentType;
    children: ReactNode;
    className?: string;
}

export interface BadgeWithFlagProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    flag?: FlagTypes;
    color?: BadgeColors;
    children: ReactNode;
}

export interface BadgeWithImageProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    imgSrc: string;
    color?: BadgeColors;
    children: ReactNode;
}

export interface BadgeWithButtonProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    icon?: IconComponentType;
    color?: BadgeColors;
    children: ReactNode;
    buttonLabel?: string;
    onButtonClick?: import("react").MouseEventHandler<HTMLButtonElement>;
}

export interface BadgeIconProps<T extends BadgeTypes> {
    type?: T;
    size?: BadgeSizes;
    icon: IconComponentType;
    color?: BadgeColors;
    children?: ReactNode;
}

// Badge Group Types
export type BadgeGroupSize = "md" | "lg";
export type BadgeGroupColor = "brand" | "warning" | "error" | "gray" | "success";
export type BadgeGroupTheme = "light" | "modern";
export type BadgeGroupAlign = "leading" | "trailing";

export interface BadgeGroupProps {
    children?: string | ReactNode;
    addonText: string;
    size?: BadgeGroupSize;
    color: BadgeGroupColor;
    theme?: BadgeGroupTheme;
    align?: BadgeGroupAlign;
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    className?: string;
}

// ============================================================================
// Button Group Types (button-group/button-group.tsx)
// ============================================================================

export type ButtonGroupSize = "sm" | "md" | "lg";

export interface ButtonGroupItemProps extends ToggleButtonProps, RefAttributes<HTMLButtonElement> {
    iconLeading?: FC<{ className?: string }> | ReactNode;
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    onClick?: () => void;
    className?: string;
}

export interface ButtonGroupProps extends Omit<ToggleButtonGroupProps, "orientation">, RefAttributes<HTMLDivElement> {
    size?: ButtonGroupSize;
    className?: string;
}

// ============================================================================
// Tag Types (tags/*.tsx)
// ============================================================================

export interface TagCheckboxProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    isFocused?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
}

export interface TagCloseXProps extends AriaButtonProps, RefAttributes<HTMLButtonElement> {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export interface TagItem {
    id: string;
    label: string;
    count?: number;
    avatarSrc?: string;
    avatarContrastBorder?: boolean;
    dot?: boolean;
    dotClassName?: string;
    isDisabled?: boolean;
    onClose?: (id: string) => void;
}

export interface TagGroupProps extends AriaTagGroupProps, RefAttributes<HTMLDivElement> {
    label: string;
    size?: "sm" | "md" | "lg";
}

export type TagProps = AriaTagProps & RefAttributes<object> & Omit<TagItem, "label" | "id">;

// ============================================================================
// Textarea Types (textarea/textarea.tsx)
// ============================================================================

export interface TextAreaBaseProps extends AriaTextAreaProps {
    ref?: Ref<HTMLTextAreaElement>;
}

export interface TextFieldProps extends AriaTextFieldProps {
    label?: string;
    hint?: ReactNode;
    tooltip?: string;
    textAreaClassName?: TextAreaBaseProps["className"];
    ref?: Ref<HTMLDivElement>;
    textAreaRef?: TextAreaBaseProps["ref"];
    hideRequiredIndicator?: boolean;
    placeholder?: string;
    rows?: number;
    cols?: number;
    /**
     * Input size.
     * @default "sm"
     */
    size?: "sm" | "md";
    /** Callback for key down capture events */
    onKeyDownCapture?: (e: React.KeyboardEvent) => void;
}

// ============================================================================
// Toggle Types (toggle/toggle.tsx)
// ============================================================================

export interface ToggleBaseProps {
    size?: "sm" | "md";
    slim?: boolean;
    className?: string;
    isHovered?: boolean;
    isFocusVisible?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
}

export interface ToggleProps extends AriaSwitchProps {
    size?: "sm" | "md";
    label?: string;
    hint?: ReactNode;
    slim?: boolean;
}

// ============================================================================
// Tooltip Types (tooltip/tooltip.tsx)
// ============================================================================

export interface TooltipProps extends AriaTooltipTriggerComponentProps, Omit<AriaTooltipProps, "children"> {
    title: ReactNode;
    description?: ReactNode;
    arrow?: boolean;
    delay?: number;
}

export type TooltipTriggerProps = AriaButtonProps;

// ============================================================================
// File Upload Types (file-upload-trigger/file-upload-trigger.tsx)
// ============================================================================

export interface FileTriggerProps {
    acceptedFileTypes?: Array<string>;
    allowsMultiple?: boolean;
    defaultCamera?: "user" | "environment";
    onSelect?: (files: FileList | null) => void;
    children: ReactNode;
    acceptDirectory?: boolean;
}

// ============================================================================
// Progress Indicator Types (progress-indicators/*.tsx)
// ============================================================================

export interface ProgressBarCircleProps {
    value: number;
    min?: number;
    max?: number;
    size: "xxs" | "xs" | "sm" | "md" | "lg";
    label?: string;
    valueFormatter?: (value: number, valueInPercentage: number) => string | number;
}

export interface ProgressBarProps {
    value: number;
    min?: number;
    max?: number;
    className?: string;
    progressClassName?: string;
    valueFormatter?: (value: number, valueInPercentage: number) => string | number;
}

export type ProgressBarLabelPosition = "right" | "bottom" | "top-floating" | "bottom-floating";

export interface ProgressIndicatorWithTextProps extends ProgressBarProps {
    labelPosition?: ProgressBarLabelPosition;
}

// ============================================================================
// Radio Button Types (radio-buttons/radio-buttons.tsx)
// ============================================================================

export interface RadioGroupContextType {
    size?: "sm" | "md";
}

export interface RadioButtonBaseProps {
    size?: "sm" | "md";
    className?: string;
    isFocusVisible?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    variant?: "default" | "filled";
}

export interface RadioButtonProps extends AriaRadioProps {
    size?: "sm" | "md";
    label?: ReactNode;
    hint?: ReactNode;
    variant?: "default" | "filled";
    ref?: Ref<HTMLLabelElement>;
}

export interface RadioGroupProps extends RadioGroupContextType, AriaRadioGroupProps {
    children: ReactNode;
    className?: string;
}

// ============================================================================
// Slider Types (slider/slider.tsx)
// ============================================================================

export type SliderLabelPosition = "default" | "bottom" | "top-floating";

export interface SliderProps extends AriaSliderProps {
    labelPosition?: SliderLabelPosition;
    labelFormatter?: (value: number) => string;
    trackInactiveClassName?: string;
    trackActiveClassName?: string;
    thumbClassName?: string;
}

// ============================================================================
// Alert Types (alert/alert.tsx)
// ============================================================================

export type AlertVariant = "error" | "success" | "warning" | "info";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    heading?: string;
    message: ReactNode;
    variant?: AlertVariant;
    icon?: (props: IconProps) => React.JSX.Element;
    showIcon?: boolean;
}
// ============================================
// Container Types (base/container.tsx)
// ============================================

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export interface GridItemProps {
    children: ReactNode;
    className?: string;
    span?: number | string;
    mdSpan?: number | string;
    lgSpan?: number | string;
    xlSpan?: number | string;
}
