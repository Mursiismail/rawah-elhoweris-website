# RAWah ELHOWERIS – Dentist portfolio

A static website. No build step, no backend. Works on GitHub Pages and any static host.

## Publish on GitHub Pages
1. Create a repository and upload everything in this folder (keep `.nojekyll`).
2. Repository **Settings → Pages → Deploy from a branch → main / (root)**.
3. Once the address is known, run once: `python3 tools/set_site_url.py https://USERNAME.github.io/REPO/`
   (this fixes the social-share preview and the 404 page's "Back to home" link).

All paths are relative, so it works from a repository sub-folder.
To preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000
(opening `index.html` by double-click will not load the content).

## Where to change things
| To change | Edit |
|---|---|
| Hero statement, About, Experience, Education, Skills, Registration, CV summary, Contact, case names | `content/content.json` |
| Registration numbers | `registration.items[].number` in `content.json` (shown automatically once filled in) |
| CV | Replace `assets/cv/Rawah-Elhoweris-CV.pdf` (same file name) |
| Page title / meta description | `index.html` `<head>` |
| Colours, fonts, spacing | top of `assets/css/styles.css` (`:root`) |

## Clinical cases
Each case is a folder in `assets/images/cases/` (original folder and file names from the ZIP, untouched).
`content.json → cases.items` lists each case: `folder`, display `name`, and its `images` in order
(optional `label` such as "Before"/"After", optional `alt`).

To replace or add an image: put the file in the case folder, update `content.json` if the file name changed,
then run `pip install Pillow` and `python3 tools/optimize_images.py`.
This creates optimised WebP sizes in each folder's `web/` subfolder and `manifest.json`; originals are never modified.

## Notes
- Fonts (Instrument Serif, Hanken Grotesk) are included in `assets/fonts/`; nothing loads from external servers.
- Lightbox: click an image to enlarge; close with the X, Esc, or a click.
