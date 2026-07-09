# Runtime Doğrulaması

Bu makaleyi install, repair veya release candidate guncellemesi sonrasinda
kullan. Hedef, repodaki dosyalarla kurulu Codex runtime'in uyumlu oldugunu
private local state sizdirmadan kanitlamaktir.

## Hızlı Kontroller

```bash
npm run validate
npm run codex:doctor
npm run codex:status
```

Daha sert installed-runtime kontrolu:

```bash
npm run verify:install:runtime -- --expect-skills --expect-git-guards
npm run codex:status:all -- --plain --no-log
```

Repo-local diagnostic log yazılmasın istiyorsan inspection komutlarında
`--no-log` kullan.

## Kanıt Sayılan Çıktılar

- Validator başarıyla çıkar.
- Doctor/status output managed file, profile, agent, skill, MCP default ve Git
  guard beklentilerini net raporlar.
- Eksik managed file, stale plugin, MCP drift, skill drift veya Git guard drift
  gizli warning degil, failure olarak gorunur.
- Redacted output local username, auth file, token, session state, memory icerigi
  veya private path sizdirmaz.

## Yaygın Hata Kararları

| Belirti | Karar |
| --- | --- |
| Validator docs veya package surface uzerinde fail ediyor | Install ya da release isinden önce repoyu düzelt. |
| Runtime verifier managed-file drift raporluyor | Apply etmeden önce repair preview çalıştır. |
| MCP catalog mismatch gorunuyor | `catalog/mcp-servers.json` ile iki Codex config template'ini karsilastir. |
| Online skill source check fail ediyor | Kaynak erişilene veya bilinçli güncellenene kadar release'i lokal tut. |
| Gitleaks gerçek secret buluyor | Önce rotate veya revoke et, sonra cleanup planla. |

## İlgili Dokümanlar

- [Doğrulama rehberi](../docs/verification.tr.md)
- [Beklenen çıktı](../docs/expected-output.tr.md)
- [Lokal audit](../docs/local-audit.tr.md)
- [Security model](../docs/security-model.tr.md)
