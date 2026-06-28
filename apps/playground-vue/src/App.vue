<script setup lang="ts">
import {
  Accordion,
  AlertDialog,
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  CheckboxControl,
  CheckboxGroup,
  CheckboxGroupAll,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxRoot,
  Collapsible,
  Combobox,
  ContextMenu,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogPortal,
  Field,
  FieldGroup,
  FieldGroupLabel,
  FieldRequiredIndicator,
  HoverCard,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  injectAvatarContext,
  Menu,
  NumberInput,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Slider,
  SwitchControl,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
  Tabs,
  TagsInput,
  TimePicker,
  Toggle,
  ToggleGroup,
  TooltipAnchor,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  useAvatar,
  useDatePickerContext,
  useDateRangePickerContext,
  useDialog,
  VisuallyHidden,
} from "@forge-ui/vue";
import { defineComponent, h, ref } from "vue";

const calendarCellStyle = {
  textAlign: "center" as const,
  padding: "5px 2px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "0.8rem",
  lineHeight: 1,
};

const calPickerCellStyle = {
  textAlign: "center" as const,
  padding: "8px 4px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "0.8rem",
};
const calNavBtn = {
  padding: "0.25rem 0.6rem",
  background: "transparent",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const DatePickerCalendarContent = defineComponent({
  name: "DatePickerCalendarContent",
  setup() {
    const api = useDatePickerContext();
    return () => {
      const view = api.view.value;
      // "open.month" handles no navigation events — only day/year views have prev/next buttons
      const prevBtn =
        view === "day"
          ? h(
              DatePicker.PrevMonthButton,
              { "data-testid": "date-picker-prev", style: calNavBtn },
              { default: () => "←" },
            )
          : view === "year"
            ? h(DatePicker.PrevYearRangeButton, { style: calNavBtn }, { default: () => "←" })
            : h("span", { style: { width: "2rem" } });
      const nextBtn =
        view === "day"
          ? h(
              DatePicker.NextMonthButton,
              { "data-testid": "date-picker-next", style: calNavBtn },
              { default: () => "→" },
            )
          : view === "year"
            ? h(DatePicker.NextYearRangeButton, { style: calNavBtn }, { default: () => "→" })
            : h("span", { style: { width: "2rem" } });

      const header = h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          },
        },
        [
          prevBtn,
          h(
            DatePicker.ViewSwitchButton,
            {
              "data-testid": "date-picker-header",
              style: {
                fontWeight: 600,
                fontSize: "0.875rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
              },
            },
            { default: () => [api.monthYearLabel.value] },
          ),
          nextBtn,
        ],
      );

      let body;
      if (view === "day") {
        const weekdays = api.weekdays.value;
        const weeks = api.weeks.value;
        body = h(
          DatePicker.CalendarGrid,
          { "data-testid": "date-picker-grid", style: { display: "grid", gap: "2px" } },
          {
            default: () => [
              h(
                DatePicker.CalendarRow,
                {
                  weekIndex: -1,
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "2px",
                    marginBottom: "4px",
                  },
                },
                {
                  default: () =>
                    weekdays.map((_, i) =>
                      h(DatePicker.WeekdayHeader, {
                        dayIndex: i,
                        style: {
                          textAlign: "center",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "#94a3b8",
                        },
                      }),
                    ),
                },
              ),
              ...weeks.map((week, wi) =>
                h(
                  DatePicker.CalendarRow,
                  {
                    weekIndex: wi,
                    style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" },
                  },
                  {
                    default: () =>
                      week.map((cell) =>
                        h(DatePicker.CalendarCell, {
                          date: cell.date,
                          isOutsideMonth: cell.isOutsideMonth,
                          style: { ...calendarCellStyle, opacity: cell.isOutsideMonth ? 0.35 : 1 },
                        }),
                      ),
                  },
                ),
              ),
            ],
          },
        );
      } else if (view === "month") {
        body = h(
          DatePicker.MonthGrid,
          { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" } },
          {
            default: () =>
              Array.from({ length: 12 }, (_, i) =>
                h(DatePicker.MonthCell, { month: i + 1, style: calPickerCellStyle }),
              ),
          },
        );
      } else {
        body = h(
          DatePicker.YearGrid,
          { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" } },
          {
            default: () =>
              api.yearRange.value.map((year) =>
                h(DatePicker.YearCell, { year, style: calPickerCellStyle }),
              ),
          },
        );
      }

      return h("div", {}, [header, body]);
    };
  },
});

const DateRangePickerCalendarGrid = defineComponent({
  name: "DateRangePickerCalendarGrid",
  setup() {
    const api = useDateRangePickerContext();
    return () => {
      const weekdays = api.weekdays.value;
      const weeks = api.weeksPerMonth.value[0] ?? [];
      return h(
        DateRangePicker.CalendarGrid,
        { style: { display: "grid", gap: "2px" } },
        {
          default: () => [
            h(
              DateRangePicker.CalendarRow,
              {
                weekIndex: -1,
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "2px",
                  marginBottom: "4px",
                },
              },
              {
                default: () =>
                  weekdays.map((_, i) =>
                    h(DateRangePicker.WeekdayHeader, {
                      dayIndex: i,
                      style: {
                        textAlign: "center",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#94a3b8",
                      },
                    }),
                  ),
              },
            ),
            ...weeks.map((week, wi) =>
              h(
                DateRangePicker.CalendarRow,
                {
                  weekIndex: wi,
                  style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" },
                },
                {
                  default: () =>
                    week.map((cell) =>
                      h(DateRangePicker.CalendarCell, {
                        date: cell.date,
                        isOutsideMonth: cell.isOutsideMonth,
                        style: { ...calendarCellStyle, opacity: cell.isOutsideMonth ? 0.35 : 1 },
                      }),
                    ),
                },
              ),
            ),
          ],
        },
      );
    };
  },
});

const locale = typeof navigator !== "undefined" ? navigator.language : "en";

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);
const selectedValue = ref<string[]>([]);
const selectedMultiple = ref<string[]>([]);
const checkboxControlled = ref<boolean | "indeterminate">("indeterminate");
const groupValues = ref<string[]>(["react"]);
const switchOn = ref(false);

const dateFieldValue = ref<{ year: number; month: number; day: number } | null>(null);
const timePickerValue = ref<{ hours: number; minutes: number; seconds: number } | null>(null);
const datePickerSelected = ref<string | null>(null);
const dateRangePickerRange = ref<string | null>(null);

// ── Menu state ───────────────────────────────────────────────────────────────
const menuLastSelect = ref<string | null>(null);
const menuTheme = ref("system");
const menuShowGrid = ref(false);
const menuShowRuler = ref(true);
const menuClickOnlySelect = ref<string | null>(null);
const menuAnchorOpen = ref(false);
const menuAnchorSelect = ref<string | null>(null);
const ctxMenuSelect = ref<string | null>(null);
const ctxMenuBookmarked = ref(false);

const menuContentStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "4px",
  boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)",
  minWidth: "160px",
  outline: "none",
} as const;
const menuItemStyle = {
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.875rem",
  outline: "none",
  userSelect: "none" as const,
};
const menuGroupLabelStyle = {
  padding: "4px 12px 2px",
  fontSize: "0.7rem",
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};
const menuSepStyle = { height: "1px", background: "#e2e8f0", margin: "4px 0" };

function onDateFieldChange(d: { year: number; month: number; day: number } | null) {
  dateFieldValue.value = d;
}
function onTimePickerChange(t: { hours: number; minutes: number; seconds: number } | null) {
  timePickerValue.value = t;
}
function onDatePickerChange(d: { year: number; month: number; day: number } | null) {
  datePickerSelected.value = d
    ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
    : null;
}
function onDateRangePickerChange(
  r: {
    start: { year: number; month: number; day: number } | null;
    end: { year: number; month: number; day: number } | null;
  } | null,
) {
  if (r?.start && r?.end) {
    dateRangePickerRange.value = `${r.start.year}-${String(r.start.month).padStart(2, "0")}-${String(r.start.day).padStart(2, "0")} → ${r.end.year}-${String(r.end.month).padStart(2, "0")}-${String(r.end.day).padStart(2, "0")}`;
  } else {
    dateRangePickerRange.value = null;
  }
}

const toggleBold = ref(false);
const toggleItalic = ref(true);
const toggleGroupAlign = ref<string[]>([]);
const toggleGroupFormats = ref<string[]>([]);

const alertConfirming = ref(false);
function handleAlertConfirm() {
  alertConfirming.value = true;
  setTimeout(() => {
    alertConfirming.value = false;
    console.log("[AlertDialog] confirmed");
  }, 1200);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const btnStyle = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
} as const;

const btnGhostStyle = {
  ...btnStyle,
  background: "transparent",
  color: "#1e293b",
  border: "1px solid #cbd5e1",
} as const;

