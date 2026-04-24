# Netscape 6 Welcome Page Memo

## Chapter 1

### 1.05 Doc web archive 

* https://web.archive.org/web/20000510081613/home.netscape.com/browsers/6/su_setup.html

### 1.10 Image print from the days

Reference image:
[dde2c451-7273-4cef-bc82-d84c839cd8e3.jpg](dde2c451-7273-4cef-bc82-d84c839cd8e3.jpg)

For this reconstruction, the image reference is the page content rectangle only. It is not the full Netscape browser window, not the left sidebar, not the status bar, and not the toolbar chrome. The area of interest is the document viewport referenced by the page scroll bars.

The current image still includes the surrounding browser UI, so any visual check must mentally crop to the white document area. If precision becomes important, a later cropped print of the content area will become the primary image reference.

### 1.20 Source reference

Primary source:
Wayback capture of `http://home.netscape.com/browsers/6/su_setup.html`, archived on May 10, 2000 at 08:16:13.

The source supplied in this session contains the original dynamic HTML and JavaScript for the "Netscape 6 - What's New" welcome page. The Wayback wrapper, toolbar scripts, and rewritten archive assets are not part of the page reconstruction.

Important source behaviors to preserve or approximate:

* `resizeWindow()` targets an inner viewport of `606px` by `464px` on an 800x625 or larger screen.
* `q1()` creates layered "Netscape" text dynamically.
* `clip_the_six()` creates a very large pale background `6`.
* `q_ocean()` positions the Netscape logo placeholder, the water bars, the top and bottom callouts, the left sidebar callout, link callouts, and the buttons.
* `q2()` creates the "What's New" reflection slices in the ocean area.
* `stop2.gif`, `sleft2.gif`, and `sbottom2.gif` are being represented with inline SVG markers for now.
* `animthrob_single.gif` is represented with a simple square Netscape logo placeholder for now.

### 1.30 First static pass

The first local implementation is:
[index.html](index.html)

This pass is intentionally static. It uses the original source formulas as a guide, then freezes the layout around the `606px` by `464px` content viewport. The ocean reflection and the animated text are represented as still layers.

### 1.40 Viewer shell

The zoomable wrapper is:
[viewer.html](viewer.html)

The viewer shell now keeps controls and inspection behavior outside the reconstruction without using an iframe. The page source remains `index.html`; `viewer.js` fetches that file, parses the `.welcome-stage`, scopes its CSS into the viewer, measures the source layout in an offscreen DOM viewport, then injects normalized direct layer children into the visible `.content-plane`.

The toolbar is a right-side sidebar. The visible reconstruction surface is parent-document DOM, so layer depth experiments are not flattened by an embedded browsing context.

## Chapter 2

### 2.10 Initial plan

* Define the HTML viewport as a fixed `606px` by `464px` document content area.
* Define an absolute positioning strategy for this first version, because the original source computes most positions into absolute coordinates.
* Follow the archived source as closely as practical, while using the supplied image as a visual sanity check.
* Defer complex areas such as the exact ocean reflection animation until the static page geometry is close.
* Use inline SVG for the source GIF arrow markers.
* Treat the Netscape logo as a simple square placeholder until the final asset is supplied.
* Keep inspection and zoom tooling in a wrapper page so the reconstructed content does not inherit viewer concerns.

### 2.20 3D viewer controls

The viewer page keeps the static reconstruction source in `index.html`, then applies inspection controls from the parent document through normalized layer clones.

Current 3D controls:

* Rotate X, Rotate Y, and Rotate Z sliders rotate the content plane.
* The Perspective slider changes the CSS perspective distance on the content square that directly contains the transformed plane.
* The Z explosion button toggles depth separation on direct children of the parent-DOM content plane.
* The Z slider controls the spacing multiplier in one-unit steps. At `Z 0`, the transformed Z distance is zero. As the slider increases, each positioned layer is translated by `(layer rank + 1) * slider * 1.005`.
* Layer ranking starts from the top-level children of `.welcome-stage` in DOM definition order, but selected nested visual elements can be promoted into direct 3D layers. The first promoted nested group is `.netscape-layer`, so each stacked "Netscape" word can detach independently instead of moving as one `.netscape-word` group.
* The source measurement stage is hidden offscreen. The visible layers are injected directly into `.content-plane`, with a separate white backdrop layer.

This is still a viewer-only inspection tool. The page reconstruction in `index.html` remains a fixed absolute layout.

### 2.30 Z transform test target

The single-layer red `6` diagnostic was the first Z experiment that visibly worked. In that historical version, the viewer created a red `6` as a direct child of the parent `.content-plane`, copied the source `.bg-six` geometry/font styling, and moved the red layer with `translateZ()` outside the iframe and outside the copied page subtree. That invented diagnostic layer has now been removed.

The later direct all-layer experiments explained why the iframe had to be removed:

* Direct iframe mutation kept transforms inside the iframe rendering surface, which appears flattened in practice.
* Copied-stage DOM-order mutation moved the visible page into the parent DOM, but nested stage transforms still did not read as clearly as a direct child layer.
* The likely difference is that the working red `6` was a direct child of the transformed 3D plane, while the weaker experiments applied transforms inside the nested page/stage structure.

Resume point: continue from the no-iframe `viewer.html` plus `viewer.js` implementation. Validate in a local HTTP server because the viewer fetches `index.html`; opening `viewer.html` directly as a `file://` URL may block that fetch in modern browsers.

## Chapter 3

### 3.10 Single HTML direction

The next intended direction is to bring the viewer and the reconstruction into the same HTML document. The current no-iframe viewer already moves in this direction by fetching `index.html`, parsing the source, measuring it offscreen, and injecting direct layers into the parent DOM. The later cleanup should remove that fetch/parse split and make one HTML file contain both:

* the original reconstruction surface;
* the offscreen or source layout used for measurement, if still needed;
* the visible normalized 3D inspection plane;
* the viewer controls.

This should keep the reconstruction semantics clear while avoiding iframe flattening and avoiding source duplication where practical.

### 3.20 Initial 3D inspection pose

The preferred initial 3D viewer settings are:

* Rotate X: `43`
* Rotate Y: `10`
* Rotate Z: `-15`
* Perspective: `1050`

The reset 3D control should return to these values, not to a flat zero-rotation view.

### 3.30 Vertical sidebar controls

The viewer controls should remain in a vertical right-side sidebar. This keeps the page content and the 3D inspection plane visually separate from the tool controls, and leaves the main viewport dedicated to the reconstructed Netscape content.
