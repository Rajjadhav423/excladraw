@AGENTS.md

# BoardFlow — Design System Rules

## Non-negotiable: Atlassian / Jira Design System

Every UI element in this project must follow the Atlassian Design System (ADS).
Never use Material UI, Chakra, shadcn, Ant Design, or Bootstrap.
Never invent ad-hoc colors, spacing, or typography — always pull from the tokens below.

---

## Typography

### Font Stack
```
font-family: var(--font-inter), -apple-system, BlinkMacSystemFont,
  'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```
Inter is loaded via `next/font/google` in `layout.tsx`. Always use `var(--font-inter)`.

### Type Scale (Atlassian)
| Role         | Size  | Weight | Line-height | Usage                        |
|--------------|-------|--------|-------------|------------------------------|
| `heading-xl` | 29px  | 600    | 32px        | Page titles                  |
| `heading-lg` | 24px  | 600    | 28px        | Section headings             |
| `heading-md` | 20px  | 500    | 24px        | Panel headings               |
| `heading-sm` | 16px  | 600    | 20px        | Card titles                  |
| `heading-xs` | 14px  | 600    | 16px        | Sub-headings                 |
| `body`       | 14px  | 400    | 20px        | Body text (default)          |
| `body-sm`    | 12px  | 400    | 16px        | Secondary body               |
| `label`      | 11px  | 700    | 16px        | Form labels, section headers |
| `code`       | 12px  | 400    | 16px        | `font-family: monospace`     |

Always use CSS classes from `src/styles/atlassian.css`:
- `.ads-text-heading-xl`, `.ads-text-body`, `.ads-label` etc.

### Rules
- Section header labels: `11px / 700 / UPPERCASE / letter-spacing: 0.08em`
- Body default: `14px / 400 / 20px line-height`
- Never use `font-size` below `11px`
- Avoid `font-weight: 300` — ADS minimum is `400`

---

## Color Tokens

All colors come from CSS variables defined in `src/styles/atlassian.css`.
Never hardcode hex values in components — always use `var(--ads-*)`.

### Light theme
```css
--ads-text-primary:      #172B4D   /* Midnight — headings, body */
--ads-text-secondary:    #44546F   /* Ink — secondary text */
--ads-text-subtle:       #626F86   /* Subtler — muted text */
--ads-text-disabled:     #8993A4   /* Disabled */
--ads-text-inverse:      #FFFFFF

--ads-surface-default:   #FFFFFF   /* Cards, panels */
--ads-surface-raised:    #FFFFFF   /* Elevated cards */
--ads-surface-overlay:   #FFFFFF   /* Modals, dropdowns */
--ads-surface-sunken:    #F7F8F9   /* Page background, inputs */

--ads-border:            #DCDFE4
--ads-border-subtle:     #EBECF0
--ads-border-input:      #8993A4
--ads-border-focus:      #579DFF

--ads-brand:             #0C66E4   /* Jira blue — primary CTA */
--ads-brand-hover:       #0055CC
--ads-brand-active:      #09326C
--ads-brand-subtle:      #E9F2FF

--ads-success:           #1F845A
--ads-success-bg:        #DCFFF1
--ads-warning:           #946F00
--ads-warning-bg:        #FFF7D6
--ads-danger:            #CA3521
--ads-danger-bg:         #FFECEB
--ads-discovery:         #6E5DC6
--ads-discovery-bg:      #F3F0FF
--ads-information:       #0C66E4
--ads-information-bg:    #E9F2FF
```

### Dark theme (data-theme="dark")
```css
--ads-text-primary:      #C7D1DB
--ads-text-secondary:    #9FADBC
--ads-text-subtle:       #738496
--ads-text-disabled:     #454F59
--ads-text-inverse:      #1D2125

--ads-surface-default:   #22272B
--ads-surface-raised:    #282E33
--ads-surface-overlay:   #282E33
--ads-surface-sunken:    #1D2125

--ads-border:            #3B4148
--ads-border-subtle:     #2C333A
--ads-border-input:      #596773
--ads-border-focus:      #579DFF

--ads-brand:             #579DFF
--ads-brand-hover:       #85B8FF
--ads-brand-active:      #CCE0FF
--ads-brand-subtle:      #1C2B41

--ads-success:           #7EE2B8
--ads-success-bg:        #1C3329
--ads-warning:           #F5CD47
--ads-warning-bg:        #332500
--ads-danger:            #FD9891
--ads-danger-bg:         #42221F
--ads-discovery:         #B8ACF6
--ads-discovery-bg:      #2B273F
```

