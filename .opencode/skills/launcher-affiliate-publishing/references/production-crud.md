# Production CRUD Runbook

Run every command from:

`/Users/wy/Documents/launcher/launcher-app`

## Read Or Export

Display one complete page:

```bash
bun run seo show-post --id <id-or-localized-slug>
```

Export it for editing:

```bash
bun run seo show-post \
  --id <id-or-localized-slug> \
  --out /tmp/launcher-post.json
```

## Publish

The file must contain exactly one complete published page, directly or inside `{ "pages": [...] }`.

```bash
bun run seo publish-post \
  --file /tmp/launcher-post.json \
  --prod \
  --yes
```

## Edit

Export the current page, modify the complete JSON, then replace it atomically:

```bash
bun run seo edit-post \
  --id <existing-id-or-slug> \
  --file /tmp/launcher-post.json \
  --prod \
  --yes
```

The stored page ID remains authoritative. A supplied ID must match it.

## Remove

```bash
bun run seo remove-post \
  --id <existing-id-or-slug> \
  --prod \
  --yes
```

## Local Test Mode

Omit `--prod` and point at an isolated JSON array:

```bash
bun run seo publish-post \
  --file /tmp/launcher-post.json \
  --content-file /tmp/launcher-pages-test.json
```

## Failure Handling

- Before commit, failed validation/build restores the original `data/pages.json`.
- After commit, a failed push preserves the local commit. Report its SHA and retry the push after resolving synchronization/authentication.
- Never reset, force-push, stash, or clean the user's worktree automatically.
- Production commands intentionally reject dirty worktrees, custom content files, non-master branches, stale branches, and non-affiliate offers.

## Deployment Check

After a production command pushes:

```bash
vercel ls --format json --scope tanwyhangs-projects
vercel inspect <matching-deployment-url> --wait --timeout 3m --scope tanwyhangs-projects
```

Match the deployment by `githubCommitSha`. Report production only after status is `READY` and aliases include `https://www.launcher.my`.