const btnDangerStyle = { ...btnStyle, background: "#dc2626" } as const;
const tooltipStyle = {
  background: "#1e293b",
  color: "#f1f5f9",
  borderRadius: "6px",
  padding: "0.35rem 0.6rem",
  fontSize: "0.8rem",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.2)",
  maxWidth: "240px",
} as const;

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgb(0 0 0 / 0.45)",
};

const contentStyle = {
  position: "fixed" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "1.75rem",
  minWidth: "340px",
  maxWidth: "480px",
  width: "90vw",
  boxShadow: "0 24px 64px rgb(0 0 0 / 0.18)",
};

const popoverStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "1rem",
  minWidth: "220px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
};

const titleStyle = { margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 };
const descStyle = {
  color: "#64748b",
  marginBottom: "1.5rem",
  fontSize: "0.875rem",
  lineHeight: 1.5,
};
const footerStyle = { display: "flex", justifyContent: "flex-end", gap: "0.5rem" };
const sectionStyle = { padding: "1.5rem 0", borderBottom: "1px solid #e2e8f0" };
const sectionTitleStyle = { margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600 };
const sectionDescStyle = { margin: "0 0 1rem", color: "#64748b", fontSize: "0.8rem" };

const avatarRootStyle = {
  display: "inline-flex",
  position: "relative",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  overflow: "hidden",
  background: "#e2e8f0",
};
const avatarImgStyle = { width: "100%", height: "100%", objectFit: "cover" };
const avatarFallbackStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  background: "#e2e8f0",
};

// Reads initials from the nearest <Avatar.Root> via injectAvatarContext.
// injectAvatarContext must be called inside setup() — hence the defineComponent wrapper.
const AvatarInitialsFallback = defineComponent({
  name: "AvatarInitialsFallback",
  props: { style: { type: Object, default: undefined } },
  setup(props, { slots }) {
    const { initials } = injectAvatarContext();
    return () =>
      h(
        AvatarFallback,
        { style: props.style },
        {
          default: () => initials.value || slots["default"]?.(),
        },
      );
  },
});

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.35rem",
};
const selectTriggerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  minWidth: "200px",
  background: "#fff",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
} as const;
const selectContentStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none",
  margin: 0,
} as const;
const selectItemStyle = {
  padding: "0.45rem 0.75rem",
  borderRadius: "4px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
};
const separatorStyle = {
  height: "1px",
  background: "#e2e8f0",
  margin: "0.25rem 0",
  listStyle: "none" as const,
};
const groupLabelStyle = {
  padding: "0.35rem 0.75rem 0.15rem",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  listStyle: "none" as const,
};

const checkboxControlStyle = {
  width: "18px",
  height: "18px",
  border: "2px solid #cbd5e1",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  flexShrink: 0,
};
const checkboxIndicatorStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#1e293b",
  lineHeight: 1,
};
const checkboxLabelStyle = { fontSize: "0.875rem", color: "#1e293b", cursor: "pointer" };
const switchOffStyle = {
  width: "44px",
  height: "24px",
  borderRadius: "12px",
  background: "#cbd5e1",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  display: "flex",
  alignItems: "center",
  transition: "background 0.15s",
  flexShrink: 0,
};
const switchOnStyle = { ...switchOffStyle, background: "#1e293b" };
const switchThumbOffStyle = {
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 1px 3px rgb(0 0 0 / 0.2)",
  transform: "translateX(0)",
  transition: "transform 0.15s",
};
const switchThumbOnStyle = { ...switchThumbOffStyle, transform: "translateX(20px)" };

const comboboxContentStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none" as const,
  margin: 0,
  maxHeight: "200px",
  overflowY: "auto" as const,
};
const comboboxItemStyle = {
  padding: "0.45rem 0.75rem",
  borderRadius: "4px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

const hoverCardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "1rem",
  minWidth: "260px",
  maxWidth: "320px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
} as const;
const hoverCardAvatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#6366f1",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "1.1rem",
  flexShrink: 0,
} as const;
const hoverCardLinkStyle = {
  color: "#6366f1",
  fontWeight: 500,
  fontSize: "0.9rem",
  textDecoration: "underline",
  cursor: "pointer",
} as const;

const fieldInvalid = ref(false);
const fieldEmail = ref("");

