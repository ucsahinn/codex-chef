# Skill'ler, Plugin'ler ve Uzman Ajanlar

## Skill'ler

Skill'ler tekrar kullanılabilir iş akışlarıdır. Codex bir skill'i seçene kadar
tam talimatları yüklemez; bu yüzden açıklamalar net, kısa ve tetiklenme koşulu
öne alınmış olmalıdır.

Resmi kaynak: https://developers.openai.com/codex/skills

Routing kurali:

- Kullanici `$skill` veya skill adini acikca yazarsa o secim onceliklidir.
- Implicit skill secimi `description` alanindan calisir; tetik kelimelerini
  basa koy, cunku Codex ilk context'te uzun skill listelerini kisaltabilir.
- Non-trivial gorev bir skill ile eslesiyorsa skill kullanimi zorunludur. Ana
  thread ayni isi manuel yapabilir diye ilgili skill atlanmaz.
- Skill secildikten sonra Codex tam `SKILL.md` dosyasini okumali; sonra sadece
  gorev icin gereken reference, template, script veya assetleri yuklemelidir.
- Tekrarlanabilir workflow icin skill kullan. Workflow MCP config, app mapping,
  asset veya lifecycle hook ile dagitilacaksa plugin olarak paketle.

Bu repo şunları içerir:

- `catalog/skills.json`: seçilmiş skill referansları, kategorileri ve varsa
  doğrulanmış public `package` + `skill` kurulum hedefleri.
- `plugins/codex-enterprise-workflows/skills/enterprise-codex-operator`: bu
  kurulumu bakımda tutmak için küçük bir yerel skill.

## Plugin'ler

Bir iş akışı tek bir yerel klasörün ötesinde paylaşılacaksa dağıtım paketi
plugin'dir. Plugin'ler skill, MCP config, app entegrasyonu ve lifecycle
ayarlarını birlikte taşıyabilir.

Resmi kaynak: https://developers.openai.com/codex/plugins

Bu repo şunları içerir:

- `plugins/codex-enterprise-workflows/.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`

Installer yerel marketplace kaydını kurar. Codex'i yeniden başlatıp `/plugins`
ile plugin'i inceleyebilir veya kurabilirsin.

Installer sadece `install: true`, `owner/repo` formatında doğrulanmış `package`
ve eşleşen `skill` adı taşıyan katalog kayıtları için Skills CLI çağırır.
Kullandığı format `npx skills add <package> --skill <skill> --yes --global`
olduğu için düz skill ismi yanlışlıkla Git repository gibi clone edilmeye
çalışılmaz.

## Uzman Ajanlar

Bu starter odaklı ajanlar kaydeder:

- `code_mapper`: büyük değişikliklerden önce read-only proje haritalama.
- `docs_researcher`: güncel doküman, API ve sürüm hassas bilgileri.
- `code_reviewer`: doğruluk, regresyon ve eksik test review geçişi.
- `frontend_verifier`: tarayıcı, screenshot, layout ve etkileşim kontrolleri.
- `security_auditor`: auth, secret, API route, veri erişimi, izin ve abuse-path
  denetimi.
- `test_verifier`: lint, typecheck, test, build ve smoke kanıtı.
- `release_verifier`: Git hijyeni, artifact, secret scan ve publish gate'leri.

Resmi kaynak: https://developers.openai.com/codex/subagents

Routing kurali:

- Subagent kullanimi acik delegasyondur. Kullanici paralel/delege is isterse
  veya aktif global setup task-shape routing'e izin veriyorsa Codex uygun uzman
  ajani bilerek spawn etmelidir.
- Non-trivial is kayitli bir uzmana denk geliyorsa o uzman kullanilir ve sonucu
  kullanmadan once ozetlenir.
- En iyi alanlari gurultulu okuma ve kanit toplama isleridir: kesif, guncel
  docs, review, UI dogrulama, security audit, test/build kaniti ve release
  hazirligi.
- Yazma agirlikli uygulama ana thread'de kalir. Kullanici acikca bolmeyi
  istemediyse birden fazla ajan ayni dosyalari edit etmemelidir.
- Subagent'lar onay, sandbox ve connector auth sinirlarini miras alir. Kullanici
  onayi, credential, destructive action veya dis sistem kontrolunu bypass etmek
  icin kullanilmaz.

Güvenlik notu: subagent'lar onayları, sandbox'ı veya connector auth sınırlarını
atlamaz. En iyi kullanım alanları okuma ağırlıklı keşif, log/test inceleme,
UI doğrulama, güvenlik audit'i ve release öncesi kanıt toplamadır.
