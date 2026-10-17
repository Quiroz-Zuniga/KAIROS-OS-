---
name: kairos-ui
description: Enforce the Kairós OS geometric visual language, branding, design tokens, accessibility, desktop-shell UX, terminal identity, Openbox theme, launcher, panel, settings, AI, Files, Task Manager, boot, and visual consistency.
---

# Kairós UI

## Visual principle

Kairós OS must communicate:

- intelligence
- precision
- order
- technology
- vision
- calm
- control

The interface should remain recognizable as Kairós OS even when the logo is not visible.

The design language is:

GEOMETRIC.

---

# Brand symbol

Primary symbol:

Búho geométrico.

The owl represents:

- intelligence
- observation
- vision
- analysis
- precision
- correct timing
- decision

The concept must remain subtle.

Avoid making every component contain an owl.

---

# Owl design rules

The owl should be:

- geometric
- symmetrical
- minimal
- built from thin lines
- recognizable at small sizes
- technological
- clean

Avoid:

- realistic feathers
- cartoon owls
- gaming mascots
- aggressive esports branding
- excessive neon
- cyberpunk effects
- large 3D effects
- complex backgrounds
- excessive gradients

---

# Official colors

## Core palette

```text
Kairós Navy
#0B1F3A

Kairós Deep Blue
#123B73

Kairós Blue
#1296F3

Kairós Cyan
#19C2FF

Kairós Ice
#BFE9FF

Kairós White
#F7FAFC

Kairós Graphite
#1C2733

Kairós Black
#0A0F16

Dark theme
--bg-primary: #0A0F16;
--bg-secondary: #111923;
--bg-tertiary: #1C2733;

--surface: #16212D;
--surface-hover: #1E2C3B;

--border: #2B3B4C;

--text-primary: #F7FAFC;
--text-secondary: #A8B4C2;
--text-muted: #708090;

--accent-primary: #1296F3;
--accent-secondary: #19C2FF;
--accent-dark: #123B73;

Dark mode is the main visual presentation of Kairós OS.
Do not use absolute black on every surface.
Create depth through controlled surface variation.
Light theme
--bg-primary: #F7FAFC;
--bg-secondary: #EEF3F7;
--bg-tertiary: #DCE4EC;

--surface: #FFFFFF;
--surface-hover: #EAF4FC;

--border: #C7D2DD;

--text-primary: #0B1F3A;
--text-secondary: #4C6175;
--text-muted: #7D8FA3;

--accent-primary: #1296F3;
--accent-secondary: #19C2FF;
--accent-dark: #123B73;

Dark and light modes must share geometry and component structure.
System state colors
--success: #23C483;
--warning: #F4B740;
--danger: #E5484D;
--info: #1296F3;

Use them semantically.
Do not use danger red as decoration.
Do not use success green for branding.
Geometry
Use consistent spacing.
Preferred scale:
4px
8px
12px
16px
24px
32px
48px

Preferred border radius:
4px
6px
8px

Avoid excessive:
20px
30px
40px

unless a component specifically requires it.
Visual forms
Prefer:
- straight lines
- controlled diagonals
- thin borders
- modular panels
- angular details
- clear grids
- measured symmetry
- precise spacing
Avoid:
- overly soft mobile layouts
- large pill shapes
- excessive floating bubbles
- decorative randomness
Shadows
Use subtle shadows.
Depth should primarily come from:
- surface contrast
- thin borders
- slight shadow
- hierarchy
Avoid:
- strong glow
- gaming shadows
- heavy neon bloom
Gradients
Use gradients only for branding or special surfaces.
Allowed brand gradient:
linear-gradient(
  135deg,
  #0B1F3A 0%,
  #123B73 45%,
  #1296F3 75%,
  #19C2FF 100%
);

Appropriate uses:
- splash
- wallpaper
- login
- About branding
Avoid gradients on every button.
Typography
Use a modern, redistributable sans-serif for UI.
Requirements:
- readable
- professional
- technical
- good at small sizes
- legally redistributable
Use a monospace font for terminal/code.
Create clear hierarchy:
Display
Heading
Subheading
Body
Caption
Monospace

Iconography
Icons must use one visual family.
Prefer:
- thin strokes
- outline style
- geometric proportions
- consistent sizes
Important Kairós icons:
- launcher
- Files
- Terminal
- Settings
- Task Manager
- Devices
- AI
- network
- audio
- power
- notifications
Do not mix unrelated icon styles.
Desktop
Kairós Desktop should contain:
- wallpaper
- panel/taskbar
- launcher
- running applications
- system indicators
- clock
- notifications
- quick settings
Openbox remains responsible for actual Linux windows.
Electron/Kairós Shell provides the user experience.
Panel/taskbar
The panel should reflect real running applications.
Do not fake application states.
Eventually support:
- active
- minimized
- urgent
- focused
Panel design:
- geometric
- compact
- low visual noise
- clear active state
Avoid excessive transparency/blur.
Launcher
Kairós Launcher must combine:
- Kairós applications
- Linux .desktop applications
Possible groups:
Development
Internet
System
Multimedia
Utilities

Launcher results must represent installed applications.
Window design
Kairós/Openbox window styling should use:
- thin borders
- compact title bars
- geometric controls
- subtle shadows
- small radius
Controls:
- minimize
- maximize
- close
Avoid copying macOS or Windows exactly.
Motion
Preferred duration:
100–250 ms

Use:
- opacity
- small translate
- small scale
Avoid:
- continuous decorative animation
- exaggerated spring effects
- long transitions
Respect reduced-motion preferences where possible.
Accessibility
Every UI feature must consider:
- keyboard navigation
- visible focus
- semantic labels
- contrast
- disabled state
- error state
- zoom/scaling
- readable typography
Never encode meaning by color alone.
Terminal colors
--terminal-bg: #071019;
--terminal-text: #D9F2FF;
--terminal-blue: #1296F3;
--terminal-cyan: #19C2FF;
--terminal-green: #23C483;
--terminal-warning: #F4B740;
--terminal-error: #E5484D;

Prompt concept:
kairos@system:~$

Suggested colors:
- kairos → Cyan
- system → Blue
- path → Ice
- success → Green
- warnings → Yellow
- errors → Red
Terminal owl
The terminal owl is a separate text representation of the logo.
Do not force the vector logo directly into text.
Requirements:
- monospace-safe
- symmetrical
- geometric
- recognizable as owl
- eyes visible
- body visible
- no distorted K
- UTF-8 version
- ASCII fallback
Test it in at least two monospace fonts.
Wallpaper
Wallpaper should be subdued.
Base:
#0A0F16
#0B1F3A

May contain subtle:
- diagonals
- polygons
- lines
- fragments inspired by owl geometry
Low opacity.
Wallpaper must not compete with application windows.
Design tokens
Do not scatter values through components.
Prefer shared files such as:
colors.css
spacing.css
typography.css
shadows.css
components.css

Avoid:
style="color:#1296F3"

when a token exists.
Migration
Do not rewrite functional UI unnecessarily.
Use progressive migration.
Preserve:
- state
- behavior
- existing data
- tests
while applying the Kairós design system.
UI completion checklist
Before marking a visual task complete:
- Does it look like Kairós without the logo?
- Does it use official color tokens?
- Is spacing consistent?
- Are lines/borders geometric?
- Does dark mode work?
- Is keyboard navigation usable?
- Is focus visible?
- Are disabled/error states visible?
- Is contrast acceptable?
- Are system values real rather than simulated?
- Does Openbox interaction still work?
- Is there screenshot evidence?