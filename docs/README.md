# Canyon Journal — Marketing Site (docs/)

Static marketing website published via GitHub Pages. Built with Jekyll for shared layouts and templating.

## Files

- `index.html` — Homepage with hero, feature grid, and call-to-action.
- `contact.html` — Contact page with email address.
- `privacy.html` — Privacy statement.
- `assets/styles.css` — Site styles.
- `_layouts/base.html` — Shared layout (head, header, footer). All pages extend this.
- `_layouts/page.html` — Centred content page layout (used by contact + privacy).
- `_config.yml` — Jekyll site configuration.

## Deploy

GitHub Pages automatically builds Jekyll when you push to `main`. No workflow file needed — just ensure the Pages setting points to the `docs/` folder.

## Testing Locally

Requires Ruby. On Windows, install via [RubyInstaller](https://rubyinstaller.org/) (Ruby+Devkit).

```bash
# One-time setup
gem install bundler jekyll

# Serve locally
cd docs
jekyll serve
```

Then visit **http://localhost:4000**.
