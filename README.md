# Anniversary Website

## Deploying with Render

This repository is configured for Render static site deployment.

- The `render.yaml` file defines a static site service for the `main` branch.
- No build command is required for this simple HTML/CSS/JS site.
- The site publishes from the repository root (`publishPath: .`).

To connect this repo to Render:

1. In the Render Dashboard, choose `New > Static Site`.
2. Link your GitHub repository: `seenmanatee/apr28`.
3. Select the `main` branch.
4. Render will use `render.yaml` to configure the service automatically.

If you want, you can also create the site from the Render dashboard and then associate it with this repo.

