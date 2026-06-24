import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { SliderContext, SliderEvent, SliderState } from "./slider.types.js";

export type SliderSend = (event: SliderEvent) => void;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeValueFromPointer(
  e: PointerEvent,
  trackEl: Element,
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
  const snapped = Math.round((raw - ctx.min) / ctx.step) * ctx.step + ctx.min;
  const decimals = String(ctx.step).split(".")[1]?.length ?? 0;
  return clamp(Number(snapped.toFixed(decimals)), ctx.min, ctx.max);
}

function closestThumbIndex(pointerValue: number, values: number[]): number {
  let closest = 0;
  let minDist = Math.abs((values[0] ?? 0) - pointerValue);
  for (let i = 1; i < values.length; i++) {
    const dist = Math.abs((values[i] ?? 0) - pointerValue);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }
  return closest;
}

export function connectSlider(
  snapshot: MachineSnapshot<SliderContext, SliderState>,
  send: SliderSend,
  machine: Pick<MachineInstance<SliderContext, SliderState, SliderEvent>, "setContext">,
) {
  const { context } = snapshot;
  const { values, min, max, step, orientation, disabled } = context;

  const percents = values.map((v) => ((v - min) / (max - min)) * 100);

  return {
    values,
    percents,
    isDragging: snapshot.value === "dragging",
    activeThumb: context.activeThumb,

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
        ref(el: Element | null) {
          machine.setContext({ trackEl: el });
        },
        onPointerDown(e: PointerEvent) {
          if (disabled || e.button !== 0) return;
          const trackEl = context.trackEl;
          if (!trackEl) return;
          e.preventDefault();
          const computedValue = computeValueFromPointer(e, trackEl, context);
          const thumbIndex = closestThumbIndex(computedValue, values);
          send({ type: "POINTER_DOWN", value: computedValue, thumbIndex });
        },
      };
    },

    // Range fill: for single thumb fills from 0 to thumb; for multi fills between min/max thumb.
    getRangeProps() {
      const low = values.length > 1 ? Math.min(...percents) : 0;
      const high = Math.max(...percents);
      return {
        "data-forge-scope": "slider",
        "data-forge-part": "range",
        "data-orientation": orientation,
        style:
          orientation === "horizontal"
            ? { left: `${low}%`, right: `${100 - high}%` }
            : { bottom: `${low}%`, top: `${100 - high}%` },
      };
    },

    getThumbProps(thumbIndex: number) {
      const value = values[thumbIndex] ?? min;
      const percent = percents[thumbIndex] ?? 0;
      return {
        role: "slider" as const,
        tabIndex: disabled ? -1 : 0,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": value,
        "aria-valuetext": context.getValueLabel?.(value, thumbIndex),
        "aria-orientation": orientation,
        "aria-disabled": disabled || undefined,
        "data-forge-scope": "slider",
        "data-forge-part": "thumb",
        "data-index": thumbIndex,
        "data-orientation": orientation,
        "data-disabled": disabled ? ("" as const) : undefined,
        "data-active":
          context.activeThumb === thumbIndex && snapshot.value === "dragging"
            ? ("" as const)
            : undefined,
        style:
          orientation === "horizontal"
            ? { position: "absolute" as const, left: `${percent}%`, transform: "translateX(-50%)" }
            : { position: "absolute" as const, bottom: `${percent}%`, transform: "translateY(50%)" },
        onPointerDown(e: PointerEvent) {
          if (disabled || e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation(); // prevent track handler from double-firing when thumb overlaps track
          (e.currentTarget as HTMLElement).focus();
          send({ type: "POINTER_DOWN", value: values[thumbIndex] ?? min, thumbIndex });
        },
        onPointerdown(e: PointerEvent) {
          if (disabled || e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as HTMLElement).focus();
          send({ type: "POINTER_DOWN", value: values[thumbIndex] ?? min, thumbIndex });
        },
        onKeyDown(e: KeyboardEvent) {
          if (disabled) return;
          switch (e.key) {
            case "ArrowRight":
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT", thumbIndex });
              break;
            case "ArrowLeft":
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT", thumbIndex });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE", thumbIndex });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE", thumbIndex });
              break;
            case "Home":
              e.preventDefault();
              send({ type: "SET_MIN", thumbIndex });
              break;
            case "End":
              e.preventDefault();
              send({ type: "SET_MAX", thumbIndex });
              break;
          }
        },
        onKeydown(e: KeyboardEvent) {
          if (disabled) return;
          switch (e.key) {
            case "ArrowRight":
            case "ArrowUp":
              e.preventDefault();
              send({ type: "INCREMENT", thumbIndex });
              break;
            case "ArrowLeft":
            case "ArrowDown":
              e.preventDefault();
              send({ type: "DECREMENT", thumbIndex });
              break;
            case "PageUp":
              e.preventDefault();
              send({ type: "INCREMENT_PAGE", thumbIndex });
              break;
            case "PageDown":
              e.preventDefault();
              send({ type: "DECREMENT_PAGE", thumbIndex });
              break;
            case "Home":
              e.preventDefault();
              send({ type: "SET_MIN", thumbIndex });
              break;
            case "End":
              e.preventDefault();
              send({ type: "SET_MAX", thumbIndex });
              break;
          }
        },
      };
    },

    getHiddenInputProps(name?: string, thumbIndex = 0) {
      const value = values[thumbIndex] ?? min;
      return {
        type: "range" as const,
        ...(name !== undefined && { name }),
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
