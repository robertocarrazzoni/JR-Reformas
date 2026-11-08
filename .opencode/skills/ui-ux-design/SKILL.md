---
name: ui-ux-design
description: Expert guide and rules for designing and implementing modern, accessible, and high-conversion UI/UX interfaces using Tailwind CSS and React/Next.js. Use whenever building, styling, or refactoring user interfaces, components, forms, layouts, or dashboards.
compatibility: opencode
---

# UI/UX Design & Frontend Craftsman Skill

This skill guides the AI to design and build world-class user interfaces that are not only visually stunning but also intuitive, accessible (WCAG compliant), responsive, and optimized for real users.

---

## 1. Core UI/UX Philosophy

When building or refining any interface:

1. **Human-First Simplicity**: Don't make the user think. Minimize cognitive load with obvious actions, clear labels, and predictable patterns.
2. **Visual Hierarchy**: Every screen must have a clear focal point. The user's eye should naturally flow: **Primary Action (Call to Action) -> Secondary Information -> Tertiary/Contextual Details**.
3. **Intentional Whitespace**: Spacing is not empty space; it groups related elements and lets the design breathe. Follow an 8pt/4pt grid system (`gap-2`, `gap-4`, `gap-6`, `p-6`, `p-8`).
4. **Feedback for Every Action**: Every click, submit, hover, and state change must give instant visual feedback (spinners, disabled state, toasts, error messages).

---

## 2. Design Tokens & Styling (Tailwind CSS Guidelines)

### A. Color Palette & Semantics
- **Backgrounds**: Never use pure harsh black `#000` or sterile white `#fff` everywhere. Use layered slate/zinc tones:
  - Surface 0 (Page background): `bg-neutral-50 dark:bg-neutral-950`
  - Surface 1 (Cards, dialogs): `bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800`
  - Surface 2 (Hover/Active nested areas): `bg-neutral-100 dark:bg-neutral-800/60`
- **Primary Brand Color**: Choose one solid primary color (e.g., Indigo, Blue, Emerald, or Amber depending on project theme) for primary CTAs.
- **Status Colors**:
  - Success: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - Warning: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
  - Destructive/Error: Rose/Red (`bg-rose-50 text-rose-700 border-rose-200`)
  - Info: Sky/Blue (`bg-sky-50 text-sky-700 border-sky-200`)

### B. Typography & Text Hierarchy
- **Page Titles**: `text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white`
- **Section Headings**: `text-lg md:text-xl font-semibold text-neutral-800 dark:text-neutral-100`
- **Body Text**: `text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed`
- **Captions & Metadata**: `text-xs font-medium text-neutral-400 dark:text-neutral-500`

### C. Depth, Borders, and Radii
- **Subtle Borders over Loud Shadows**: Modern UI favors clean 1px borders with delicate shadows:
  `border border-neutral-200/80 dark:border-neutral-800 shadow-sm rounded-xl`
- **Border Radii**: Keep consistent curves:
  - Buttons / Inputs: `rounded-lg` or `rounded-xl`
  - Cards / Containers: `rounded-xl` or `rounded-2xl`
  - Badges / Pills: `rounded-full`

---

## 3. Essential UI Component Patterns

### A. Buttons & CTAs
Every button must have:
- Hover state: `hover:bg-primary-600`
- Active/press state: `active:scale-[0.98]`
- Focus ring for keyboard accessibility: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`
- Loading state: Display a spinner and `disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none`
- Minimum touch target: at least `h-10` or `h-11` (`min-h-[44px]` on mobile)

```tsx
<button
  type="submit"
  disabled={isLoading}
  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-blue-500/20 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isLoading ? <Spinner className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
</button>
```

### B. Form Inputs & Validation
- Always provide an explicit `<label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">`.
- Placeholder text must be descriptive examples, not the label itself.
- Visual state for errors: red border + clear error text below the input.
- Input focus ring: `focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none`.

### C. Cards & Content Containers
```tsx
<div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
    <h3 className="font-semibold text-neutral-900 dark:text-white">Título do Bloco</h3>
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Ativo</span>
  </div>
  <p className="text-sm text-neutral-600 dark:text-neutral-400">Conteúdo do card...</p>
</div>
```

---

## 4. The 5 States of UI (Always Design for All 5)

Whenever creating a feature or view, always implement:
1. **Ideal State**: The happy path with realistic sample data.
2. **Empty State**: When no data exists yet (friendly illustration/icon + clear call to action to create the first item).
3. **Loading State**: Skeletons (`animate-pulse bg-neutral-200/70 rounded-md`) rather than abrupt blank screens.
4. **Error State**: Graceful failure message with a "Tentar novamente" (Retry) button.
5. **Partial / Edge States**: Very long text (truncate with tooltip), zero items, 1 item vs 1,000 items (pagination/scroll).

---

## 5. Mobile & Responsive Checklist

- [ ] Mobile-First: Start with `w-full`, then scale up with `sm:`, `md:`, `lg:`.
- [ ] No Horizontal Scroll: Never set rigid fixed pixel widths (avoid `w-[800px]`, use `max-w-3xl w-full`).
- [ ] Form Inputs on Mobile: Keep text inputs at least `text-base` on iOS/mobile to avoid unwanted automatic zoom (`text-base md:text-sm`).
- [ ] Tap Targets: Buttons, links, and switches must be at least 44x44px.

---

## 6. How OpenCode Should Apply This Skill

When the user asks you to:
1. **"Criar uma tela/componente"**:
   - Write clean, semantic JSX/TSX.
   - Use Lucide icons (or SVG icons) where appropriate to increase scannability.
   - Include loading and disabled states in forms.
   - Use modern Tailwind utility classes.
2. **"Melhorar o visual / Redesenhar"**:
   - Clean up cluttered layouts by adding whitespace and consistent padding.
   - Modernize old Bootstrap/raw HTML looks into sleek, modern SaaS card layouts.
   - Fix contrast and font sizes for readability.
