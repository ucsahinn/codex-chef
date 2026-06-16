# Güvenlik Modeli

Bu setup, Codex'i güçlendirirken temel Codex güvenlik modelini zayıflatmamak
için tasarlandı.

## Varsayılanlar

- `sandbox_mode = "workspace-write"` yazma erişimini varsayılan olarak workspace
  içinde tutar.
- `approval_policy = "on-request"` yetki yükseltmelerini interaktif bırakır.
- Workspace-write sandbox içinde network erişimi kapalı kalır.
- `shell_environment_policy`, `inherit = "core"` kullanır ve default secret
  exclusion'ları açık tutar. Böylece subprocess'ler geniş lokal token
  environment'ını varsayılan olarak devralmaz.
- Auth isteyen remote connector'lar disabled örnekler olarak bulunur.
- App/connector default'lari, review edilmis app-specific override yoksa
  destructive ve open-world tool'lari kapali tutar.
- Global command rule'ları dar kapsamlıdır ve read-only discovery ile lokal
  verification komutlarına ağırlık verir.
- Delete, cleanup, prune, uninstall, overwrite, database drop/truncate ve benzer
  destructive işlemler açık kullanıcı onayı ister.

## MCP Sınırları

MCP server'ları shell sandbox dışında tool sağlayabilir. Bu yüzden onları zararsız
dokümantasyon helper'ı gibi değil, güçlü connector boundary'leri gibi ele al.

Bu starter'ın kuralları:

- OpenAI Docs ve Context7 dokümantasyon odaklı default'lardır.
- Playwright ve Chrome DevTools lokal browser verification içindir.
- GitHub, Figma, Linear, Notion, Sentry, Vercel ve Supabase kullanıcı bilinçli
  olarak açana kadar disabled kalır.
- Token değerleri repo dosyalarından değil environment variable'lardan gelmelidir.
- External write-capable tool'lar prompt approval kullanmalıdır.
- Read-only documentation MCP'leri `default_tools_approval_mode = "approve"`
  kullanabilir; browser, account, filesystem, database, production ve mutating
  tool'lar `"prompt"` kullanmalıdır.
- Apps/connectors icin ayri bir `[apps._default]` kapisi vardir:
  `destructive_enabled = false` ve `open_world_enabled = false` incelenmis
  template'lerin parcasidir.
- Yeni MCP server eklerken `enabled_tools`, `disabled_tools`,
  `startup_timeout_sec` ve `tool_timeout_sec` gibi dar config flag'leri prose-only
  talimatlara tercih edilmelidir.
- `catalog/mcp-servers.json` her starter connector icin source URL, auth mode,
  setup kind, setup hint, risk, approval mode ve default-enable gerekcesi tutar.
  Installer ve `npm run codex:status` setup gereksinimlerini credential
  toplamadan gosterir.

Resmi kaynak: https://developers.openai.com/codex/mcp

## Skill Kaynakları

Installable skill'ler hem `catalog/skills.json` hem de
`catalog/skills-lock.json` içinde temsil edilmelidir. Lock dosyası installer'ın
kullandığı exact package/skill çiftini ve install command'ı kaydeder. Bu dosya
degistirilemez upstream commit lock'u degil, incelenmis kaynak allowlist'idir;
cunku mevcut Skills CLI kurulum akisi owner/repo + skill adi cozer. Default
gate bunu offline kontrol eder; maintainer publish hazirliginda veya skill
kaynaklari degistiginde `npm run verify:skills:online` ile network-backed
resolution calistirir.

Default command approval rule'lari global skill kurulumunu auto-allow yapmaz.
Read-only Skills CLI discovery allowlist'e alinabilir, fakat `skills add` ve
genis Skills CLI cagrilari agent instruction supply chain'i degistirdigi icin
prompt ister.

## Uzman Ajan Sinirlari

Uzman ajanlar `catalog/agents.json` icinde izlenir ve hem Codex config
template'leriyle hem de `templates/codex/agents/` altindaki role TOML
dosyalariyla dogrulanir.

Agent template'leri `danger-full-access`, `approval_policy = "never"` veya
gomulu token environment variable adlari kullanmamalidir. Read-only uzmanlar
read-only kalir; verifier/release rolleri sadece smoke-test output gibi lokal
kanitlar icin `workspace-write` kullanabilir.

## Install Planlama ve Çakışma Politikası

`manifests/install-plan.json` installer'ın yönettiği her dosya, directory, Git
guard, profile ve skill operation'ını listeler. `npm run plan:install` bu
manifestten sadece okunabilir bir plan üretir; kullanıcı-global Codex, Agents
veya Git dosyalarına yazmaz.

Plan çıktısında her operation için target path, collision policy, backup
beklentisi, platform ve risk seviyesi görünür. High-risk operation'lar explicit
flag ister; örneğin Git guard'ları `--install-git-guards`, skill kurulumu
`--install-skills` olmadan gerçek kurulum kapsamına girmez.

