# Gezi Platformu — Supabase Kurulum Rehberi

Bu paket, `gezi-platform` şemasını Supabase'e (hosted) uyarlanmış hâliyle ve HTML haritayı Supabase'e bağlı hâliyle içerir.
Hepsi yerel PostgreSQL 16 + PostGIS 3.4'te Supabase rolleri taklit edilerek baştan sona test edildi
(migration'lar, seed, RLS politikaları, trigger'lar, RPC'ler). Gerçek Supabase projenizde henüz çalıştırılmadı — aşağıdaki 5. adım bu yüzden bir doğrulama listesi içeriyor.

## Hızlı yol (CLI gerekmez, ~5 dk)

1. **Proje oluştur:** supabase.com → New project (bölge: Frankfurt / Avrupa). Veritabanı şifresini kaydet.
2. **Şemayı yükle:** Dashboard → *SQL Editor* → New query → `supabase/setup_all.sql` içeriğini yapıştır → Run.
   (Migration'lar + seed tek dosyada. Hata alırsan hangi dosyada durduğunu `-- =====` başlıklarından görürsün.)
3. **Anahtarları al:** *Project Settings → API* → `Project URL` ve `anon` (veya `publishable`) anahtar.
   `web/index.html` içinde `SUPABASE_URL` ve `SUPABASE_KEY` satırlarına yaz.
   > `service_role` / `secret` anahtarını asla HTML'e koyma.
4. **Test et:** `web/index.html`'i tarayıcıda aç. Alt bilgide `34 mekan · Supabase` yazmalı.
   (`gömülü örnek veri` yazıyorsa bağlantı kurulamamıştır; tarayıcı konsolundaki hataya bak.)
5. **Doğrulama listesi (SQL Editor):**
   ```sql
   select count(*) from places;                       -- 34
   select get_mvp_snapshot()->'generated_at';          -- tarih döner
   select * from places_in_bounds(25,35,45,45,12);     -- Ankara çevresi mekanlar
   select * from search_places('anitkabir');           -- Türkçe karakter toleranslı
   ```
   *Database → Advisors → Security* sekmesinde "RLS disabled" uyarısı **olmamalı**.

## İlk admin kullanıcısı
Seed'de sahte admin yok (Supabase Auth ile çakışırdı). Authentication → Users → *Add user* ile kendi hesabını aç, sonra:
```sql
update public.users set role = 'super_admin' where username = 'kullanici_adin';
```
(`public.users` satırı kayıtta otomatik oluşur; kullanıcı adı e-postanın @ öncesinden türetilir.)
Rol değişimi yalnızca SQL Editor / service_role ile yapılabilir; istemciden yapılamaz.

## Zamanlanmış işler (opsiyonel ama önerilir)
Hiyerarşi sayaçları, keşif skorları ve aylık partition'lar periyodik güncellenmeli.
*Database → Extensions → pg_cron* aç, sonra `supabase/cron_optional.sql` dosyasını çalıştır.

## Orijinal şemadan farklar (ve nedenleri)
| Değişiklik | Neden |
|---|---|
| Eklentiler `extensions` şemasında | Supabase önerisi; `spatial_ref_sys` gibi tablolar public API'ye sızmaz |
| `users` tablosu `auth.users`'a bağlandı; `email`, `password_hash`, `auth_provider` kaldırıldı | Kimlik doğrulamayı Supabase Auth yapar. Kayıtta `public.users` + `user_profiles` otomatik oluşur |
| **RLS tüm tablolarda açık** (`010_supabase_security`) | Supabase tabloları anon anahtarla internete açar; RLS olmadan herkes yazabilir |
| Sayaç trigger'ları `SECURITY DEFINER` | Kullanıcı bir yorum/favori eklediğinde `places` sayaçlarını RLS'e takılmadan güncelleyebilsin |
| Partition alt tabloları kilitli | Alt tablolar da API'ye açılır; üst tablonun RLS'i onları korumaz |
| `refresh_*`, `ensure_monthly_partitions` herkese kapalı | Yalnızca cron/service_role çağırır |
| `get_mvp_snapshot()` RPC eklendi | HTML'in beklediği veriyi tek çağrıda döndürür |

## Yetki modeli özeti
- **Herkes (anon):** yayındaki mekanlar, kategoriler, ülke/şehir, onaylı yorum/foto/video okur; arama/aktivite logu **yazar** (okuyamaz).
- **Giriş yapmış kullanıcı:** kendi puan/favori/ziyaret/koleksiyon/öneri/rapor kayıtlarını yönetir; yorum yazar (her zaman `pending` başlar; metni düzenlerse tekrar onaya düşer).
- **moderator / admin:** içerik moderasyonu, mekan ekleme-düzenleme; admin ayrıca referans veriyi yönetir.

## Bilinen sınırlar (MVP)
- `get_mvp_snapshot()` **tüm mekanları** tek seferde çeker. Birkaç yüz mekana kadar uygundur; büyüyünce istemci `map_layer_in_bounds()` / `places_in_bounds()` çağıracak şekilde değişmeli (mimari doküman bu şekilde tasarlanmış).
- Favoriler hâlâ tarayıcıda (`localStorage`). Giriş ekranı eklenince `favorites` tablosuna taşınır (RLS hazır).
- Fotoğraf yükleme için Storage bucket + politikaları henüz yok (Faz 2).
- Ankara dışındaki mekanlar örnek veridir; `Gençlik Parkı`, `Altınköy`, `Tuz Gölü` ilçe atamaları boş.
- Aktivite/arama logu anon'dan doğrudan yazılabilir; trafik büyürse Edge Function + rate limit arkasına alın.

## CLI ile (sonraki adım, sürümlü çalışma için)
```bash
supabase login && supabase init          # config.toml üretir (supabase/ klasörü zaten var, migrations'ı korur)
supabase link --project-ref <ref>
supabase db push                         # supabase/migrations/* uygular
```
Seed'i üretimde çalıştırmayın; ihtiyaç halinde `supabase/seed.sql`'i SQL Editor'den bir kez çalıştırın.
Uygulanmış bir migration'ı düzenlemeyin, yeni bir dosya ekleyin.