const languages = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python" },
  { value: "rs", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "cs", label: "C#" },
];
const comboboxSelected = ref<string[]>([]);
const tagsInputTags = ref<string[]>(["TypeScript", "Vue"]);
const progressValue = ref(42);
const sliderValue = ref(50);
const numberInputValue = ref<number | null>(50);
const radioGroupValue = ref<string>("react");
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Vue Playground</h1>

    <!-- ── Animations CSS (data-state) ──────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Animations CSS (data-state)</h2>
      <p :style="sectionDescStyle">Transitions d'entrée/sortie CSS-only via data-state. Aucune librairie externe.</p>
      <!-- Le CSS data-state fait le travail — watchPresence maintient le composant monté jusqu'à animationend -->
      <Dialog.Root :on-open-change="(o) => console.log('[AnimatedDialog] open:', o)">
        <Dialog.Trigger :style="btnStyle">Dialog avec animation</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Dialog animé</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Le CSS <code>data-state</code> fait le travail — aucune prop <code>forceMount</code> nécessaire.
              <code>watchPresence</code> maintient le composant monté jusqu'à <code>animationend</code>.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnGhostStyle">Annuler</Dialog.Close>
              <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog standard ─────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog</h2>
      <p :style="sectionDescStyle">Modal avec Escape + click outside pour fermer.</p>
      <Dialog.Root :on-open-change="(o) => console.log('[Dialog] open:', o)">
        <Dialog.Trigger :style="btnStyle">Ouvrir le dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Paramètres du compte</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Modifiez votre profil. Echap ou click outside pour fermer.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnGhostStyle">Annuler</Dialog.Close>
              <Dialog.Close :style="btnStyle">Sauvegarder</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog imbriqué ──────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog imbriqué</h2>
      <p :style="sectionDescStyle">Stack registry — seule la couche supérieure capte Escape.</p>
      <Dialog.Root>
        <Dialog.Trigger :style="btnStyle">Ouvrir dialog 1</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Dialog 1</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Echap ferme ce dialog. Ouvrez dialog 2 pour tester la stack.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Root>
                <Dialog.Trigger :style="btnStyle">Ouvrir dialog 2</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay :style="{ ...overlayStyle, background: 'rgb(0 0 0 / 0.6)' }" />
                  <Dialog.Content :style="{ ...contentStyle, top: '45%' }">
                    <Dialog.Title :style="titleStyle">Dialog 2 (top layer)</Dialog.Title>
                    <Dialog.Description :style="descStyle">
                      Echap ferme uniquement ce dialog. Dialog 1 reste ouvert.
                    </Dialog.Description>
                    <div :style="footerStyle">
                      <Dialog.Close :style="btnStyle">Fermer dialog 2</Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <Dialog.Close :style="btnGhostStyle">Fermer dialog 1</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog contrôlé ──────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog contrôlé</h2>
      <p :style="sectionDescStyle">open + onOpenChange — état géré à l'extérieur.</p>
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <button :style="btnStyle" type="button" @click="controlledOpen = true">
          Ouvrir depuis l'extérieur
        </button>
        <span style="font-size:0.875rem;color:#64748b">
          État: <code>{{ controlledOpen ? 'ouvert' : 'fermé' }}</code>
        </span>
        <Dialog.Root :open="controlledOpen" :on-open-change="(o) => (controlledOpen = o)">
          <Dialog.Portal>
            <Dialog.Overlay :style="overlayStyle" />
            <Dialog.Content :style="contentStyle">
              <Dialog.Title :style="titleStyle">Dialog contrôlé</Dialog.Title>
              <Dialog.Description :style="descStyle">
                L'état est géré par le composant parent via <code>open</code> + <code>onOpenChange</code>.
              </Dialog.Description>
              <div :style="footerStyle">
                <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>

    <!-- ── Hook API ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Hook API useDialog</h2>
      <p :style="sectionDescStyle">Prop-getters manuels sans composants composés.</p>
      <button v-bind="hookDialog.getTriggerProps()" :style="btnStyle">Ouvrir (hook)</button>
      <template v-if="hookDialog.isOpen.value">
        <DialogPortal>
          <div v-bind="hookDialog.getOverlayProps()" :style="overlayStyle" />
          <div v-bind="hookDialog.getContentProps()" :style="contentStyle">
            <h2 v-bind="hookDialog.getTitleProps()" :style="titleStyle">Hook dialog</h2>
            <p v-bind="hookDialog.getDescriptionProps()" :style="descStyle">
              Ouvert via <code>useDialog()</code> — prop-getters étalés manuellement.
            </p>
            <div :style="footerStyle">
              <button v-bind="hookDialog.getCloseProps()" :style="btnStyle">Fermer</button>
            </div>
          </div>
        </DialogPortal>
      </template>
    </section>

    <!-- ── AlertDialog ───────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">AlertDialog</h2>
      <p :style="sectionDescStyle">
        Confirmation destructive — Escape et outside-click bloqués par WAI-ARIA.
      </p>
      <AlertDialog.Root :on-open-change="(o) => console.log('[AlertDialog] open:', o)">
        <AlertDialog.Trigger :style="btnDangerStyle">Supprimer le compte</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay :style="overlayStyle" />
          <AlertDialog.Content :style="contentStyle">
            <AlertDialog.Title :style="titleStyle">Supprimer définitivement ?</AlertDialog.Title>
            <AlertDialog.Description :style="descStyle">
              Cette action est irréversible. Escape et click en dehors ne ferment <strong>pas</strong> ce dialog.
            </AlertDialog.Description>
            <div :style="footerStyle">
              <AlertDialog.Cancel :style="btnGhostStyle">Annuler</AlertDialog.Cancel>
              <AlertDialog.Action
                :style="btnDangerStyle"
                @click="handleAlertConfirm"
                :disabled="alertConfirming"
              >
                {{ alertConfirming ? 'Suppression…' : 'Supprimer' }}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>

    <!-- ── Popover ────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Popover</h2>
      <p :style="sectionDescStyle">Floating, non-modal. Ferme sur outside-click.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Placement: bottom (défaut)</p>
          <Popover.Root>
            <Popover.Trigger :style="btnStyle">Ouvrir popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverStyle">
                <Popover.Title :style="{ ...titleStyle, fontSize: '0.9rem' }">Popover title</Popover.Title>
                <Popover.Description :style="descStyle">
                  Non-modal — outside-click et Escape ferment.
                </Popover.Description>
                <Popover.Close :style="btnGhostStyle">×</Popover.Close>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Placement: top</p>
          <Popover.Root :positioning="{ placement: 'top' }">
            <Popover.Trigger :style="btnStyle">Top popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverStyle">
                <Popover.Description :style="{ ...descStyle, marginBottom: 0 }">
                  Positionné au-dessus du trigger.
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec Popover.Arrow</p>
          <Popover.Root>
            <Popover.Trigger :style="btnStyle">Arrow popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="{ ...popoverStyle, position: 'relative' }">
                <Popover.Arrow>
                  <svg
                    width="12"
                    height="6"
                    viewBox="0 0 12 6"
                    style="position:absolute;top:-6px"
                    aria-hidden="true"
                  >
                    <path d="M0,6 L6,0 L12,6 Z" fill="#fff" stroke="#e2e8f0" stroke-width="1" stroke-linejoin="round" />
                  </svg>
                </Popover.Arrow>
                <Popover.Description :style="{ ...descStyle, marginBottom: 0 }">
                  Flèche centrée par Floating UI. Utilisez <code>data-side</code> pour la rotation CSS.
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </section>

    <!-- ── Select ─────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Select</h2>
      <p :style="sectionDescStyle">WAI-ARIA 1.2 Select-Only Combobox. Keyboard + typeahead.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Select simple</p>
          <Select.Root :on-value-change="(v) => selectedValue = v">
            <Select.Label :style="labelStyle">Framework</Select.Label>
            <Select.Trigger :style="selectTriggerStyle">
              <!-- Select.Placeholder : visible seulement quand aucune valeur n'est sélectionnée -->
              <Select.Value>
                <Select.Placeholder style="color:#94a3b8">Choisir un framework…</Select.Placeholder>
              </Select.Value>
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContentStyle">
                <Select.Item value="react" :style="selectItemStyle">React</Select.Item>
                <Select.Item value="vue" :style="selectItemStyle">Vue</Select.Item>
                <Select.Item value="angular" :style="selectItemStyle">Angular</Select.Item>
                <Select.Separator :style="separatorStyle" />
                <Select.Item value="svelte" :style="selectItemStyle">Svelte</Select.Item>
                <Select.Item value="solid" :style="selectItemStyle">Solid</Select.Item>
                <Select.Item value="qwik" :disabled="true" :style="{ ...selectItemStyle, opacity: 0.4 }">Qwik (désactivé)</Select.Item>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <p v-if="selectedValue.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
            Valeur: <code>{{ selectedValue[0] }}</code>
          </p>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec groupes</p>
          <Select.Root>
            <Select.Label :style="labelStyle">Langage</Select.Label>
            <Select.Trigger :style="selectTriggerStyle">
              <Select.Value placeholder="Choisir…" />
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContentStyle">
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelStyle">Frontend</Select.GroupLabel>
                  <Select.Item value="ts" :style="selectItemStyle">TypeScript</Select.Item>
                  <Select.Item value="js" :style="selectItemStyle">JavaScript</Select.Item>
                </Select.Group>
                <Select.Separator :style="separatorStyle" />
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelStyle">Backend</Select.GroupLabel>
                  <Select.Item value="go" :style="selectItemStyle">Go</Select.Item>
                  <Select.Item value="rust" :style="selectItemStyle">Rust</Select.Item>
                  <Select.Item value="python" :style="selectItemStyle">Python</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    </section>

    <!-- ── Select multiple ────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Select multiple</h2>
      <p :style="sectionDescStyle">Multi-sélection — reste ouvert après chaque choix.</p>
      <Select.Root :multiple="true" :on-value-change="(v) => selectedMultiple = v">
        <Select.Label :style="labelStyle">Intérêts</Select.Label>
        <Select.Trigger :style="selectTriggerStyle">
          <Select.Value placeholder="Sélectionner plusieurs…" />
          <span style="margin-left:auto;opacity:0.5">▾</span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content :style="selectContentStyle">
            <Select.Item value="design" :style="selectItemStyle">Design</Select.Item>
            <Select.Item value="dev" :style="selectItemStyle">Développement</Select.Item>
            <Select.Item value="ux" :style="selectItemStyle">UX Research</Select.Item>
            <Select.Item value="perf" :style="selectItemStyle">Performance</Select.Item>
            <Select.Item value="a11y" :style="selectItemStyle">Accessibilité</Select.Item>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <p v-if="selectedMultiple.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ selectedMultiple.join(', ') }}</code>
      </p>
    </section>

    <!-- ── Checkbox ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Checkbox</h2>
      <p :style="sectionDescStyle">Tri-state (unchecked / indeterminate / checked). Indicateur + Label associé.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <CheckboxRoot :default-checked="true">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">Accepter les CGU (uncontrolled)</CheckboxLabel>
          </div>
        </CheckboxRoot>
        <CheckboxRoot :checked="checkboxControlled" :on-checked-change="(v) => checkboxControlled = v">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">
                {{ checkboxControlled === 'indeterminate' ? '—' : '✓' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">
              Controlled — état: <code>{{ String(checkboxControlled) }}</code>
            </CheckboxLabel>
          </div>
        </CheckboxRoot>
        <CheckboxRoot :disabled="true">
          <div style="display:flex;align-items:center;gap:0.5rem;opacity:0.4">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">Désactivé</CheckboxLabel>
          </div>
        </CheckboxRoot>
      </div>
    </section>

    <!-- ── Checkbox.Group ─────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Checkbox.Group + GroupAll</h2>
      <p :style="sectionDescStyle">Select-all natif. GroupAll dérive indeterminate automatiquement.</p>
      <CheckboxGroup v-model:value="groupValues">
        <CheckboxGroupAll>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
            <CheckboxControl :style="{ ...checkboxControlStyle, background: '#f1f5f9' }">
              <CheckboxIndicator :style="checkboxIndicatorStyle">
                {{ groupValues.length === 3 ? '✓' : '—' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="{ ...checkboxLabelStyle, fontWeight: 600 }">Tout sélectionner</CheckboxLabel>
          </div>
        </CheckboxGroupAll>
        <CheckboxRoot v-for="item in [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }]" :key="item.value" :value="item.value">
          <div style="display:flex;align-items:center;gap:0.5rem;padding-left:1.25rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">{{ item.label }}</CheckboxLabel>
          </div>
        </CheckboxRoot>
      </CheckboxGroup>
      <p style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ groupValues.join(', ') || 'aucun' }}</code>
      </p>
    </section>

    <!-- ── Switch ────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Switch</h2>
      <p :style="sectionDescStyle">Toggle binaire. role=switch, hidden input auto.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <SwitchRoot :checked="switchOn" :on-checked-change="(v) => switchOn = v">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="switchOn ? switchOnStyle : switchOffStyle">
              <SwitchThumb :style="switchOn ? switchThumbOnStyle : switchThumbOffStyle" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabelStyle">
              Notifications — <code>{{ switchOn ? 'activées' : 'désactivées' }}</code>
            </SwitchLabel>
          </div>
        </SwitchRoot>
        <SwitchRoot :default-checked="true" :disabled="true">
          <div style="display:flex;align-items:center;gap:0.75rem;opacity:0.4">
            <SwitchControl :style="switchOnStyle">
              <SwitchThumb :style="switchThumbOnStyle" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabelStyle">Désactivé (on)</SwitchLabel>
          </div>
        </SwitchRoot>

        <SwitchRoot :invalid="true">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="{ ...switchOffStyle, borderColor: '#dc2626', outline: '1px solid #dc2626' }">
              <SwitchThumb :style="switchThumbOffStyle" />
            </SwitchControl>
            <SwitchLabel :style="{ ...checkboxLabelStyle, color: '#dc2626' }">
              État invalide (data-invalid + aria-invalid)
            </SwitchLabel>
          </div>
        </SwitchRoot>
      </div>
    </section>

    <!-- ── Tooltip ───────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Tooltip</h2>
      <p :style="sectionDescStyle">Survol/focus. Provider skip-delay SSR-safe.</p>
      <TooltipProvider :open-delay="400" :close-delay="200" :skip-delay="300">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
          <TooltipRoot>
            <TooltipTrigger :style="btnStyle">Survol (400ms)</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Ouvre après 400ms — délai Provider</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btnStyle">Skip-delay</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Instantané si un tooltip vient de fermer</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :interactive="true">
            <TooltipTrigger :style="btnStyle">Interactive</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="{ ...tooltipStyle, padding: '0.5rem 0.75rem' }">
                <p style="margin:0 0 0.25rem;font-size:0.8rem">Cliquez le lien ↓</p>
                <a href="#" style="color:#38bdf8;font-size:0.8rem">Lien dans le tooltip</a>
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :disabled="true">
            <TooltipTrigger :style="{ ...btnStyle, opacity: 0.5 }" :disabled="true">Désactivé</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Ne s'affiche pas</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :positioning="{ placement: 'bottom' }">
            <TooltipTrigger :style="btnGhostStyle">Placement bas</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">placement="bottom"</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btnGhostStyle">Anchor demo</TooltipTrigger>
            <!-- TooltipAnchor redirige le positioner vers cet élément -->
            <TooltipAnchor>
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-left:0.5rem;vertical-align:middle" />
            </TooltipAnchor>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Positionné sur le point orange ↑</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </div>
      </TooltipProvider>
    </section>

    <!-- ── HoverCard ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">HoverCard</h2>
      <p :style="sectionDescStyle">Aperçu au survol. openDelay=700ms, closeDelay=300ms. Contenu interactif possible.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <HoverCardRoot>
          <HoverCardTrigger :asChild="true">
            <a :style="hoverCardLinkStyle" href="#" @click.prevent>@forge-ui</a>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent :style="hoverCardStyle">
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
                <div :style="hoverCardAvatarStyle">F</div>
                <div>
                  <p style="margin:0;font-weight:600;font-size:0.9rem">forge-ui</p>
                  <p style="margin:0;font-size:0.75rem;color:#64748b">@forge-ui · headless UI</p>
                </div>
              </div>
              <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#374151;line-height:1.5">
                Bibliothèque de primitives UI headless. Architecture 3 niveaux : machine → connect → bindings.
              </p>
              <div style="display:flex;gap:1rem;font-size:0.75rem;color:#64748b">
                <span><strong style="color:#1e293b">142</strong> Following</span>
                <span><strong style="color:#1e293b">2.4k</strong> Followers</span>
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>

        <HoverCard.Root :positioning="{ placement: 'bottom' }">
          <HoverCard.Trigger :asChild="true">
            <a :style="hoverCardLinkStyle" href="#" @click.prevent>Placement bottom</a>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content :style="hoverCardStyle">
              <p style="margin:0;font-size:0.85rem;color:#374151">
                HoverCard positionné en dessous. Survolez le contenu pour maintenir l'ouverture.
              </p>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </div>
    </section>

    <!-- ── Field ────────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Field</h2>
      <p :style="sectionDescStyle">Champ accessible : Label + RequiredIndicator + Description + Error + Group.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <Field.Root id="vue-field-email" :invalid="fieldInvalid" :required="true">
          <Field.Label :style="labelStyle">
            Email <FieldRequiredIndicator style="color:#dc2626;margin-left:0.15rem" />
          </Field.Label>
          <Field.Control>
            <input
              v-model="fieldEmail"
              type="email"
              placeholder="vous@exemple.fr"
              style="padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:220px"
              @blur="fieldInvalid = fieldEmail.length > 0 && !fieldEmail.includes('@')"
            />
          </Field.Control>
          <Field.Description style="font-size:0.75rem;color:#64748b">Entrez votre adresse e-mail.</Field.Description>
          <Field.Error style="font-size:0.75rem;color:#dc2626">Adresse e-mail invalide.</Field.Error>
        </Field.Root>

        <FieldGroup data-testid="field-group" style="display:flex;flex-direction:column;gap:0.5rem">
          <FieldGroupLabel :style="labelStyle">Notifications</FieldGroupLabel>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="vue-notif-email" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par email</Field.Label>
            </div>
          </Field.Root>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="vue-notif-sms" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par SMS</Field.Label>
            </div>
          </Field.Root>
        </FieldGroup>

      </div>
    </section>

    <!-- ── Combobox ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Combobox</h2>
      <p :style="sectionDescStyle">WAI-ARIA 1.2 Combobox. Filtre client-side, multi-select.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Single-select (filtre client-side)</p>
          <Combobox.Root :on-value-change="(v) => comboboxSelected = v">
            <Combobox.Label :style="labelStyle">Langage préféré</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhostStyle">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item
                  v-for="l in languages"
                  :key="l.value"
                  :value="l.value"
                  :label="l.label"
                  :style="comboboxItemStyle"
                >
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
          <p v-if="comboboxSelected.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
            Sélectionné : {{ comboboxSelected.join(', ') }}
          </p>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Multi-select</p>
          <Combobox.Root :multiple="true">
            <Combobox.Label :style="labelStyle">Langages maîtrisés</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item
                  v-for="l in languages"
                  :key="l.value"
                  :value="l.value"
                  :label="l.label"
                  :style="comboboxItemStyle"
                >
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec groupes</p>
          <Combobox.Root>
            <Combobox.Label :style="labelStyle">Langage</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabelStyle">Frontend</Combobox.GroupLabel>
                  <Combobox.Item value="ts" label="TypeScript" :style="comboboxItemStyle"><Combobox.ItemText>TypeScript</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="js" label="JavaScript" :style="comboboxItemStyle"><Combobox.ItemText>JavaScript</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabelStyle">Backend</Combobox.GroupLabel>
                  <Combobox.Item value="py" label="Python" :style="comboboxItemStyle"><Combobox.ItemText>Python</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="rs" label="Rust" :style="comboboxItemStyle"><Combobox.ItemText>Rust</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="go" label="Go" :style="comboboxItemStyle"><Combobox.ItemText>Go</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Creatable — crée une option absente</p>
          <Combobox.Root :on-create-option="(v) => console.log('Créer:', v)">
            <Combobox.Label :style="labelStyle">Langage personnalisé</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhostStyle">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item v-for="l in languages" :key="l.value" :value="l.value" :label="l.label" :style="comboboxItemStyle">
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
                <Combobox.CreateOption :style="{ ...comboboxItemStyle, fontStyle: 'italic', color: '#6366f1' }" />
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>
    </section>

    <!-- ── TagsInput ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">TagsInput</h2>
      <p :style="sectionDescStyle">Saisie libre de tags. Enter=ajouter, Backspace=supprimer dernier.</p>
      <TagsInput.Root
        :value="tagsInputTags"
        :on-value-change="(v) => tagsInputTags = v"
        style="border:1px solid #cbd5e1;border-radius:8px;padding:0.375rem 0.5rem;display:flex;flex-wrap:wrap;gap:0.375rem;align-items:center;background:#fff;cursor:text;min-width:280px"
      >
        <TagsInput.Tag
          v-for="tag in tagsInputTags"
          :key="tag"
          :value="tag"
          style="display:flex;align-items:center;gap:0.25rem;background:#e2e8f0;border-radius:4px;padding:0.15rem 0.375rem 0.15rem 0.5rem;font-size:0.875rem;color:#1e293b"
        >
          {{ tag }}
          <TagsInput.TagDelete
            :value="tag"
            style="border:none;background:none;cursor:pointer;color:#64748b;padding:0 0.1rem;line-height:1;font-size:1rem"
          />
        </TagsInput.Tag>
        <TagsInput.Input
          style="border:none;outline:none;font-size:0.875rem;min-width:120px;flex:1;background:transparent;padding:0.15rem 0"
          placeholder="Ajouter un tag…"
        />
      </TagsInput.Root>
      <p v-if="tagsInputTags.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Tags : {{ tagsInputTags.join(', ') }}
      </p>
    </section>

    <!-- ── Accordion ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Accordion</h2>
      <p :style="sectionDescStyle">Panneau accordéon — single, multiple, ou collapsible.</p>
      <div style="width:100%;max-width:400px">
        <Accordion.Root type="single" :collapsible="true" :default-value="[]">
          <Accordion.Item value="what">
            <Accordion.Header>
              <Accordion.Trigger data-testid="accordion-trigger-what" style="width:100%;display:flex;justify-content:space-between;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500">
                Qu'est-ce que forge-ui ? <span aria-hidden="true">▾</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content data-testid="accordion-content-what" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
              Une bibliothèque de composants UI headless avec architecture 3 niveaux.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="why" style="margin-top:0.5rem">
            <Accordion.Header>
              <Accordion.Trigger data-testid="accordion-trigger-why" style="width:100%;display:flex;justify-content:space-between;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500">
                Pourquoi headless ? <span aria-hidden="true">▾</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content data-testid="accordion-content-why" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
              Vous gardez le contrôle total du CSS — aucun style imposé.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </section>

    <!-- ── Collapsible ───────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Collapsible</h2>
      <p :style="sectionDescStyle">Toggle simple — un contenu masqué/révélé.</p>
      <Collapsible.Root style="width:100%;max-width:400px">
        <Collapsible.Trigger data-testid="collapsible-trigger" style="width:100%;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500;text-align:left;display:flex;justify-content:space-between">
          Voir les détails <span aria-hidden="true">▾</span>
        </Collapsible.Trigger>
        <Collapsible.Content data-testid="collapsible-content" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
          Contenu masqué révélé par le trigger collapsible.
        </Collapsible.Content>
      </Collapsible.Root>
    </section>

    <!-- ── Tabs ──────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Tabs</h2>
      <p :style="sectionDescStyle">Navigation par onglets WAI-ARIA. Keyboard ArrowLeft/Right.</p>
      <div style="width:100%;max-width:400px">
        <Tabs.Root default-value="react">
          <Tabs.List data-testid="tabs-list" style="display:flex;border-bottom:2px solid #e2e8f0;gap:0.25rem">
            <Tabs.Trigger value="react" data-testid="tabs-trigger-react" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">React</Tabs.Trigger>
            <Tabs.Trigger value="vue" data-testid="tabs-trigger-vue" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">Vue</Tabs.Trigger>
            <Tabs.Trigger value="nuxt" data-testid="tabs-trigger-nuxt" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">Nuxt</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="react" data-testid="tabs-panel-react" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            React — bibliothèque UI pour créer des interfaces composant.
          </Tabs.Panel>
          <Tabs.Panel value="vue" data-testid="tabs-panel-vue" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            Vue — framework progressif pour les interfaces utilisateur.
          </Tabs.Panel>
          <Tabs.Panel value="nuxt" data-testid="tabs-panel-nuxt" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            Nuxt — framework full-stack basé sur Vue.
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </section>

    <!-- ── Progress ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Progress</h2>
      <p :style="sectionDescStyle">Barre de progression — déterminée ou indéterminée.</p>
      <div style="display:flex;flex-direction:column;gap:1rem;width:100%;max-width:400px">
        <Progress.Root :value="progressValue" :max="100" aria-label="Chargement" style="display:flex;flex-direction:column;gap:0.5rem">
          <div style="display:flex;justify-content:space-between">
            <Progress.Label style="font-size:0.875rem;font-weight:500">Chargement</Progress.Label>
            <Progress.ValueText data-testid="progress-value" style="font-size:0.875rem;color:#64748b" />
          </div>
          <Progress.Track data-testid="progress-track" style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden">
            <Progress.Fill data-testid="progress-fill" style="height:100%;background:#1e293b;transition:width 0.3s;border-radius:999px" />
          </Progress.Track>
        </Progress.Root>
        <div style="display:flex;gap:0.5rem">
          <button :style="btnStyle" @click="progressValue = Math.max(0, progressValue - 10)">−10</button>
          <button :style="btnStyle" @click="progressValue = Math.min(100, progressValue + 10)">+10</button>
        </div>
        <Progress.Root data-testid="progress-indeterminate" aria-label="Indéterminé" style="display:flex;flex-direction:column;gap:0.5rem">
          <Progress.Label style="font-size:0.875rem;font-weight:500">Indéterminé</Progress.Label>
          <Progress.Track style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden">
            <Progress.Fill style="height:100%;background:#6366f1;border-radius:999px" />
          </Progress.Track>
        </Progress.Root>
      </div>
    </section>

    <!-- ── RadioGroup ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">RadioGroup</h2>
      <p :style="sectionDescStyle">Sélection exclusive. Arrow keys pour naviguer.</p>
      <RadioGroup.Root
        :value="radioGroupValue"
        :on-value-change="(v) => radioGroupValue = v"
        name="framework"
        style="display:flex;flex-direction:column;gap:0.75rem"
      >
        <RadioGroup.Item
          v-for="opt in [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }]"
          :key="opt.value"
          :value="opt.value"
          :data-testid="`radio-item-${opt.value}`"
        >
          <div style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
            <RadioGroup.Radio />
            <RadioGroup.Label style="font-size:0.875rem;color:#1e293b;cursor:pointer">
              {{ opt.label }}
            </RadioGroup.Label>
          </div>
          <RadioGroup.HiddenInput />
        </RadioGroup.Item>
      </RadioGroup.Root>
    </section>

    <!-- ── Slider ─────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Slider</h2>
      <p :style="sectionDescStyle">Curseur draggable. Arrow keys pour incrémenter/décrémenter.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;max-width:320px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.875rem;font-weight:500">Volume</span>
          <code data-testid="slider-value" style="font-size:0.875rem;color:#64748b">{{ sliderValue }}</code>
        </div>
        <Slider.Root
          :value="sliderValue"
          :on-value-change="(v) => sliderValue = v[0] ?? 0"
          :min="0"
          :max="100"
          :step="1"
          style="position:relative;height:20px;display:flex;align-items:center"
        >
          <Slider.Track data-testid="slider-track" style="position:relative;height:4px;background:#e2e8f0;border-radius:2px;flex-grow:1">
            <Slider.Range style="position:absolute;height:100%;background:#1e293b;border-radius:2px" />
          </Slider.Track>
          <Slider.Thumb aria-label="Valeur" data-testid="slider-thumb" style="display:block;width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid #1e293b;box-shadow:0 1px 4px rgb(0 0 0 / 0.15);cursor:grab" />
        </Slider.Root>
      </div>
    </section>

    <!-- ── NumberInput ───────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">NumberInput</h2>
      <p :style="sectionDescStyle">Saisie numérique. WAI-ARIA §3.21 spinbutton — ArrowUp/Down, PageUp/Down, Home/End.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <NumberInput.Root
            :default-value="50"
            :min="0"
            :max="100"
            :step="1"
            :on-value-change="(v) => numberInputValue = v"
          >
            <NumberInput.Label :style="labelStyle">Quantité</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement" :style="btnGhostStyle">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input"
                aria-label="Quantité"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment" :style="btnGhostStyle">+</NumberInput.IncrementTrigger>
            </div>
            <code data-testid="number-input-value" style="font-size:0.8rem;color:#64748b;display:block;margin-top:0.35rem">
              valeur: {{ numberInputValue ?? 'vide' }}
            </code>
            <NumberInput.HiddenInput name="quantity" />
          </NumberInput.Root>
        </div>

        <div>
          <NumberInput.Root :default-value="25" :min="0" :max="100" :disabled="true">
            <NumberInput.Label :style="{ ...labelStyle, opacity: 0.5 }">Désactivé</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem;opacity:0.5">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement-disabled" :style="btnGhostStyle">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input-disabled"
                aria-label="Quantité désactivée"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment-disabled" :style="btnGhostStyle">+</NumberInput.IncrementTrigger>
            </div>
          </NumberInput.Root>
        </div>
      </div>
    </section>

    <!-- ── DateField ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">DateField</h2>
      <p :style="sectionDescStyle">Saisie de date en segments indépendants (MM/JJ/AAAA). WAI-ARIA spinbutton par segment.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <DateField.Root
          data-testid="date-field-root"
          :locale="locale"
          :on-value-change="onDateFieldChange"
        >
          <DateField.Group
            data-testid="date-field-group"
            :style="{
              display: 'inline-flex', alignItems: 'center', gap: '2px',
              padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px',
              fontSize: '0.875rem', background: '#fff', fontVariantNumeric: 'tabular-nums',
              cursor: 'text',
            }"
          >
            <DateField.MonthSegment
              data-testid="date-field-month"
              :style="{ minWidth: '3ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
            <DateField.Separator :style="{ color: '#94a3b8', userSelect: 'none' }" />
            <DateField.DaySegment
              data-testid="date-field-day"
              :style="{ minWidth: '2ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
            <DateField.Separator :style="{ color: '#94a3b8', userSelect: 'none' }" />
            <DateField.YearSegment
              data-testid="date-field-year"
              :style="{ minWidth: '4ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
          </DateField.Group>
          <DateField.HiddenInput name="date" />
        </DateField.Root>
        <p v-if="dateFieldValue" data-testid="date-field-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Date : {{ dateFieldValue.year }}-{{ String(dateFieldValue.month).padStart(2, '0') }}-{{ String(dateFieldValue.day).padStart(2, '0') }}
        </p>
      </div>
    </section>

    <!-- ── TimePicker ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">TimePicker</h2>
      <p :style="sectionDescStyle">Saisie d'heure en segments (HH:MM:SS AM/PM). WAI-ARIA spinbutton par segment.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <TimePicker.Root
          data-testid="time-picker-root"
          :locale="locale"
          :on-value-change="onTimePickerChange"
        >
          <TimePicker.Group
            data-testid="time-picker-group"
            :style="{
              display: 'inline-flex', alignItems: 'center', gap: '2px',
              padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px',
              fontSize: '0.875rem', background: '#fff', fontVariantNumeric: 'tabular-nums',
              cursor: 'text',
            }"
          >
            <TimePicker.HoursSegment
              data-testid="time-picker-hours"
              :style="{ minWidth: '2ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
            <TimePicker.Separator :style="{ color: '#94a3b8', userSelect: 'none' }" />
            <TimePicker.MinutesSegment
              data-testid="time-picker-minutes"
              :style="{ minWidth: '2ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
            <TimePicker.Separator :style="{ color: '#94a3b8', userSelect: 'none' }" />
            <TimePicker.SecondsSegment
              data-testid="time-picker-seconds"
              :style="{ minWidth: '2ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
            <span style="margin-left:4px" />
            <TimePicker.PeriodSegment
              data-testid="time-picker-period"
              :style="{ minWidth: '2ch', outline: 'none', padding: '1px 2px', borderRadius: '3px', cursor: 'default' }"
            />
          </TimePicker.Group>
          <TimePicker.HiddenInput name="time" />
        </TimePicker.Root>
        <p v-if="timePickerValue" data-testid="time-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Heure : {{ String(timePickerValue.hours).padStart(2, '0') }}:{{ String(timePickerValue.minutes).padStart(2, '0') }}:{{ String(timePickerValue.seconds).padStart(2, '0') }}
        </p>
      </div>
    </section>

    <!-- ── DatePicker ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">DatePicker</h2>
      <p :style="sectionDescStyle">Calendrier popup pour sélectionner une date. Vues jour/mois/année.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div style="position:relative;display:inline-block">
          <DatePicker.Root
            data-testid="date-picker-root"
            :locale="locale"
            :first-day-of-week="1"
            :on-value-change="onDatePickerChange"
          >
            <DatePicker.Trigger data-testid="date-picker-trigger" :style="btnStyle">
              {{ datePickerSelected ?? 'Choisir une date' }}
            </DatePicker.Trigger>
            <DatePicker.Content
              data-testid="date-picker-content"
              :style="{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '1rem', boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)', zIndex: 50, minWidth: '280px',
              }"
            >
              <DatePickerCalendarContent />
            </DatePicker.Content>
            <DatePicker.HiddenInput name="date" />
          </DatePicker.Root>
        </div>
        <p v-if="datePickerSelected" data-testid="date-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Sélectionné : {{ datePickerSelected }}
        </p>
      </div>
    </section>

    <!-- ── DateRangePicker ────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">DateRangePicker</h2>
      <p :style="sectionDescStyle">Sélection d'une plage de dates (début → fin). Double calendrier, presets.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <div style="position:relative;display:inline-block">
          <DateRangePicker.Root
            data-testid="date-range-picker-root"
            :locale="locale"
            :first-day-of-week="1"
            :number-of-months="1"
            :on-value-change="onDateRangePickerChange"
          >
            <DateRangePicker.Trigger data-testid="date-range-picker-trigger" :style="btnStyle">
              {{ dateRangePickerRange ?? 'Choisir une plage' }}
            </DateRangePicker.Trigger>
            <DateRangePicker.Content
              data-testid="date-range-picker-content"
              :style="{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
                padding: '1rem', boxShadow: '0 8px 30px rgb(0 0 0 / 0.12)', zIndex: 50, minWidth: '300px',
              }"
            >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
              <DateRangePicker.PrevMonthButton data-testid="date-range-picker-prev" :style="{ ...btnGhostStyle, padding: '0.25rem 0.6rem' }">←</DateRangePicker.PrevMonthButton>
              <DateRangePicker.CalendarHeader data-testid="date-range-picker-header" :style="{ fontWeight: 600, fontSize: '0.875rem' }" />
              <DateRangePicker.NextMonthButton data-testid="date-range-picker-next" :style="{ ...btnGhostStyle, padding: '0.25rem 0.6rem' }">→</DateRangePicker.NextMonthButton>
            </div>
            <DateRangePickerCalendarGrid />
            <DateRangePicker.ClearButton data-testid="date-range-picker-clear" :style="{ ...btnGhostStyle, marginTop: '0.75rem', width: '100%' }">
              Effacer
            </DateRangePicker.ClearButton>
            </DateRangePicker.Content>
            <DateRangePicker.HiddenInputs start-name="start" end-name="end" />
          </DateRangePicker.Root>
        </div>
        <p v-if="dateRangePickerRange" data-testid="date-range-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Plage : {{ dateRangePickerRange }}
        </p>
      </div>
    </section>

    <!-- ── Toggle ────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Toggle</h2>
      <p :style="sectionDescStyle">Bouton bascule — role=button + aria-pressed. WAI-ARIA Button Pattern §3.5.</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <Toggle.Root
          data-testid="toggle-bold"
          :pressed="toggleBold"
          @update:pressed="(p: boolean) => toggleBold = p"
          aria-label="Gras"
          :style="{
            padding: '0.5rem 1rem', border: `1px solid ${toggleBold ? '#1e293b' : '#cbd5e1'}`,
            borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
            background: toggleBold ? '#1e293b' : 'transparent',
            color: toggleBold ? '#fff' : 'inherit',
            transition: 'background 120ms, border-color 120ms, color 120ms',
          }"
        >
          <VisuallyHidden.Root>Activer le gras</VisuallyHidden.Root>B
        </Toggle.Root>
        <Toggle.Root
          data-testid="toggle-italic"
          :pressed="toggleItalic"
          @update:pressed="(p: boolean) => toggleItalic = p"
          aria-label="Italique"
          :style="{
            padding: '0.5rem 1rem', border: `1px solid ${toggleItalic ? '#1e293b' : '#cbd5e1'}`,
            borderRadius: '6px', cursor: 'pointer', fontStyle: 'italic',
            background: toggleItalic ? '#1e293b' : 'transparent',
            color: toggleItalic ? '#fff' : 'inherit',
            transition: 'background 120ms, border-color 120ms, color 120ms',
          }"
        >I</Toggle.Root>
        <Toggle.Root
          data-testid="toggle-disabled"
          disabled
          aria-label="Souligné (désactivé)"
          :style="{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'not-allowed', background: 'transparent', opacity: 0.4, textDecoration: 'underline' }"
        >U</Toggle.Root>
      </div>
    </section>

    <!-- ── ToggleGroup ────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">ToggleGroup</h2>
      <p :style="sectionDescStyle">Barre d'outils de toggles — role=toolbar + roving tabindex. WAI-ARIA APG Toolbar Pattern.</p>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <ToggleGroup.Root
          data-testid="toggle-group-text-align"
          type="single"
          :value="toggleGroupAlign"
          @update:value="(v: string[]) => toggleGroupAlign = v"
          aria-label="Alignement du texte"
          :style="{ display: 'inline-flex', gap: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.25rem' }"
        >
          <ToggleGroup.Item value="left" aria-label="Aligner à gauche" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: toggleGroupAlign.includes('left') ? '#1e293b' : 'transparent', color: toggleGroupAlign.includes('left') ? '#fff' : 'inherit', transition: 'background 120ms' }">←</ToggleGroup.Item>
          <ToggleGroup.Item value="center" aria-label="Centrer" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: toggleGroupAlign.includes('center') ? '#1e293b' : 'transparent', color: toggleGroupAlign.includes('center') ? '#fff' : 'inherit', transition: 'background 120ms' }">↔</ToggleGroup.Item>
          <ToggleGroup.Item value="right" aria-label="Aligner à droite" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: toggleGroupAlign.includes('right') ? '#1e293b' : 'transparent', color: toggleGroupAlign.includes('right') ? '#fff' : 'inherit', transition: 'background 120ms' }">→</ToggleGroup.Item>
        </ToggleGroup.Root>
        <ToggleGroup.Root
          data-testid="toggle-group-formatting"
          type="multiple"
          :value="toggleGroupFormats"
          @update:value="(v: string[]) => toggleGroupFormats = v"
          aria-label="Formatage du texte"
          :style="{ display: 'inline-flex', gap: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.25rem' }"
        >
          <ToggleGroup.Item value="bold" aria-label="Gras" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', background: toggleGroupFormats.includes('bold') ? '#1e293b' : 'transparent', color: toggleGroupFormats.includes('bold') ? '#fff' : 'inherit', transition: 'background 120ms' }">B</ToggleGroup.Item>
          <ToggleGroup.Item value="italic" aria-label="Italique" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontStyle: 'italic', background: toggleGroupFormats.includes('italic') ? '#1e293b' : 'transparent', color: toggleGroupFormats.includes('italic') ? '#fff' : 'inherit', transition: 'background 120ms' }">I</ToggleGroup.Item>
          <ToggleGroup.Item value="underline" aria-label="Souligné" :style="{ padding: '0.5rem 0.75rem', border: 'none', borderRadius: '6px', cursor: 'pointer', textDecoration: 'underline', background: toggleGroupFormats.includes('underline') ? '#1e293b' : 'transparent', color: toggleGroupFormats.includes('underline') ? '#fff' : 'inherit', transition: 'background 120ms' }">U</ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>
    </section>

    <!-- ── Separator ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Separator</h2>
      <p :style="sectionDescStyle">Séparateur sémantique (role=separator) ou décoratif (role=none + aria-hidden).</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <span style="font-size:0.85rem">Contenu au-dessus</span>
        <Separator.Root :style="{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }" />
        <span style="font-size:0.85rem">Séparateur sémantique (role=separator)</span>
        <Separator.Root :decorative="true" :style="{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '0' }" />
        <span style="font-size:0.85rem">Séparateur décoratif (role=none, aria-hidden)</span>
      </div>
    </section>

    <!-- ── VisuallyHidden ─────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">VisuallyHidden</h2>
      <p :style="sectionDescStyle">Contenu visible pour les lecteurs d'écran, invisible visuellement. Utile pour les labels SR.</p>
      <div style="display:flex;align-items:center;gap:1rem">
        <button
          type="button"
          aria-label="Fermer la fenêtre"
          :style="{ ...btnStyle, width: '2.5rem', height: '2.5rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }"
        >
          <VisuallyHidden.Root>Fermer la fenêtre</VisuallyHidden.Root>
          ✕
        </button>
        <p style="margin:0;font-size:0.8rem;color:#64748b">Le bouton ci-dessus a un label SR "Fermer la fenêtre" invisible visuellement.</p>
      </div>
    </section>

    <!-- ── asChild ────────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitleStyle">asChild</h2>
      <p :style="sectionDescStyle">Forge merge les props sur votre élément, sans wrapper.</p>
      <Dialog.Root>
        <Dialog.Trigger :asChild="true">
          <a href="#" :style="{ ...btnStyle, display: 'inline-block', textDecoration: 'none' }">
            Ouvrir via &lt;a&gt; (asChild)
          </a>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">asChild demo</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Le trigger est un <code>&lt;a&gt;</code> — forge a mergé ses props sans wrapper button.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    <!-- ── Menu (DropdownMenu) ───────────────────────────────────────────────── -->
    </section>
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Menu (DropdownMenu)</h2>
      <p :style="sectionDescStyle">WAI-ARIA Menu Button. Sous-menus N niveaux, radio, checkbox, typeahead, navigate prop.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <Menu.Root :on-select="(v: string) => { menuLastSelect = v }">
          <Menu.Trigger :style="btnStyle">Actions ▾</Menu.Trigger>
          <Menu.Portal>
            <Menu.Content :style="menuContentStyle">
              <Menu.Label :style="menuGroupLabelStyle">Fichier</Menu.Label>
              <Menu.Item value="new" label="Nouveau" :style="menuItemStyle" :navigate="() => console.log('[navigate] /new')">Nouveau fichier</Menu.Item>
              <Menu.Item value="open" label="Ouvrir" :style="menuItemStyle">Ouvrir…</Menu.Item>
              <Menu.Separator :style="menuSepStyle" />
              <Menu.Group id="edit-group">
                <Menu.GroupLabel group-id="edit-group" :style="menuGroupLabelStyle">Edition</Menu.GroupLabel>
                <Menu.Item value="cut" :style="menuItemStyle">Couper</Menu.Item>
                <Menu.Item value="copy" :style="menuItemStyle">Copier</Menu.Item>
                <Menu.Item value="paste" :disabled="true" :style="{ ...menuItemStyle, opacity: 0.45 }">Coller</Menu.Item>
              </Menu.Group>
              <Menu.Separator :style="menuSepStyle" />
              <Menu.Label :style="menuGroupLabelStyle">Theme</Menu.Label>
              <Menu.RadioGroup group-id="theme" :value="menuTheme" :on-value-change="(v: string) => { menuTheme = v }">
                <Menu.RadioItem v-for="t in ['light', 'dark', 'system']" :key="t" :value="t" :style="menuItemStyle" :close-on-select="false">
                  <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                  {{ t.charAt(0).toUpperCase() + t.slice(1) }}
                </Menu.RadioItem>
              </Menu.RadioGroup>
              <Menu.Separator :style="menuSepStyle" />
              <Menu.Label :style="menuGroupLabelStyle">Vue</Menu.Label>
              <Menu.CheckboxItem value="grid" :checked="menuShowGrid" :on-checked-change="(v: boolean) => { menuShowGrid = v }" :style="menuItemStyle">
                <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                Grille
              </Menu.CheckboxItem>
              <Menu.CheckboxItem value="ruler" :checked="menuShowRuler" :on-checked-change="(v: boolean) => { menuShowRuler = v }" :style="menuItemStyle">
                <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                Regle
              </Menu.CheckboxItem>
              <Menu.Separator :style="menuSepStyle" />
              <!-- Sub 2 niveaux -->
              <Menu.Sub>
                <Menu.SubTrigger value="share" label="Partager" :style="menuItemStyle">Partager ▶</Menu.SubTrigger>
                <Menu.SubContent :style="menuContentStyle">
                  <Menu.Item value="share-link" :style="menuItemStyle">Lien</Menu.Item>
                  <Menu.Item value="share-email" :style="menuItemStyle">Email</Menu.Item>
                  <Menu.Separator :style="menuSepStyle" />
                  <Menu.Sub>
                    <Menu.SubTrigger value="social" label="Social" :style="menuItemStyle">Reseaux ▶</Menu.SubTrigger>
                    <Menu.SubContent :style="menuContentStyle">
                      <Menu.Item value="twitter" :style="menuItemStyle">Twitter</Menu.Item>
                      <Menu.Item value="linkedin" :style="menuItemStyle">LinkedIn</Menu.Item>
                    </Menu.SubContent>
                  </Menu.Sub>
                </Menu.SubContent>
              </Menu.Sub>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="menuLastSelect">Selection : {{ menuLastSelect }}</div>
          <div>Theme : {{ menuTheme }}</div>
          <div>Grille : {{ menuShowGrid ? 'oui' : 'non' }} | Regle : {{ menuShowRuler ? 'oui' : 'non' }}</div>
        </div>
      </div>
    </section>

    <!-- ── Menu — Sub click-only ─────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Menu — Sub click-only (open-on-hover=false)</h2>
      <p :style="sectionDescStyle">SubTrigger avec open-on-hover=false — seul le clic ouvre le sous-menu.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <Menu.Root :on-select="(v: string) => { menuClickOnlySelect = v }">
          <Menu.Trigger :style="btnStyle">Options ▾</Menu.Trigger>
          <Menu.Portal>
            <Menu.Content :style="menuContentStyle">
              <Menu.Item value="action-a" :style="menuItemStyle">Action A</Menu.Item>
              <Menu.Item value="action-b" :style="menuItemStyle">Action B</Menu.Item>
              <Menu.Separator :style="menuSepStyle" />
              <Menu.Sub>
                <Menu.SubTrigger value="more" label="Plus" :style="menuItemStyle" :open-on-hover="false">Plus (clic) ▶</Menu.SubTrigger>
                <Menu.SubContent :style="menuContentStyle">
                  <Menu.Item value="advanced-a" :style="menuItemStyle">Avance A</Menu.Item>
                  <Menu.Item value="advanced-b" :style="menuItemStyle">Avance B</Menu.Item>
                </Menu.SubContent>
              </Menu.Sub>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="menuClickOnlySelect">Selection : {{ menuClickOnlySelect }}</div>
          <div style="color:#94a3b8">Hover ne suffit pas — clic requis</div>
        </div>
      </div>
    </section>

    <!-- ── Menu — Anchor ─────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Menu — Anchor</h2>
      <p :style="sectionDescStyle">Menu.Anchor positionne le floating par rapport a un element arbitraire, pas le trigger.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <div>
          <Menu.Root :open="menuAnchorOpen" :on-open-change="(v: boolean) => { menuAnchorOpen = v }" :on-select="(v: string) => { menuAnchorSelect = v }">
            <Menu.Anchor>
              <div style="width:200px;padding:0.5rem;background:#f1f5f9;border:2px dashed #94a3b8;border-radius:8px;text-align:center;font-size:0.8rem;color:#64748b">
                Ancre (reference)
              </div>
            </Menu.Anchor>
            <Menu.Trigger :style="{ ...btnStyle, marginTop: '0.5rem' }">
              {{ menuAnchorOpen ? 'Fermer' : 'Ouvrir (ancre)' }}
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content :style="menuContentStyle">
                <Menu.Item value="profile" :style="menuItemStyle">Profil</Menu.Item>
                <Menu.Item value="settings" :style="menuItemStyle">Parametres</Menu.Item>
                <Menu.Separator :style="menuSepStyle" />
                <Menu.Item value="logout" :style="menuItemStyle">Deconnexion</Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        </div>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="menuAnchorSelect">Selection : {{ menuAnchorSelect }}</div>
          <div style="color:#94a3b8">Le menu se positionne par rapport a l'ancre</div>
        </div>
      </div>
    </section>

    <!-- ── ContextMenu ───────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">ContextMenu (avec Sub)</h2>
      <p :style="sectionDescStyle">Clic-droit + sous-menus imbriques — auto-portal vers document.body.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <ContextMenu.Root :on-select="(v: string) => { ctxMenuSelect = v }">
          <ContextMenu.Trigger>
            <div style="width:200px;height:80px;background:#1e40af;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.8rem;user-select:none">
              Clic-droit ici
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content :style="menuContentStyle">
              <ContextMenu.Item value="inspect" :style="menuItemStyle">Inspecter</ContextMenu.Item>
              <ContextMenu.Item value="reload" :style="menuItemStyle">Recharger</ContextMenu.Item>
              <ContextMenu.Separator :style="menuSepStyle" />
              <ContextMenu.CheckboxItem value="bookmark" :checked="ctxMenuBookmarked" :on-checked-change="(v: boolean) => { ctxMenuBookmarked = v }" :style="menuItemStyle">
                <ContextMenu.ItemIndicator><span style="margin-right:6px">★</span></ContextMenu.ItemIndicator>
                Marquer comme favori
              </ContextMenu.CheckboxItem>
              <ContextMenu.Separator :style="menuSepStyle" />
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger value="share" label="Partager" :style="menuItemStyle">Partager ▶</ContextMenu.SubTrigger>
                <ContextMenu.SubContent :style="menuContentStyle">
                  <ContextMenu.Item value="share-link" :style="menuItemStyle">Lien</ContextMenu.Item>
                  <ContextMenu.Item value="share-email" :style="menuItemStyle">Email</ContextMenu.Item>
                  <ContextMenu.Separator :style="menuSepStyle" />
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger value="social" label="Social" :style="menuItemStyle">Reseaux ▶</ContextMenu.SubTrigger>
                    <ContextMenu.SubContent :style="menuContentStyle">
                      <ContextMenu.Item value="twitter" :style="menuItemStyle">Twitter</ContextMenu.Item>
                      <ContextMenu.Item value="linkedin" :style="menuItemStyle">LinkedIn</ContextMenu.Item>
                    </ContextMenu.SubContent>
                  </ContextMenu.Sub>
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
              <ContextMenu.Separator :style="menuSepStyle" />
              <ContextMenu.Item value="copy-link" :style="menuItemStyle">Copier le lien</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="ctxMenuSelect">Selection : {{ ctxMenuSelect }}</div>
          <div>Favori : {{ ctxMenuBookmarked ? '★' : '☆' }}</div>
        </div>
      </div>
    </section>

    <!-- ── Avatar ───────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Avatar</h2>
      <p :style="sectionDescStyle">Image avec fallback accessible. delayMs sur Fallback évite le flash du fallback sur les connexions rapides.</p>
      <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap">

        <!-- Image cassée → fallback immédiat -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root :style="avatarRootStyle">
            <Avatar.Image src="https://invalid.domain/broken.jpg" alt="Bob" :style="avatarImgStyle" />
            <Avatar.Fallback :style="avatarFallbackStyle">BO</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">Image cassée</span>
        </div>

        <!-- Sans image -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root :style="avatarRootStyle">
            <Avatar.Image alt="Carol" :style="avatarImgStyle" />
            <Avatar.Fallback :style="avatarFallbackStyle">CA</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">Sans image</span>
        </div>

        <!-- delayMs=600 sur Fallback (pas Root) -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root :style="avatarRootStyle">
            <Avatar.Image src="https://invalid.domain/slow.jpg" alt="Dave" :style="avatarImgStyle" />
            <Avatar.Fallback :delay-ms="600" :style="avatarFallbackStyle">DA</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">delayMs=600 (Fallback)</span>
        </div>

        <!-- Auto-initiales via compound component + injectAvatarContext -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root name="John Doe" :style="avatarRootStyle">
            <Avatar.Image alt="John Doe" :style="avatarImgStyle" />
            <AvatarInitialsFallback :style="avatarFallbackStyle" />
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">initials (context)</span>
        </div>

        <!-- asChild: Fallback rendu comme un div -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root :style="avatarRootStyle">
            <Avatar.Image alt="Eve" :style="avatarImgStyle" />
            <Avatar.Fallback as-child :style="avatarFallbackStyle">
              <div>EV</div>
            </Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">asChild (div)</span>
        </div>

      </div>
    </section>
  </main>
