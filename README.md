# Before / after showcase (Webflow)

Draggable before/after comparison: both images fill a **3∶2** frame with `object-fit: cover`. Starts at **50%** split. **Drag right** (or click farther right) reveals **more before**; the after image shows on the right. Includes keyboard support and slider ARIA on the handle.

Stack: **HTML**, **CSS**, **jQuery** — no React.

## Files

| File | Role |
|------|------|
| `before-after.css` | Box layout, clip, handle |
| `before-after.js` | Drag, click-to-position, keyboard |
| `index.html` | Local demo only |

## Webflow integration

### 1. Site / page custom code

**Head** (before `</head>`):

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<link rel="stylesheet" href="/path/to/before-after.css" />
```

**Footer** (before `</body>`):

```html
<script defer src="/path/to/before-after.js"></script>
```

Skip jQuery in the head if Webflow already loads it. Host CSS/JS on your CDN or Webflow assets.

### 2. Markup

One root per comparison. Put `<img>` tags inside the before and after layers (or let Webflow image elements output them).

```html
<div data-showcase="box">
  <div data-showcase="after">
    <img src="AFTER_URL" alt="After" />
  </div>
  <div data-showcase="before">
    <img src="BEFORE_URL" alt="Before" />
  </div>
  <button type="button" data-showcase="slider" aria-label="Compare before and after"></button>
</div>
```

Use a **button** for the handle so it is focusable and works with keyboard out of the box. Style the grip and line in Webflow on `[data-showcase="slider"]`, or keep the defaults from `before-after.css`.

### 3. Data attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-showcase="box"` | Root | Container; `aspect-ratio: 3/2`, clip + init target |
| `data-showcase="after"` | Div | After image layer (full bleed, under before) |
| `data-showcase="before"` | Div | Before image layer (clipped from the left edge to the handle) |
| `data-showcase="slider"` | Button | Draggable handle + divider |
| `data-showcase-initial="50"` | `[data-showcase="box"]` | Optional start split **0–100** (default **50**) |

## Behaviour

- **Load** → split at 50%; handle centered.
- **Drag** anywhere on the box, or on the handle → updates split (desktop: immediate; touch: after a horizontal intent).
- **Click / tap** on the box → jumps handle to that horizontal position.
- **Touch scroll** → vertical swipes on the widget scroll the page; horizontal swipes drag the split (10px intent threshold).
- **Drag right** → more **before** visible (before expands from the left).
- **Keyboard** (handle focused) → **ArrowLeft** / **ArrowRight** adjust by 2%; **Home** / **End** go to 0% / 100%.
- **`showcase:change`** jQuery event on the box with the current split (0–100) when the position changes.

## Styling notes

- The box is `width: 100%` with `aspect-ratio: 3/2` in CSS; constrain width in Webflow (e.g. max width on the parent).
- Images use **`object-fit: cover`** and **`object-position: center`** so both shots align in the frame.
- Override handle appearance in Webflow; default CSS draws a white line and circular grip.
- While dragging, transitions on the clip are disabled for responsive tracking; reduced motion is respected for optional transitions.

## Local demo

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/` and use `index.html`.