---

## Spacing System (4px grid)

Atlassian uses a strict 4px base grid.

| Token      | Value | Use                              |
|------------|-------|----------------------------------|
| `--ads-sp-025` | 2px  | Hairline gaps                   |
| `--ads-sp-050` | 4px  | Tight padding, icon gaps         |
| `--ads-sp-075` | 6px  | Compact padding                  |
| `--ads-sp-100` | 8px  | Default padding, small gaps      |
| `--ads-sp-150` | 12px | Medium padding                   |
| `--ads-sp-200` | 16px | Large padding                    |
| `--ads-sp-250` | 20px | Section padding                  |
| `--ads-sp-300` | 24px | Large section gaps               |
| `--ads-sp-400` | 32px | Page-level spacing               |
| `--ads-sp-500` | 40px | Extra large                      |
| `--ads-sp-600` | 48px | Hero spacing                     |

Always use spacing tokens, never arbitrary pixel values.

---

## Border Radius

| Token              | Value | Use                         |
|--------------------|-------|-----------------------------|
| `--ads-radius-sm`  | 3px   | Buttons, inputs, tags       |
| `--ads-radius-md`  | 4px   | Cards, panels               |
| `--ads-radius-lg`  | 8px   | Modals, floating panels     |
| `--ads-radius-xl`  | 12px  | Pill shapes, large cards    |
| `--ads-radius-full`| 9999px| Avatars, badges             |

---

## Shadows (Atlassian elevation)

| Token            | Use                         |
|------------------|-----------------------------|
| `--ads-shadow-overlay` | Dropdowns, tooltips   |
| `--ads-shadow-raised`  | Cards, floating panels|
| `--ads-shadow-overflow`| Sticky scroll shadows |

---

## Component Rules

### Buttons
- **Primary**: `background: var(--ads-brand)`, white text, `border-radius: var(--ads-radius-sm)`, `height: 32px`, `padding: 0 12px`, `font-size: 14px`, `font-weight: 500`
- **Secondary**: `background: var(--ads-surface-default)`, border `var(--ads-border)`, same dimensions
- **Danger**: `background: var(--ads-danger)`, white text
- **Subtle**: No border, no background — hover shows `var(--ads-surface-sunken)`
- **Icon button**: `width: 32px`, `height: 32px`, `border-radius: var(--ads-radius-sm)` or `border-radius: 50%` for circular
- Never use `border-radius > var(--ads-radius-sm)` on standard buttons

### Inputs / Form fields
- Height: `32px`
- Border: `1.5px solid var(--ads-border-input)`
- Focus: `border-color: var(--ads-border-focus)`, `box-shadow: 0 0 0 2px var(--ads-brand-subtle)`
- Background: `var(--ads-surface-sunken)`
- Padding: `0 8px`
- Font size: `14px`
- Placeholder color: `var(--ads-text-disabled)`

### Labels (form)
- `font-size: 12px`, `font-weight: 600`, `color: var(--ads-text-secondary)`, `margin-bottom: 4px`

### Section headers inside panels
- `font-size: 11px`, `font-weight: 700`, `letter-spacing: 0.08em`, `text-transform: uppercase`, `color: var(--ads-text-subtle)`
- Padding: `10px 12px 4px`

### Panels / Sidebars
- Background: `var(--ads-surface-default)`
- Border: `1px solid var(--ads-border)`
- No rounded corners on docked panels (full-height)
- Rounded corners (`var(--ads-radius-lg)`) on floating panels

### Badges / Lozenges
- Padding: `2px 6px`
- Border-radius: `var(--ads-radius-full)` (pill)
- Font: `11px / 700`
- Use semantic color pairs: `--ads-*` + `--ads-*-bg`

### Icons
- Always use Lucide icons
- Default size: `16px` in nav/toolbar, `14px` in inline contexts
- Stroke-width: `1.8` (Atlassian icons are slightly thinner than default)
- Color: always inherit from parent or explicit `var(--ads-text-*)` token

