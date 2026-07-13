import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import tailwindReactAria from "tailwindcss-react-aria-components";

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    25: "var(--brand-25)",
                    50: "var(--brand-50)",
                    100: "var(--brand-100)",
                    200: "var(--brand-200)",
                    300: "var(--brand-300)",
                    400: "var(--brand-400)",
                    500: "var(--brand-500)",
                    600: "var(--brand-600)",
                    700: "var(--brand-700)",
                    800: "var(--brand-800)",
                    900: "var(--brand-900)",
                },
                gray: {
                    25: "var(--gray-25)",
                    50: "var(--gray-50)",
                    100: "var(--gray-100)",
                    200: "var(--gray-200)",
                    300: "var(--gray-300)",
                    400: "var(--gray-400)",
                    500: "var(--gray-500)",
                    600: "var(--gray-600)",
                    700: "var(--gray-700)",
                    800: "var(--gray-800)",
                    900: "var(--gray-900)",
                },
                success: {
                    25: "var(--success-25)",
                    50: "var(--success-50)",
                    100: "var(--success-100)",
                    200: "var(--success-200)",
                    300: "var(--success-300)",
                    400: "var(--success-400)",
                    500: "var(--success-500)",
                    600: "var(--success-600)",
                    700: "var(--success-700)",
                    800: "var(--success-800)",
                    900: "var(--success-900)",
                },
                warning: {
                    25: "var(--warning-25)",
                    50: "var(--warning-50)",
                    100: "var(--warning-100)",
                    200: "var(--warning-200)",
                    300: "var(--warning-300)",
                    400: "var(--warning-400)",
                    500: "var(--warning-500)",
                    600: "var(--warning-600)",
                    700: "var(--warning-700)",
                    800: "var(--warning-800)",
                    900: "var(--warning-900)",
                },
                error: {
                    25: "var(--error-25)",
                    50: "var(--error-50)",
                    100: "var(--error-100)",
                    200: "var(--error-200)",
                    300: "var(--error-300)",
                    400: "var(--error-400)",
                    500: "var(--error-500)",
                    600: "var(--error-600)",
                    700: "var(--error-700)",
                    800: "var(--error-800)",
                    900: "var(--error-900)",
                },
                blue: {
                    300: "var(--blue-300)",
                    400: "var(--blue-400)",
                    500: "var(--blue-500)",
                },
                indigo: {
                    400: "var(--indigo-400)",
                },
            },
            borderRadius: {
                xl: "1.5rem",
                "2xl": "2rem",
                "3xl": "2.5rem",
            },
            fontFamily: {
                sans: [
                    "-apple-system",
                    "BlinkMacSystemFont",
                    '"SF Pro Display"',
                    '"Segoe UI"',
                    "Roboto",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                ],
                heading: ["var(--font-sans-primary)", "sans-serif"],
                display: ["var(--font-sans-primary)", "sans-serif"],
                mono: ["var(--font-mono)", "var(--font-fallback-mono)"],
                body: ["var(--font-body)"],
            },
            boxShadow: {
                "card-sm": "0 8px 30px rgba(15, 23, 42, 0.06)",
                "card-lg": "0 24px 60px rgba(15, 23, 42, 0.08)",
                "brand-hover": "0 4px 16px 4px rgba(210, 107, 111, 0.4)",
            },
        },
    },
    plugins: [typography, tailwindReactAria, tailwindAnimate],
};

export default config;
