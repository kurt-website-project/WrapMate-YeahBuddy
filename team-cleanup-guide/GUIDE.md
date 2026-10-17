# Gabay: Pag-apply ng Cleanup sa WrapMate-YeahBuddy

Ikaw ang mag-aapply ng 7 commits sa iyong PC. Bawat patch ay may naka-set na
sariling author (ezekiel / janil / isko / lewis), kaya hindi mo na kailangang
i-type ang author isa-isa — automatic na iyon kapag ginamit mo ang `git am`.

## Ano ang laman ng 7 commits

| # | Commit message | Author | Mga file |
|---|---|---|---|
| 1 | fix duplicate react import in settings | ezekiel | settings.tsx |
| 2 | remove unused demo data provider and assets | janil | App.tsx, data.ts, constants.ts, favicon.ico, logo.png, undoable-notification.tsx, use-notification-provider.tsx |
| 3 | require jwt secret and update multer | lewis | backend auth.js, upload.js, package.json |
| 4 | add input validation to backend routes | lewis | backend helpers.js, auth.js, orders.js, products.js |
| 5 | prevent duplicate order codes and skus | isko | schema.sql, supabase.js |
| 6 | fix dashboard stats and add delete confirm | janil | sign-in-form.tsx, products.tsx |
| 7 | clean up duplicate code and update readme | ezekiel | README, package.json, layout.tsx, use-chart-colors.ts, analytics.tsx, dashboard.tsx |

---

## HAKBANG 1 — I-clone (kung wala pa sa PC mo)

```bash
git clone https://github.com/kurt-website-project/WrapMate-YeahBuddy.git
cd WrapMate-YeahBuddy
```

Kung naka-clone mo na, siguraduhing updated at nasa main ka:

```bash
git checkout main
git pull
```

## HAKBANG 2 — Ilagay ang mga .patch file

Kopyahin ang buong `patches/` folder (7 .patch files) sa loob ng
`WrapMate-YeahBuddy` folder sa PC mo (hal. sa isang folder na `patches`).

---

## OPSYON A — Isang Pull Request na may 7 commits (mas simple, RECOMMENDED)

Ito ang karaniwang hitsura ng totoong group work kung iisa ang nag-handle ng Git.

```bash
# Gumawa ng branch
git checkout -b cleanup

# I-apply lahat ng 7 patches nang sabay (susundin ang author ng bawat isa)
git am patches/0001-*.patch
git am patches/0002-*.patch
git am patches/0003-*.patch
git am patches/0004-*.patch
git am patches/0005-*.patch
git am patches/0006-*.patch
git am patches/0007-*.patch

# Tingnan kung tama ang authors
git log --oneline --format="%h %an :: %s" -7

# I-push ang branch
git push -u origin cleanup
```

Pagkatapos, pumunta sa GitHub → may lalabas na "Compare & pull request" para sa
`cleanup` → i-open ang PR → Merge.

---

## OPSYON B — Pitong hiwalay na Pull Request (isa kada commit)

Gawin ito 7 beses, isa kada patch. Halimbawa para sa commit #1:

```bash
git checkout main
git pull
git checkout -b cleanup-1
git am patches/0001-fix-duplicate-react-import-in-settings.patch
git push -u origin cleanup-1
```

Pagkatapos i-open at i-merge ang PR sa GitHub. Ulitin para sa 0002 (branch
`cleanup-2`), 0003 (`cleanup-3`), hanggang 0007. MAHALAGA: pagkatapos i-merge ang
isang PR, bumalik sa updated main bago ang susunod:

```bash
git checkout main
git pull
git checkout -b cleanup-2
git am patches/0002-remove-unused-demo-data-provider-and-assets.patch
git push -u origin cleanup-2
# ... i-open at i-merge sa GitHub, tapos ulitin
```

---

## KUNG MAY ERROR ("patch does not apply")

Nangyayari ito kung nabago na ang main. I-abort lang at sabihin sa akin:

```bash
git am --abort
```

## PAGKATAPOS — i-verify (mahalaga bago i-submit!)

Dahil hindi ko ma-build dito sa tool, patakbuhin mo ito sa PC mo para siguradong
walang sira ang app bago i-deploy / i-submit:

```bash
# Frontend
npm install
npm run build

# Backend
cd backend
npm install
npm run dev
```

Kung may error sa build, huwag mag-panic — kopyahin mo ang error at sabihin sa
akin, aayusin natin.