### Tooltips
- Background: `var(--ads-text-primary)` (inverted)
- Text: `var(--ads-text-inverse)`, `11px / 500`
- Padding: `4px 8px`, border-radius `var(--ads-radius-sm)`

---

## Canvas-specific Rules

- Canvas background: `var(--bg-canvas)` (NOT `--ads-surface-*`)
- Dot grid color: `var(--dot-color)`
- Shape default fill (light): `#E9F2FF` (Atlassian blue subtle)
- Shape default stroke (light): `#0C66E4` (Atlassian brand blue)
- Shape default fill (dark): `#1e1e1e`
- Shape default stroke (dark): `#C7D1DB`
- Selection accent: `var(--ads-brand)`
- Selection handle fill: `var(--ads-surface-default)`

---

## UI Component Library (src/components/ui/)

All reusable UI primitives live in `src/components/ui/` and are exported from `src/components/ui/index.ts`.
**Never inline the same pattern twice** — if you write a button, color swatch, label, or separator more than once, extract it into a `ui/` component first.

### Rule
> Before building any new UI element, check `src/components/ui/` first.
> If the component doesn't exist, create it there, export it from `index.ts`, then use it.
> Import exclusively via the barrel: `import { Button, Label, … } from "@/components/ui"`.

### Available components

| Component | File | Usage |
|---|---|---|
| `Button` | `Button.tsx` | `<Button variant="primary|default|subtle|danger|link" size="sm|md|lg" icon />` |
| `Label` | `Label.tsx` | `<Label variant="section|default" />` — ADS uppercase panel header or form label |
| `Separator` | `Separator.tsx` | `<Separator />` — 1px horizontal rule using `--ads-border` |
| `ColorSwatch` | `ColorSwatch.tsx` | `<ColorSwatch colors value onChange />` — row of clickable color buttons |
| `SliderRow` | `SliderRow.tsx` | `<SliderRow label min max step value onChange format? />` |
| `MenuItem` | `MenuItem.tsx` | `<MenuItem icon label shortcut? accent? danger? onClick? />` — sidebar/menu row |
| `PanelSection` | `PanelSection.tsx` | `<PanelSection title>` — section with ADS label + padded content area |
| `NumberInput` | `NumberInput.tsx` | `<NumberInput min max value onChange />` |
| `Toast` / `useToast` | `Toast.tsx` | Toast notification overlay + hook |

### Styling rules for new ui/ components
- Use only `var(--ads-*)` tokens — never hardcode colors or sizes
- Use `className="ads-btn ads-btn-primary"` etc. from `atlassian.css` where applicable
- Accept a `style?: React.CSSProperties` prop for layout overrides (width, flex, margin)
- Never accept a `className` prop that could override ADS tokens inconsistently
- Keep components pure: no store access, no side effects — only props in, JSX out

---

## Do / Don't

| ✅ Do                                      | ❌ Don't                                    |
|-------------------------------------------|---------------------------------------------|
| Use `var(--ads-*)` CSS tokens             | Hardcode hex colors in JSX/TSS              |
| Use Inter font via CSS var                | Import or reference other font families     |
| Use 4px spacing grid                      | Use arbitrary values like `margin: 7px`     |
| Use Lucide icons, strokeWidth 1.8         | Use emoji, SVG blobs, or other icon sets    |
| Use semantic color tokens for status      | Use raw hex for success/error/warning       |
| Keep panels flat (no gradient, no blur)   | Add glassmorphism, blur, or heavy gradients |
| Use `transition` only on bg/border/color  | Animate layout, width, or transform heavily |
| Check `data-theme` attribute for theme    | Use `window.matchMedia` for dark detection  |
| Build new UI as a `ui/` component first   | Copy-paste the same button/label inline     |
| Import from `@/components/ui` barrel      | Import individual ui files directly         |

---

## File References

- Design tokens + component CSS: `src/styles/atlassian.css` — imported globally via `globals.css`
- UI component library: `src/components/ui/index.ts` — barrel export for all primitives
- Theme switching: `src/stores/themeStore.ts` + `src/hooks/useTheme.ts`
- Theme attribute: `document.documentElement.setAttribute("data-theme", theme)`
- Canvas store: `src/stores/canvasStore.ts`
- All types: `src/types/index.ts`
