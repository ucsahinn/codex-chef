# Yayınlama Checklist'i

Bu repo public push için tasarlandı, fakat publish ayrı bir kullanıcı kararıdır.

## İlk Push Öncesi

```bash
npm run validate
git status --short
git diff --cached
```

Gitleaks varsa:

```bash
gitleaks detect --redact --no-banner --no-git --verbose
```

## GitHub Repo Oluşturma

GitHub CLI ile, açık onaydan sonra:

```bash
gh repo create codex-enterprise-starter --public --source . --remote origin
git push -u origin main
```

Manuel remote:

```bash
git remote add origin https://github.com/<owner>/codex-enterprise-starter.git
git push -u origin main
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