</template>

<style>
/* forge-ui — CSS data-state animations
 * watchPresence maintient le composant monté jusqu'à la fin de l'animation.
 */

@keyframes forge-fade-scale-in {
  from { opacity: 0; scale: 0.97; translate: 0 -6px; }
  to   { opacity: 1; scale: 1;    translate: none; }
}

@keyframes forge-fade-scale-out {
  from { opacity: 1; scale: 1;    translate: none; }
  to   { opacity: 0; scale: 0.97; translate: 0 6px; }
}

@keyframes forge-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes forge-overlay-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* DateField / TimePicker — group focus-within border + segment states */
[data-forge-scope="date-field"][data-forge-part="group"]:focus-within,
[data-forge-scope="time-picker"][data-forge-part="group"]:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 0;
  border-color: #3b82f6;
  border-radius: 6px;
}
[data-forge-part^="segment-"][data-placeholder] {
  color: #94a3b8;
}
[data-forge-part^="segment-"][data-focused] {
  background: #dbeafe;
  border-radius: 3px;
  color: #1e40af;
}

/* DatePicker hover */
[data-forge-scope="date-picker"][data-forge-part="cell"]:hover,
[data-forge-scope="date-range-picker"][data-forge-part="cell"]:not([data-in-range]):not([data-range-start]):not([data-range-end]):hover {
  background: #f1f5f9;
  border-radius: 6px;
}

