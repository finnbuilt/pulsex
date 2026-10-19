# UI Context — PulseX

## Theme

PulseX uses an **Obsidian Emerald / Cyber Glass** design system. The interface is dark-only, engineered to feel native to X's "Lights Out" theme while maintaining a distinct, futuristic aesthetic.

The visual language relies on near-black obsidian backgrounds (`#0b0f17`, `#0a0e16`), ultra-deep glass surfaces with high-blur backdrops (`backdrop-filter: blur(16px)` to `blur(22px)`), radiant emerald accents (`#10b981`), cyber cyan highlights (`#06b6d4`), and glowing status indicators. All styles injected into X.com are strictly scoped inside Shadow DOM roots to eliminate style bleeding.

## Colors

| Role | Token / CSS Property | Value | Description |
| --- | --- | --- | --- |
| **Obsidian Base BG** | `--px-bg` | `rgba(11, 15, 23, 0.94)` | Primary background for inline bars and popups. |
| **Drawer Surface** | `--px-drawer-bg` | `rgba(10, 14, 22, 0.97)` | Deep obsidian glass for the Copilot drawer. |
| **Emerald Primary** | `--px-emerald` | `#10b981` | Core accent color for buttons, badges, and glows. |
| **Emerald Light** | `--px-emerald-light`| `#34d399` | Gradient transitions and active indicators. |
| **Cyber Cyan** | `--px-cyan` | `#06b6d4` | Highlights, nested reply badges, and titles. |
| **Dark Gradient** | `--px-emerald-dark` | `#059669` | Linear gradient start for primary action buttons. |
| **Text Primary** | `--px-text-primary` | `#f8fafc` | High-contrast white for headers and outputs. |
| **Text Secondary** | `--px-text-secondary`| `#94a3b8` | Neutral slate for labels, angles, and hints. |
| **Text Muted** | `--px-text-muted` | `#64748b` | Subdued metadata and timestamp texts. |
| **Default Border** | `--px-border` | `rgba(16, 185, 129, 0.28)` | Subtle emerald outline providing glass definition. |
| **Hover Border** | `--px-border-hover` | `rgba(16, 185, 129, 0.65)` | Intensified emerald glow on interaction. |
| **Error Alert** | `--px-state-error` | `#f87171` | Warm red for API errors and invalid keys. |
| **Card Surface** | `--px-surface` | `rgba(255, 255, 255, 0.04)` | Inset backgrounds for inputs and angle buttons. |

## Typography

| Role | Font Family | Size | Weight |
| --- | --- | --- | --- |
| **Base UI** | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | `12px` | 400 (Regular) |
| **Brand Titles** | System Sans with gradient fill | `13px`–`14px` | 800 (Extra Bold) |
| **Angle Buttons** | System Sans | `11.5px` | 600 (Semi Bold) |
| **Badges & Labels** | System Sans | `11px` | 600–700 |
| **Preview Content** | System Sans | `12.5px` | 400 (Line height: 1.45) |
| **Monospace / Keys**| `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace` | `11px` | 400 |

## Border Radius

| Context | Radius | Selector / Component |
| --- | --- | --- |
| **Inline Bar Container** | `12px` | `.pulsex-inline-bar` |
| **Floating Toggle Pill** | `14px` | `.pulsex-floating-toggle` |
| **Slide-out Drawer** | `0px` (Left border `1px`) | `.pulsex-drawer` |
| **Angle Buttons** | `7px` | `.pulsex-angle-btn` |
| **Raw Inputs & Chat Box**| `7px`–`8px` | `.pulsex-raw-input`, `.pulsex-chat-input` |
| **Primary Buttons** | `7px`–`8px` | `.pulsex-btn-generate`, `.pulsex-insert-btn` |
| **Chips / Quick Tags** | `12px` (Pill) | `.pulsex-chip` |
| **Chat Bubbles** | `10px` | `.pulsex-msg` |

## Layout Patterns

- **In-Timeline Action Bar**: Mounted directly above Twitter's bottom toolbar (`[data-testid="toolBar"]`). Formatted as a full-width column (`width: 100% !important; flex-basis: 100% !important;`). The top header displays the PulseX glowing dot and `Replying to [Name] (in thread)` badge; middle row hosts the 5 angle buttons; bottom row contains the `Raw Thoughts` text input and `Generate` button.
- **Preview Reveal Drawer**: Inset directly below the raw thoughts row with dashed emerald border (`border: 1px dashed rgba(16, 185, 129, 0.35)`). Features a right-aligned action row with `Discard` and `Insert into Tweet`.
- **Floating Bottom-Right Toggle**: Fixed position (`bottom: 24px; right: 24px; z-index: 2147483647`). Features an SVG icon with glowing radial shadow and hover scale animation (`transform: scale(1.1)`).
- **Slide-out Copilot Drawer**: Fixed right drawer (`width: 400px; height: 100vh`). Contains sticky header, contextual post summary, horizontally scrolling quick-prompt chips, scrollable multi-turn chat stream, and pinned bottom composer with "Insert Latest Reply" button.
- **Settings Popup**: Compact 340px popover modal containing real-time status pill, password-masked API input with toggle eye, styled model dropdown, persona textarea, and ad-blocking switch.
