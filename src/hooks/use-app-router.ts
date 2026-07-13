import { useMemo } from "react";
import { useRouter as useNextRouter } from "next/navigation";
import NProgress from "nprogress";

export function useAppRouter() {
    const router = useNextRouter();
    const appRouter = router as typeof router & { back?: () => void };

    return useMemo(
        () => ({
            ...router,
            back: () => {
                NProgress.start();
                appRouter.back?.();
            },
            push: (...args: Parameters<typeof router.push>) => {
                NProgress.start();
                router.push(...args);
            },
            replace: (...args: Parameters<typeof router.replace>) => {
                NProgress.start();
                router.replace(...args);
            },
        }),
        [router, appRouter],
    );
}
