# Landing Site

The `landing/` folder is a Hugo/Hugoplate static site. It is independent from the realtime Vue/Socket.IO app.

## Important Paths

| Path | Purpose |
| --- | --- |
| `landing/content/english/` | Markdown content for home, about, blog, contact, authors, and pages. |
| `landing/content/english/sections/` | Reusable content sections such as call-to-action. |
| `landing/config/_default/` | Shared Hugo config, menus, language, modules, and parameters. |
| `landing/config/production/` | Production overrides, including `params.appURL`. |
| `landing/assets/images/` | Site images, logo, screenshots, Open Graph image, and gallery assets. |
| `landing/assets/css/custom.css` | Project-specific style overrides. |
| `landing/themes/hugoplate/` | Vendored/customized Hugoplate theme files. |
| `landing/data/theme.json` | Theme color/font tokens. |
| `landing/data/social.json` | Social profile data. |

## Build Commands

```bash
cd landing
npm install
npm run dev
npm run build
npm run preview
```

## Configuration Notes

- `landing/hugo.toml` sets the site title, theme, output formats, plugins, markup, and Hugo module mounts.
- `landing/config/_default/languages.toml` currently enables English content only.
- `landing/config/_default/menus.en.toml` defines the main navigation.
- `landing/config/_default/module.toml` requires Hugo Extended and imports gethugothemes modules plus Mermaid support.
- `landing/config/_default/params.toml` contains SEO metadata, logo settings, search, Google Tag Manager, and the navigation button.
- `landing/config/production/config.toml` sets `params.appURL = "https://app.planfree.dev"`.

## Editing Guidance

- Prefer content edits in `landing/content/english/` before changing theme layouts.
- Prefer project overrides in `landing/assets/css/custom.css` before changing broad theme CSS.
- Treat `landing/themes/hugoplate/` as theme code. Check whether a change belongs in content/config first.
- Keep app links aligned with the deployed client URL.
