import Image from "next/image";
import {
    RIKKEI_LOGO_PATH,
    RIKKEI_LOGO_SPLASH_WIDTH,
} from "@/constants/auth.constants";
import { LMS_ICONS } from "@/constants/lms-icons.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { AuthSplashProps } from "@/types/auth-components.types";

export function AuthSplash({ onStart }: AuthSplashProps) {
    return (
        <div className="relative mx-auto max-w-[440px] text-center">
            <div className="mx-auto mb-[22px] inline-block rounded-[18px] bg-white px-[26px] py-[18px] shadow-[0_20px_44px_-16px_rgba(0,0,0,0.5)]">
                <Image
                    src={RIKKEI_LOGO_PATH}
                    alt={UI_TEXT.auth.login.logoAlt}
                    width={RIKKEI_LOGO_SPLASH_WIDTH}
                    height={80}
                    className="mx-auto block h-auto w-full max-w-[240px]"
                    priority
                />
            </div>

            <h1 className="mt-2 font-display text-[34px] leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
                {UI_TEXT.auth.splash.headlineLine1}
                <br />
                {UI_TEXT.auth.splash.headlineLine2}
            </h1>

            <p className="mt-3.5 text-[15px] leading-relaxed text-brand-100">{UI_TEXT.auth.splash.subtitle}</p>

            <button
                type="button"
                onClick={onStart}
                className="mt-7 rounded-[15px] bg-white px-10 py-[15px] text-base font-extrabold text-brand-500 shadow-[0_16px_34px_-12px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5"
            >
                {UI_TEXT.auth.splash.startButton}
            </button>

            <div className="mt-[30px] flex flex-wrap items-center justify-center gap-[22px] text-[12.5px] font-semibold text-brand-200">
                <span className="inline-flex items-center gap-1.5">
                    <Image src={LMS_ICONS.GAMEPAD} alt="" width={16} height={16} className="size-4 brightness-0 invert" />
                    {UI_TEXT.auth.splash.featurePlay}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Image src={LMS_ICONS.COMPASS} alt="" width={16} height={16} className="size-4 brightness-0 invert" />
                    {UI_TEXT.auth.splash.featurePath}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <Image src={LMS_ICONS.ROBOT} alt="" width={16} height={16} className="size-4 brightness-0 invert" />
                    {UI_TEXT.auth.splash.featureAi}
                </span>
            </div>
        </div>
    );
}
