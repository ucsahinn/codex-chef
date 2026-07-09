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
- `npm run build`, `npm run check`, `npm run validate`, `npm run dev` ve
  `npm run codex:status` gibi incelenmis lokal dogrulama script'leri
  auto-approved olur. Rastgele repository-controlled `npm run ...` script'leri
  unmatched kalir; cleanup, deploy, publish, release, migration, dependency ve
  destructive script adlari prompt ister. Cunku package script'leri mevcut repo
  icinden arbitrary shell code calistirabilir.
- `token-safe.config.toml` skill, agent, MCP server, memory, hook veya app
  kapatmadan verbosity, default reasoning, compaction threshold ve tool-output
  boyutunu dusurur.
- Delete, cleanup, prune, uninstall, overwrite, database drop/truncate ve benzer
  destructive işlemler açık kullanıcı onayı ister.

## MCP Sınırları

MCP server'ları shell sandbox dışında tool sağlayabilir. Bu yüzden onları zararsız
dokümantasyon helper'ı gibi değil, güçlü connector boundary'leri gibi ele al.

Bu starter'ın kuralları:

- OpenAI Docs ve Context7 dokümantasyon odaklı default'lardır.
- Playwright ve Chrome DevTools lokal browser verification icindir; varsayilan
  olarak yalniz evidence/navigation tool'lari allowlist edilir. Interaction,
  evaluation, upload ve request-detail tool'lari prompt-gated veya disabled
  kalir.
- Codebase Memory lokal code-intelligence connector olarak paketlenir. Graph
  read/query tool'lari allowlist edilir; indexing ve destructive/admin graph
  tool'lari lokal graph state yazdigi icin prompt-gated veya disabled kalir.
- GitHub, Figma, Linear, Notion, Sentry, Vercel ve Supabase kullanıcı bilinçli
  olarak açana kadar disabled kalır.
- Token değerleri repo dosyalarından değil environment variable'lardan gelmelidir.
- External write-capable tool'lar prompt approval kullanmalıdır.
- Incelenmis dokumantasyon ve reasoning MCP tool'lari
  `default_tools_approval_mode = "approve"` kullanabilir. Browser,
  semantic-code ve codebase-graph MCP server'lari
  `default_tools_approval_mode = "prompt"` ile calisir; evidence, navigation ve
  read-only graph query tool'lari `enabled_tools` allowlist'iyle acilir.
  Browser request/response detail, browser interaction, symbol edit, graph
  indexing, memory write, filesystem, account, database, production, deploy,
  publish ve mutating tool'lar `"prompt"` kullanmali ya da disabled kalmalidir.
- Browser network listing lokal QA icin approved olabilir; fakat Playwright
  `browser_network_request` ve Chrome DevTools `get_network_request` gibi
  request/response detail tool'lari prompt ister. Bu tool'lar header, cookie
  veya response body gibi hassas icerik gosterebilir.
- Apps/connectors icin ayri bir `[apps._default]` kapisi vardir:
  `enabled = false`, `destructive_enabled = false` ve
  `open_world_enabled = false` incelenmis template'lerin parcasidir.
- Yeni MCP server eklerken `enabled_tools`, `disabled_tools`,
  `startup_timeout_sec` ve `tool_timeout_sec` gibi dar config flag'leri prose-only
  talimatlara tercih edilmelidir.
- `.codebase-memory/` gibi generated code-intelligence graph state source
  control disinda kalir; ancak private workflow icin acik review edilirse
  kaynak materyal sayilabilir.
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
Catalog bu alanlari `auto` olarak isaretlediginde agent role template'leri
agent bazli `model` ve `model_reasoning_effort` pinlemez. Boylece aktif profil
ve Codex runtime, role boundary ve approval gate'lerini zayiflatmadan uygun
model/effort dengesini secebilir.

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

Installer'lar yalniz `codex-chef-workflows` marketplace kaydini upsert eder.
Tum marketplace dosyasini bastan yazmaz; mevcut marketplace dosyasi invalid,
okunamaz veya JSON object degilse fail-closed davranir.

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

## Update Modu

`npm run chef -- --update` managed/global dosyalari degistirmez; `--no-log`
yoksa normal repo-local CLI loglari yine yazilir. Managed-file install plan ve
installer dry-run yolunu kullanir; curated global skill kurulumlarini ve
opsiyonel global Git guard'lari disarida birakir. Apply
modu once clean Git worktree ister, sonra `git pull --ff-only` calistirir. Yeni commit cekilirse
updated tree uzerinden fresh preview basar ve durur. Repo zaten guncelse
managed refresh oncesi lokal validation calistirir, sonra scoped managed Codex
Chef dosyalarini backup alan installer uzerinden yeniler. Bu refresh, managed
Codex Chef plugin dizini dahil scoped managed hedefleri backup alip replace
edebilir. Publish, unscoped cleanup, curated global skill kurma, opsiyonel
global Git guard kurma, user skill silme, credential rotate veya
account/database/broad-filesystem connector enable etmez.

## Backup Inventory Ve Restore

`npm run chef -- --backups`, aktif Codex home altindaki backup archive'larini
global/user state degistirmeden listeler. `npm run chef -- --backups --backup
<id>` backup archive metadata'sini inceler: path, size, hash, manifest durumu,
issue ve restorable target bilgisi. File content basmaz.

Restore backup archive'larini untrusted input kabul eder. `npm run chef --
--backups --backup <id> --restore` preview'dir. Apply path'i `--apply` ister,
once mevcut target'larin fresh rollback backup'ini olusturur, unsafe archive
path'lerini ve symlink'leri reddeder, yalniz aktif Codex veya Agents home
altindaki bilinen Codex Chef managed dosyalarini restore eder. Backup archive
cleanup ve delete otomatik degildir; manuel ve review edilmis operator aksiyonu
olarak kalir.

## Rules

`templates/codex/rules/default.rules` hizli read-only discovery ve
project-native verification komutlarina izin verir. Reviewed allowlist granular
validator'lari, release-note check'lerini, skill/runtime verification'i, package
dry-run'lari, read-only Codex diagnostics'i, CI run watch'i ve read-only git
object inspection'i kapsar. Sunlari prompt'a baglar:
- destructive file operations
- deletion, cleanup, pruning, overwrite ve uninstall
- broad shell wrapper'ları
- dependency installation
- global skill installation
- package publishing
- GitHub API operations; credential material basabilen auth status/token komutlari dahil
- reviewed lokal verification allowlist disindaki rastgele repository-controlled
  `npm run ...` script execution
- broad `git config` value-dump komutlari ve raw, unredacted `gitleaks dir`
- git commit, push, reset, checkout ve restore
- repair apply ve managed plugin pruning
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
