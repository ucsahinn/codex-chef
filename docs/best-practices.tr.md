# Senior Codex Best Practices

Bu rehber, ilk kurulumdan sonra bu starter reposunun kalitesini korumak icin
standart isletim modelidir. Resmi Codex yuzey modelini, bu reponun lokal
dogrulama gate'lerini ve bizim diger prompt-engineering / best-practice
repolarindan gelen pratikleri birlestirir.

Yeni skill, MCP, ajan, profil, hook, installer secenegi veya public dokuman
eklerken burayi kullan.

## Hizli Basla

| Hedef | Kullan |
| --- | --- |
| Tum starter'i kur | `./scripts/install.sh --all --force` veya `.\scripts\install.ps1 -All -Force` |
| Neyin nereye ait oldugunu anla | Asagidaki yuzey haritasi ve [docs/codex-surfaces.tr.md](codex-surfaces.tr.md) |
| Tekrar kullanilabilir workflow ekle | Once skill; bundle olarak dagitilacaksa plugin |
| Canli dis baglam ekle | Auth gerekiyorsa varsayilan disabled MCP veya connector |
| Mekanik zorunluluk ekle | Sadece prose degil; hook veya validation script |
| Push ya da release hazirla | [docs/verification.tr.md](verification.tr.md), sonra release gate |

## Kaynak Kalitesi

Kaynak sirasi:

1. Guncel resmi Codex dokumantasyonu veya fetch edilmis Codex manual.
2. Repo kaniti: scriptler, template'ler, kataloglar, CI ve installer ciktisi.
3. Ayni paketleme veya prompt mimarisi problemini cozmus yakin yerel repolar.
4. Dis makaleler sadece genel muhendislik baglami icindir; Codex urun davranisi
   icin otorite degildir.

Bir iddia kurulum davranisini, guvenlik durusunu, connector erisimini veya
release akislarini degistiriyorsa repo seviyesinde dogrulama adimi gerekir.

## Yuzey Haritasi

| Ihtiyac | Nereye konur |
| --- | --- |
| Tek seferlik gorev kisiti | Mevcut prompt |
| Kalici repo konvansiyonu | `AGENTS.md` |
| Kisisel/global Codex varsayilani | `~/.codex/AGENTS.md` veya global config |
| Proje sandbox, model, MCP, profil, hook veya tool varsayilani | `templates/codex/config.*.toml` |
| Tekrar kullanilabilir gorev workflow'u | `SKILL.md`, opsiyonel script, reference ve asset iceren skill |
| Kurulabilir bundle | `.codex-plugin/plugin.json` iceren plugin |
| Canli private veya harici veri | MCP server veya app connector |
| Deterministik lifecycle kontrolu | Hook, validation script veya CI workflow |
| Push, release, package veya deploy kaniti | Verification docs, changelog ve release gate ciktisi |

Her davranisi `AGENTS.md` icine zorla koyma. Kural mekanik enforcement
gerektiriyorsa script veya hook yap. Workflow tekrar kullanilabilir baglam
gerektiriyorsa skill yap. Tool veya dagitim gerekiyorsa plugin olarak paketle.

## Senior Calisma Dongusu

1. Dosya degistirmeden once gercek repo durumunu incele.
2. Genis uygulama oncesi bilinmeyen alanlari haritala.
3. Guncel API ve urun davranisini resmi veya birincil kaynaklardan dogrula.
4. Kok problemi cozen en kucuk tutarli degisikligi uygula.
5. Once en dar anlamli kontrolu, sonra risk buyudukce genis gate'leri calistir.
6. Diff'i secret, lokal state, uretilmis artifact ve alakasiz churn icin incele.
7. Commit, push, publish, deploy veya tag sadece kullanici acikca istediyse yap.

## Skill Ve Package Kurallari

- `catalog/skills.json` istek listesi degildir. Kurulabilir kayitlar bilinen
  package/skill ciftleri olmalidir.
- Her kurulabilir skill `package`, `skill` ve `source = package@skill` tanimlar.
- Installer `npx skills add <package> --skill <skill> --yes --global` cagirir.
- Varsayilan kontroller offline ve deterministik kalir. Network kontrolleri
  aciktir: `npm run verify:skills:online`.
- Zaten lokal olan veya public package'tan guvenle kurulamayan skill'ler
  `install: false` kalmali ve nedeni yazmalidir.

## Dogrulama Gate'i

Bir maintainer baska kullaniciya setup hazir demeden once:

```bash
npm run check
git status --short
git diff --cached --check
gitleaks detect --redact --no-banner --no-git --verbose
```

Kurulabilir skill kaynaklari degismeden once:

```bash
npm run verify:skills
npm run verify:skills:online
```

`verify:skills` offline ve CI icin guvenlidir. `verify:skills:online`, Skills
CLI'a her kurulabilir package/skill ciftini cozdurur; boylece yalniz skill adini
repo sanip clone etmeye calisan hatalar tekrar etmez.

## Public-Safe Kurallar

- Token, auth dosyasi, cookie, private key, memory, session, makineye ozel path,
  lokal trust state, installer, arsiv veya build output yayinlama.
- Authenticated MCP'ler varsayilan disabled kalir.
- Repo bilerek npm paketi yapilmadikca `package.json` private kalir.
- Public dokumanlar bunun resmi OpenAI urunu degil community starter oldugunu
  soylemelidir.
- Ingilizce ve Turkce docs esli kalir.

## UI Ve Frontend Kalitesi

Gorev website, app, dashboard, gorsel asset veya screenshot iceriyorsa:

- Once mevcut icerigi ve markayi koru; yeni copy eklemeden once hiyerarsi,
  bosluk, responsive davranis, state'ler ve donus netligini iyilestir.
- Mumkunse gercek browser veya screenshot destekli akista dogrula.
- Mobil genislik, uzun metin, focus state, loading/empty/error state ve console
  hatalarini kontrol et.
- Motion amacli olsun: kisa transform/opacity gecisleri, reduced-motion fallback
  ve bloklayan dekoratif animasyon yok.

## Bakim Kontrol Listesi

- Yeni docs Ingilizce ve Turkce eslidir.
- README ilk ekrani dogru isletim dokumanlarina link verir.
- Yeni katalog kayitlari sadece elle degil script ile dogrulanir.
- Installer davranisi gecici `CODEX_HOME` ve `AGENTS_HOME` ile smoke-test edilir.
- Changelog kullaniciyi etkileyen degisiklikleri kaydeder.
- Stage oncesi git status incelenir, sadece niyetli dosyalar stage edilir.
