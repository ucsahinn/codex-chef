# Yayınlama Checklist'i

Bu repo public push için tasarlandı, fakat publish ayrı bir kullanıcı kararıdır.

## Push Veya Release Öncesi

```bash
npm run check
npm run validate:release
npm run verify:skills:online
node scripts/plan-install.mjs --all --json --redact-paths
npm run validate:install-state
npm run release:notes:check
git status --short
git diff --check
git diff --cached --check
```

Gitleaks varsa:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

Release için ayrıca şunları doğrula:

- `package.json` version hedef tag ile aynı olmalı.
- `CHANGELOG.md` içinde tarihli version bölümü olmalı.
- [docs/release-notes.tr.md](release-notes.tr.md) release ile aynı olmalı.
- [docs/github-settings.tr.md](github-settings.tr.md) hedef repo açıklaması,
  topic'leri ve release metadata'sı ile aynı olmalı.
- `git diff --cached` yalnızca review edilmiş source/docs/config dosyalarını
  içermeli.
- ignored `.serena/`, `tmp/`, log, cache, screenshot ve generated archive
  dosyaları stage edilmemeli.

## GitHub Repo Oluşturma

GitHub CLI ile, açık onaydan sonra:

```bash
gh repo create codex-chef --public --source . --remote origin
git push -u origin main
```

Manuel remote:

```bash
git remote add origin https://github.com/<owner>/codex-chef.git
git push -u origin main
```

Release-note artifact'ini yalnizca read-only kontroller gectikten ve gercekten
release hazirlanirken olustur.

## Mevcut Repo Release Akışı

Açık commit/push/release onayından sonra:

```bash
git add <review edilmiş dosyalar>
git diff --cached
npm run release:notes
git commit -m "Release Codex Chef v0.5.45"
git push origin main
git tag v0.5.45
git push origin v0.5.45
gh release create v0.5.45 --title "Codex Chef v0.5.45" --notes-file tmp/release-notes-current.md
```

Push sonrasında remote eşitliği ve CI durumunu doğrula:

```bash
git rev-parse HEAD
git -c http.sslBackend=openssl ls-remote origin refs/heads/main
gh run list --workflow validate --branch main --limit 1
```

## Public Etme

Şunları public repo'ya koyma:

- gerçek credential
- auth dosyası
- Codex memory/session state
- kullanıcıya özel `.codex` backup'ları
- lokal proje pathleri
- installer ve release archive'ları

## Release Artifact

Bu paket source-first. İleride zip veya installer üretirsen bunları source'a
commit etmek yerine GitHub Releases üzerinden yayınla.