/* DatePicker / DateRangePicker — selected cell, today, focused cell */
[data-forge-scope="date-picker"][data-forge-part="cell"][aria-selected="true"],
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-state="selected"] {
  background: #1e293b;
  color: #fff;
  border-radius: 6px;
}
[data-forge-scope="date-picker"][data-forge-part="cell"][data-today],
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-today]:not([data-range-start]):not([data-range-end]) {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}
[data-forge-scope="date-picker"][data-forge-part="cell"][data-focused],
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-focused] {
  outline: 2px solid #94a3b8;
  outline-offset: -1px;
  border-radius: 6px;
}

/* DateRangePicker — range visualization */
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-range-start] {
  background: #1e293b;
  color: #fff;
  border-radius: 6px 0 0 6px;
}
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-range-end] {
  background: #1e293b;
  color: #fff;
  border-radius: 0 6px 6px 0;
}
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-in-range] {
  background: #e2e8f0;
  border-radius: 0;
}
[data-forge-scope="date-range-picker"][data-forge-part="cell"][data-range-start][data-range-end] {
  border-radius: 6px;
}

/* Month/Year cells — hover, selected, focused */
[data-forge-scope="date-picker"][data-forge-part="month-cell"]:hover,
[data-forge-scope="date-picker"][data-forge-part="year-cell"]:hover {
  background: #f1f5f9;
  border-radius: 6px;
}
[data-forge-scope="date-picker"][data-forge-part="month-cell"][aria-selected="true"],
[data-forge-scope="date-picker"][data-forge-part="year-cell"][aria-selected="true"] {
  background: #1e293b;
  color: #fff;
  border-radius: 6px;
}
[data-forge-scope="date-picker"][data-forge-part="month-cell"][data-focused],
[data-forge-scope="date-picker"][data-forge-part="year-cell"][data-focused] {
  outline: 2px solid #94a3b8;
  outline-offset: -1px;
  border-radius: 6px;
}

/* Dialog */
[data-forge-scope="dialog"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 150ms ease forwards;
}
[data-forge-scope="dialog"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 120ms ease forwards;
}

[data-forge-scope="dialog"][data-forge-part="overlay"][data-state="open"] {
  animation: forge-overlay-in 150ms ease forwards;
}
[data-forge-scope="dialog"][data-forge-part="overlay"][data-state="closed"] {
  animation: forge-overlay-out 120ms ease forwards;
}

/* Select dropdown */
[data-forge-scope="select"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="select"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Combobox dropdown */
[data-forge-scope="combobox"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="combobox"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Popover */
[data-forge-scope="popover"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="popover"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Tooltip */
[data-forge-scope="tooltip"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 100ms ease forwards;
}
[data-forge-scope="tooltip"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 80ms ease forwards;
}

/* RadioGroup */
[data-forge-part="radio"] {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #cbd5e1; background: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s;
}
[data-forge-part="radio"][data-state="checked"] {
  border-color: #1e293b;
  box-shadow: inset 0 0 0 4px #fff, inset 0 0 0 9px #1e293b;
}
</style>
