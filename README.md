# Gezi Platformu — Veritabanı & Mimari Başlangıcı

Statik Leaflet HTML projesinin (Ankara Gezi Rehberi) dünya ölçeğine taşınan PostgreSQL + PostGIS temeli.
Mevcut HTML dosyaları **değiştirilmedi**; `legacy/` klasörüne koyun.

## Hızlı başlangıç
```bash
cp .env.example .env
make up          # PostGIS 16-3.4 (docker)
make seed        # migration'ları + seed'leri uygular
make psql
```
Yayında (production) yalnızca migration: `DATABASE_URL=postgresql://... ./scripts/migrate.sh`  (seed eklemeyin).
Yönetilen servislerde PostGIS, pg_trgm, unaccent, citext eklentilerinin açılabildiğini doğrulayın (Supabase, Neon, RDS, Cloud SQL desteklir).

## İçerik
| Yol | Açıklama |
|---|---|
| `database/migrations/001–009` | Eklentiler, hiyerarşi, kullanıcılar, places+medya, sosyal, sistem, trigger'lar, PostGIS fonksiyonları, keşif motoru |
| `database/seeds/001–005` | Kategoriler, ülke/şehir/ilçe, Ankara 28 mekan (HTML'den), 6 dünya mekanı, etiketler |
| `docs/` | ER diyagramı, mimari, API tasarımı, klasör yapısı |
| `backend/` `mobile/` `web/` | Boş modül iskeleti (kod henüz yok) |
| `scripts/migrate.sh` | Sıralı + checksum'lı migration çalıştırıcı |

## Doğrulama
Tüm migration ve seed dosyaları PostgreSQL 16 + PostGIS 3.4'te baştan sona çalıştırıldı;
`places_nearby`, `places_in_bounds`, `map_layer_in_bounds` (zoom 2/5/8/12/16), `search_places` (Türkçe karakter toleranslı),
`find_duplicate_places`, `discover_places` ve sayaç trigger'ları test edildi.

## Önemli kurallar
- Konum **yalnızca** `places.location`; `latitude/longitude` generated kolonlardır, yazılamaz.
- Uygulanmış bir migration'ı düzenlemeyin; yeni numaralı dosya ekleyin (`010_...sql`).
- Seed'deki `admin@example.com` kullanıcısı giriş yapamaz (devre dışı hash); gerçek admin'i backend'den oluşturun.
- Ankara dışındaki yer isimleri/koordinatlar örnek amaçlıdır; ilçe atamaları belirsiz olanlarda (`Gençlik Parkı`, `Altınköy`, `Tuz Gölü`) boş bırakıldı — doğrulayıp doldurun.
