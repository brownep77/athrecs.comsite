import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  let firstClientRestoration = true;
  let initialLocation: { href: string; historyKey: string | undefined } | undefined;
  const router = createRouter({
    routeTree,
    scrollRestoration: ({ location }) => {
      if (typeof window === "undefined") return true;
      if (!firstClientRestoration) return true;
      firstClientRestoration = false;

      // Server HTML may already be scrolled before hydration. Preserve that
      // position once, while keeping normal restoration for later navigations.
      if (
        location.href === initialLocation?.href &&
        location.state.__TSR_key === initialLocation.historyKey &&
        (window.scrollX !== 0 || window.scrollY !== 0)
      ) {
        // The router clears its tracked targets before this callback. Register
        // the preserved position so Back works without another user scroll.
        document.dispatchEvent(new Event("scroll"));
        return false;
      }
      return true;
    },
    defaultPreload: "intent",
    defaultErrorComponent: AppErrorComponent,
  });
  initialLocation = {
    href: router.latestLocation.href,
    historyKey: router.latestLocation.state.__TSR_key,
  };
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
