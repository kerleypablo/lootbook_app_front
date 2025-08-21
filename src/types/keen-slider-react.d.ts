declare module "keen-slider/react" {
  import { MutableRefObject } from "react";
  export function useKeenSlider<T = unknown>(options?: unknown): [MutableRefObject<T | null>];
}