Bu yaklaşım external starter'lardan gelen iyi manifest/plan fikirlerini alır,
ama geniş global sync, otomatik dependency install, auth connector enable etme
veya kullanıcı dosyalarını sessizce overwrite etme davranışlarını dışarıda
bırakır.
`scripts/validate-install-plan.mjs` hedefleri yalniz review edilmis Codex,
Agents ve opsiyonel Git-guard alanlarinda tutar; `.claude`, `.cursor`,
`.opencode`, `.zed` ve `.vscode` gibi komsu harness home path'leri install
yuzeyine sessizce giremez.

## Repair Modu

`scripts/repair-install.mjs`, zaten global Codex setup'i olan kullanicilar icin
repair/reconcile yoludur. `--apply` olmadan read-only calisir ve managed drift,
eksik config bloklari, marketplace drift'i, managed plugin icindeki ekstra
dosyalar, curated olmayan skill'ler ve duplicate skill adlarini raporlar.
`--apply` ile sadece Codex Chef'in yonettigi dosyalari backup alip onarir, eksik
config bloklarini merge eder ve baska marketplace plugin'lerini koruyarak Codex
Chef marketplace kaydini yeniler.

Repair modu user skill'lerini silmez. Ekstra global skill'ler ve duplicate skill
adlari cleanup adayi olarak raporlanir; cunku Codex'in initial skill-list
butcesini sisirebilirler ama kullanici tarafindan bilerek kurulmus olabilirler.
Managed Codex Chef plugin dizini icindeki ekstra dosyalari silmek icin ayrica
`--prune-managed-plugin-extras` flag'i gerekir; bu islem de backup sonrasi
yalnizca tek managed plugin hedefiyle sinirli kalir.

## Rules

`templates/codex/rules/default.rules` hızlı read-only discovery ve project-native
verification komutlarına izin verir. Şunları prompt'a bağlar:

- destructive file operations
- deletion, cleanup, pruning, overwrite ve uninstall
- broad shell wrapper'ları
- dependency installation
- global skill installation
- package publishing
- GitHub API operations
- git commit, push, reset, checkout ve restore
- exact allowlist dışındaki ad-hoc `npx` package execution

Resmi kaynak: https://developers.openai.com/codex/rules

## Hooks

Hooks lifecycle check için faydalıdır ama primary security boundary değildir.
Non-managed hook'lar çalışmadan önce kullanıcı tarafından review ve trust
edilmelidir.

Bu starter ECC-style lifecycle hook runtime'larini, otomatik `SessionStart`
context injection'i veya `hookSpecificOutput.additionalContext` desenlerini
import etmez. Bu yuzeyler templates veya plugins altinda acik review olmadan
gorunurse `scripts/security-audit.mjs` fail eder.
Hook runtime'lari root hook klasorleri, nested `hooks/` path'leri,
`scripts/hooks`, `.cursor/hooks`, `.kiro/hooks`, `.opencode` hook plugin'leri,
templates veya plugin bundle'lari uzerinden gelirse de acik review olmadan
reddedilir.

Plugin manifest'leri de varsayilan olarak dar tutulur. Repo validation,
plugin-bundled `hooks`, `mcpServers`, `apps`, `Write` capability ve `NONE`
disinda marketplace authentication modlarini reddeder.

Resmi kaynak: https://developers.openai.com/codex/hooks

## Git Hijyeni

Global Git guard'ları opsiyoneldir çünkü kullanıcının global Git default'larını
değiştirir. Kurulursa:

- bariz local secret ve build-output path'lerini ignore eder
- Gitleaks varsa çalıştırır
- `.env`, `.pem`, `.key`, `.pfx` gibi staged secret dosyalarını engeller

Repo `.gitleaks.toml` dosyası default Gitleaks kurallarını extend eder ve
yalnızca `tmp/`, `node_modules/`, `dist/`, `.next/` gibi local scratch,
dependency, build ve cache dizinlerini dışarıda bırakır.

Hook konservatiftir ve dosya silmez.

Security validation, ignored scratch, dependency, build, coverage veya release
output dizinleri altinda tracked source dosyasi gorurse fail eder.

## Asla Eklenmemesi Gerekenler

- Codex sessions veya memories
- `.env` dosyaları
- private key veya signing material
- auth files, cookies, token caches
- local database dump'ları
- installers ve release archive'ları
- generated screenshots, logs, reports ve build output

## External Account Actions

Repo GitHub, Supabase, Vercel veya Sentry için güvenli setup dokümante edebilir,
ama account-level aksiyonları otomatik yapmamalıdır. Repository protection açmak,
key rotate etmek, billing değiştirmek, deploy etmek veya publish yapmak ayrı
kullanıcı onayı ve account context'i gerektirir.
