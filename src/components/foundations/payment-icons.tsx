"use client";

import React from "react";
import { PAYMENT_COLORS } from "@/config/colors.brand";

export const VisaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="32" rx="4" fill={PAYMENT_COLORS.VISA_BG} />
        <path
            d="M20.5 11.5L17 20.5H14.5L18.5 11.5H20.5ZM33.5 12.5L30.5 20.5H28L27 12.5H29L29.5 15.5L31 12.5H33.5ZM25.5 11.5L22.5 20.5H20L23 11.5H25.5ZM16.5 11.5L13.5 16.5L13 14.5L12.5 11.5H10.5L9 20.5H11.5L12.5 16.5L13.5 20.5H16L18 11.5H16.5Z"
            fill={PAYMENT_COLORS.WHITE}
        />
    </svg>
);

export const MastercardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="32" rx="4" fill={PAYMENT_COLORS.MASTERCARD_RED} />
        <circle cx="18" cy="16" r="6" fill={PAYMENT_COLORS.MASTERCARD_YELLOW} />
        <circle cx="30" cy="16" r="6" fill={PAYMENT_COLORS.MASTERCARD_ORANGE} />
        <path
            d="M24 10C22.5 11.5 21.5 13.5 21.5 16C21.5 18.5 22.5 20.5 24 22C25.5 20.5 26.5 18.5 26.5 16C26.5 13.5 25.5 11.5 24 10Z"
            fill={PAYMENT_COLORS.MASTERCARD_ORANGE}
        />
    </svg>
);

export const AmexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="32" rx="4" fill={PAYMENT_COLORS.AMEX_BG} />
        <path
            d="M12 14L10 18L8 14H12ZM20 14L18 18L16 14H20ZM28 14L26 18L24 14H28ZM36 14L34 18L32 14H36ZM16 20L14 16L12 20H16ZM24 20L22 16L20 20H24ZM32 20L30 16L28 20H32ZM40 20L38 16L36 20H40Z"
            fill={PAYMENT_COLORS.WHITE}
        />
    </svg>
);

export const DiscoverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="32" rx="4" fill={PAYMENT_COLORS.DISCOVER_BG} />
        <circle cx="24" cy="16" r="8" fill={PAYMENT_COLORS.WHITE} />
        <path
            d="M24 10C20.5 10 17.5 12 16 15L20 15C20.5 13.5 22 12.5 24 12.5C26 12.5 27.5 13.5 28 15L32 15C30.5 12 27.5 10 24 10ZM24 22C27.5 22 30.5 20 32 17L28 17C27.5 18.5 26 19.5 24 19.5C22 19.5 20.5 18.5 20 17L16 17C17.5 20 20.5 22 24 22Z"
            fill={PAYMENT_COLORS.DISCOVER_BG}
        />
    </svg>
);

export const UnionPayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="48" height="32" rx="4" fill={PAYMENT_COLORS.UNIONPAY_BG} />
        <path
            d="M24 10C20 10 17 13 17 16C17 19 20 22 24 22C28 22 31 19 31 16C31 13 28 10 24 10ZM24 20C21.5 20 19.5 18 19.5 16C19.5 14 21.5 12 24 12C26.5 12 28.5 14 28.5 16C28.5 18 26.5 20 24 20Z"
            fill={PAYMENT_COLORS.WHITE}
        />
    </svg>
);
