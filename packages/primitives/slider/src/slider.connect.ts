import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { SliderContext, SliderEvent, SliderState } from "./slider.types.js";

type SliderSend = (event: SliderEvent) => void;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapToStep(value: number, min: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  const decimals = String(step).split(".")[1]?.length ?? 0;
  return Number(snapped.toFixed(decimals));
}

function computeValueFromPointer(
  e: PointerEvent,
  trackEl: HTMLElement,
  ctx: { min: number; max: number; step: number; orientation: "horizontal" | "vertical" },
): number {
  const rect = trackEl.getBoundingClientRect();
  let percent: number;
  if (ctx.orientation === "horizontal") {
    percent = (e.clientX - rect.left) / rect.width;
  } else {
    percent = 1 - (e.clientY - rect.top) / rect.height;
  }
  percent = clamp(percent, 0, 1);
  const raw = ctx.min + percent * (ctx.max - ctx.min);
  return clamp(snapToStep(raw, ctx.min, ctx.step), ctx.min, ctx.max);
}

export function connectSlider(
  snapshot: MachineSnapshot<SliderContext, SliderState>,
  send: SliderSend,
  machine: Pick<MachineInstance<SliderContext, SliderState, SliderEvent>, "setContext">,
) {
  const { context } = snapshot;
  const { value, min, max, step, orientation, disabled } = context;
  const percent = ((value - min) / (max - min)) * 100;

  return {
    value,
    percent,
    isDragging: snapshot.value === "dragging",

    getRootProps() {
      return {
        "data-forge-scope": "slider",
        "data-forge-part": "root",
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
        style: {
          position: "relative" as const,
          userSelect: "none" as const,
          touchAction: "none" as const,
        },
      };
    },

    getTrackProps() {
      return {
        "data-forge-scope": "slider",
        "data-forge-part": "track",
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
        ref(el: HTMLElement | null) {
          machine.setContext({ trackEl: el });
        },
        onPointerDown(e: PointerEvent) {
          if (disabled || e.button !== 0) return;
          const trackEl = context.trackEl;
          if (!trackEl) return;
          e.preventDefault();
          const computedValue = computeValueFromPointer(e, trackEl, context);
          send({ type: "POINTER_DOWN", value: computedValue });
        },
      };
    },

    getRangeProps() {
      return {
        "data-forge-scope": "slider",
        "data-forge-part": "range",
        "data-orientation": orientation,
        style:
          orientation === "horizontal"
            ? { left: "0%", right: `${100 - percent}%` }
            : { bottom: "0%", top: `${100 - percent}%` },
      };
    },

    getThumbProps() {
      return {
        role: "slider" as const,
        tabIndex: disabled ? -1 : 0,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": value,
        "aria-orientation": orientation,
        "aria-disabled": disabled || undefined,
        "data-forge-scope": "slider",
        "data-forge-part": "thumb",
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
        style:
          orientation === "horizontal"
            ? { left: `${percent}%`, transform: "translateX(-50%)" }
            : { bottom: `${percent}%`, transform: "translateY(50%)" },
        onKeyDown(e: KeyboardEvent) {
          if (disabled) return;
          switch (e.key) {
            case "ArrowRight":
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT" });
              break;
            case "ArrowLeft":
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT" });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE" });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE" });
              break;
            case "Home":
              e.preventDefault();
              send({ type: "SET_VALUE", value: min });
              break;
            case "End":
              e.preventDefault();
              send({ type: "SET_VALUE", value: max });
              break;
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (disabled) return;
          switch (e.key) {
            case "ArrowRight":
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT" });
              break;
            case "ArrowLeft":
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT" });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE" });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE" });
              break;
            case "Home":
              e.preventDefault();
              send({ type: "SET_VALUE", value: min });
              break;
            case "End":
              e.preventDefault();
              send({ type: "SET_VALUE", value: max });
              break;
          }
        },
      };
    },

    getHiddenInputProps(name?: string) {
      return {
        type: "range" as const,
        name: name ?? undefined,
        value,
        min,
        max,
        step,
        disabled: disabled || undefined,
        "aria-hidden": true as const,
        style: { position: "absolute" as const, opacity: 0, pointerEvents: "none" as const },
        onChange() {},
      };
    },
  };
}

export type SliderApi = ReturnType<typeof connectSlider>;
