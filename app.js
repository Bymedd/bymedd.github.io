/**
 * Türkiye Şehirleri Gezi Rehberi & İnteraktif Canlı Şehir Portalı
 * - Ultra Hızlı Performans (Sıfır kasma, GPU hızlandırmalı)
 * - 81 İl İsimleri ve Büyüklüğe Göre Punto Sistemi
 * - Mouse ile Üzerine Gelindiğinde Anında Şehir Sayfasına Geçiş
 * - Not Defteri & Ziyaretçi Skoru
 */

(function () {
    'use strict';

    // State
    const AppState = {
        currentProvince: null,
        selectedIstanbulSide: 'all', // 'all', 'avrupa', 'asya'
        isPinned: false, // Şehir sabitlendi mi?
        reliefMode: true,
        activeRegionFilter: 'all',
        visitedCities: JSON.parse(localStorage.getItem('turkey_visited_cities') || '[]'),
        wishlistCities: JSON.parse(localStorage.getItem('turkey_wishlist_cities') || '[]')
    };

    // DOM Elementleri
    const elements = {
        mapStage: document.getElementById('mapStage'),
        svgMap: document.getElementById('svg-turkiye-haritasi'),
        liveCitySection: document.getElementById('liveCitySection'),
        
        // Canlı Şehir Paneli Alanları
        livePlate: document.getElementById('livePlate'),
        liveName: document.getElementById('liveName'),
        liveTagline: document.getElementById('liveTagline'),
        liveRegion: document.getElementById('liveRegion'),
        liveDesc: document.getElementById('liveDesc'),
        livePopulation: document.getElementById('livePopulation'),
        liveAltitude: document.getElementById('liveAltitude'),
        liveAreaCode: document.getElementById('liveAreaCode'),
        liveBestTime: document.getElementById('liveBestTime'),
        liveHighlightsList: document.getElementById('liveHighlightsList'),
        liveFoodsList: document.getElementById('liveFoodsList'),
        liveNoteTextarea: document.getElementById('liveNoteTextarea'),
        liveSaveNoteBtn: document.getElementById('liveSaveNoteBtn'),
        liveNoteStatus: document.getElementById('liveNoteStatus'),
        pinCityBtn: document.getElementById('pinCityBtn'),
        pinText: document.getElementById('pinText'),
        liveVisitedBtn: document.getElementById('liveVisitedBtn'),
        liveWishlistBtn: document.getElementById('liveWishlistBtn'),
        adanaGuideSection: document.getElementById('adanaGuideSection'),
        amasyaGuideSection: document.getElementById('amasyaGuideSection'),
        antalyaGuideSection: document.getElementById('antalyaGuideSection'),
        aydinGuideSection: document.getElementById('aydinGuideSection'),
        izmirGuideSection: document.getElementById('izmirGuideSection'),
        afyonkarahisarGuideSection: document.getElementById('afyonkarahisarGuideSection'),
        adiyamanGuideSection: document.getElementById('adiyamanGuideSection'),
        agriGuideSection: document.getElementById('agriGuideSection'),
        aksarayGuideSection: document.getElementById('aksarayGuideSection'),
        ardahanGuideSection: document.getElementById('ardahanGuideSection'),
        artvinGuideSection: document.getElementById('artvinGuideSection'),
        denizliGuideSection: document.getElementById('denizliGuideSection'),
        kutahyaGuideSection: document.getElementById('kutahyaGuideSection'),
        manisaGuideSection: document.getElementById('manisaGuideSection'),
        muglaGuideSection: document.getElementById('muglaGuideSection'),
        usakGuideSection: document.getElementById('usakGuideSection'),
        balikesirGuideSection: document.getElementById('balikesirGuideSection'),
        bartinGuideSection: document.getElementById('bartinGuideSection'),
        batmanGuideSection: document.getElementById('batmanGuideSection'),
        bayburtGuideSection: document.getElementById('bayburtGuideSection'),
        bilecikGuideSection: document.getElementById('bilecikGuideSection'),
        bingolGuideSection: document.getElementById('bingolGuideSection'),
        bitlisGuideSection: document.getElementById('bitlisGuideSection'),
        boluGuideSection: document.getElementById('boluGuideSection'),
        burdurGuideSection: document.getElementById('burdurGuideSection'),
        bursaGuideSection: document.getElementById('bursaGuideSection'),
        canakkaleGuideSection: document.getElementById('canakkaleGuideSection'),
        cankiriGuideSection: document.getElementById('cankiriGuideSection'),
        corumGuideSection: document.getElementById('corumGuideSection'),
        duzceGuideSection: document.getElementById('duzceGuideSection'),
        edirneGuideSection: document.getElementById('edirneGuideSection'),
        elazigGuideSection: document.getElementById('elazigGuideSection'),
        erzincanGuideSection: document.getElementById('erzincanGuideSection'),
        erzurumGuideSection: document.getElementById('erzurumGuideSection'),
        eskisehirGuideSection: document.getElementById('eskisehirGuideSection'),
        gaziantepGuideSection: document.getElementById('gaziantepGuideSection'),
        giresunGuideSection: document.getElementById('giresunGuideSection'),
        gumushaneGuideSection: document.getElementById('gumushaneGuideSection'),
        hakkariGuideSection: document.getElementById('hakkariGuideSection'),
        hatayGuideSection: document.getElementById('hatayGuideSection'),
        ispartaGuideSection: document.getElementById('ispartaGuideSection'),
        istanbulGuideSection: document.getElementById('istanbulGuideSection'),
        malatyaGuideSection: document.getElementById('malatyaGuideSection'),
        mardinGuideSection: document.getElementById('mardinGuideSection'),
        mersinGuideSection: document.getElementById('mersinGuideSection'),
        musGuideSection: document.getElementById('musGuideSection'),
        karabukGuideSection: document.getElementById('karabukGuideSection'),
        karamanGuideSection: document.getElementById('karamanGuideSection'),
        karsGuideSection: document.getElementById('karsGuideSection'),
        kastamonuGuideSection: document.getElementById('kastamonuGuideSection'),
        kayseriGuideSection: document.getElementById('kayseriGuideSection'),
        kirikkaleGuideSection: document.getElementById('kirikkaleGuideSection'),
        kirklareliGuideSection: document.getElementById('kirklareliGuideSection'),
        kirsehirGuideSection: document.getElementById('kirsehirGuideSection'),
        kilisGuideSection: document.getElementById('kilisGuideSection'),
        kocaeliGuideSection: document.getElementById('kocaeliGuideSection'),
        konyaGuideSection: document.getElementById('konyaGuideSection'),
        nevsehirGuideSection: document.getElementById('nevsehirGuideSection'),
        nigdeGuideSection: document.getElementById('nigdeGuideSection'),
        orduGuideSection: document.getElementById('orduGuideSection'),
        rizeGuideSection: document.getElementById('rizeGuideSection'),
        sakaryaGuideSection: document.getElementById('sakaryaGuideSection'),
        samsunGuideSection: document.getElementById('samsunGuideSection'),
        siirtGuideSection: document.getElementById('siirtGuideSection'),
        sinopGuideSection: document.getElementById('sinopGuideSection'),
        sivasGuideSection: document.getElementById('sivasGuideSection'),
        sanliurfaGuideSection: document.getElementById('sanliurfaGuideSection'),
        diyarbakirGuideSection: document.getElementById('diyarbakirGuideSection'),
        igdirGuideSection: document.getElementById('igdirGuideSection'),
        kahramanmarasGuideSection: document.getElementById('kahramanmarasGuideSection'),
        osmaniyeGuideSection: document.getElementById('osmaniyeGuideSection'),
        tekirdagGuideSection: document.getElementById('tekirdagGuideSection'),
        tokatGuideSection: document.getElementById('tokatGuideSection'),
        trabzonGuideSection: document.getElementById('trabzonGuideSection'),
        tunceliGuideSection: document.getElementById('tunceliGuideSection'),
        vanGuideSection: document.getElementById('vanGuideSection'),
        yozgatGuideSection: document.getElementById('yozgatGuideSection'),
        zonguldakGuideSection: document.getElementById('zonguldakGuideSection'),
        sirnakGuideSection: document.getElementById('sirnakGuideSection'),
        yalovaGuideSection: document.getElementById('yalovaGuideSection'),
        ankaraGuideSection: document.getElementById('ankaraGuideSection'),
        ankaraSearchInput: document.getElementById('ankaraSearchInput'),
        ankaraFilterPills: document.getElementById('ankaraFilterPills'),
        
        // İstanbul Özel Yakalar Paneli
        istanbulSidesBar: document.getElementById('istanbulSidesBar'),
        sideTabAll: document.getElementById('sideTabAll'),
        sideTabAvrupa: document.getElementById('sideTabAvrupa'),
        sideTabAsya: document.getElementById('sideTabAsya'),
        sideDistrictsBox: document.getElementById('sideDistrictsBox'),
        sideDistrictsList: document.getElementById('sideDistrictsList'),
        
        // Üst Kontroller
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        reliefToggleBtn: document.getElementById('reliefToggleBtn'),
        searchInput: document.getElementById('searchInput'),
        searchResults: document.getElementById('searchResults'),
        visitedCountText: document.getElementById('visitedCountText'),
        regionPillsContainer: document.getElementById('regionPillsContainer')
    };

    // =========================================================================
    // 1. HARİTA İLLERİNİN VE İSİM ETİKETLERİNİN OLUŞTURULMASI
    // =========================================================================
    function initMap() {
        const svg = document.getElementById('svg-turkiye-haritasi');
        if (!svg) return;

        // İl Gruplarını Al (İstanbul'un alt grupları istanbul-avrupa ve istanbul-asya dahil)
        const provinceGroups = svg.querySelectorAll('#turkiye > g:not(#istanbul), #istanbul > g');

        // Şehir isimleri için SVG etiket katmanı oluştur
        let labelsGroup = svg.querySelector('#city-labels-group');
        if (!labelsGroup) {
            labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            labelsGroup.setAttribute('id', 'city-labels-group');
            svg.appendChild(labelsGroup);
        } else {
            labelsGroup.innerHTML = '';
        }

        provinceGroups.forEach(group => {
            const plate = group.getAttribute('data-plakakodu');
            const provinceData = PROVINCES_DATA[plate];
            if (!provinceData) return;

            // Bölge Rengini Ata
            const paths = group.querySelectorAll('path');
            paths.forEach(p => {
                p.classList.add(`region-${provinceData.regionId}`);
            });

            // Ziyaret Durumu
            updateProvinceMapStatus(group, provinceData.id);

            // İstanbul yakası tespiti
            const groupId = group.getAttribute('id');
            const side = group.getAttribute('data-side'); // 'asya' veya 'avrupa'

            // Merkez Koordinatını Hesapla (BBox)
            try {
                const bbox = group.getBBox();
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                    let labelCfg = PROVINCE_LABEL_CONFIG[plate];
                    if (groupId === 'istanbul-avrupa') {
                        labelCfg = PROVINCE_LABEL_CONFIG['34-avrupa'] || { label: 'İstanbul', size: 6.2, dx: -3, dy: -3 };
                    } else if (groupId === 'istanbul-asya') {
                        labelCfg = PROVINCE_LABEL_CONFIG['34-asya'] || { label: 'Asya', size: 4.5, dx: 1, dy: 1 };
                    }
                    if (!labelCfg) labelCfg = { label: provinceData.name, size: 6.0 };

                    const cx = bbox.x + bbox.width / 2 + (labelCfg.dx || 0);
                    const cy = bbox.y + bbox.height / 2 + (labelCfg.dy || 0);

                    // Şehir İsmi SVG Metni
                    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    textNode.setAttribute('class', 'city-map-label');
                    textNode.setAttribute('x', cx.toFixed(1));
                    textNode.setAttribute('y', cy.toFixed(1));
                    textNode.setAttribute('font-size', `${labelCfg.size}px`);
                    textNode.setAttribute('data-target-id', groupId || provinceData.id);
                    textNode.textContent = labelCfg.label;

                    labelsGroup.appendChild(textNode);
                }
            } catch (err) {
                // BBox hesabı başarısız olursa atla
            }

            // MOUSE ÜZERİNE GELDİĞİNDE ANINDA ŞEHİR SAYFASINA GEÇİŞ (HOVER-TO-VIEW)
            group.addEventListener('mouseenter', () => {
                if (!AppState.isPinned) {
                    selectCity(provinceData, false, side);
                }
                highlightCityOnMap(group, true);
            });

            group.addEventListener('mouseleave', () => {
                highlightCityOnMap(group, false);
            });

            // TIKLANDIĞINDA: Şehri seç ve detay paneline yumuşak kaydır
            group.addEventListener('click', (e) => {
                e.preventDefault();
                selectCity(provinceData, true, side);
                scrollToCitySection();
            });
        });

        // Başlangıçta 34 İstanbul veya ilk ili seç
        const initialCity = PROVINCES_DATA["34"] || PROVINCES_DATA["06"] || Object.values(PROVINCES_DATA)[0];
        if (initialCity) {
            selectCity(initialCity, false, 'all');
        }
        initAnkaraGuide();
    }

    function highlightCityOnMap(group, isHover) {
        group.classList.toggle('active-hover', isHover);
        const plate = group.getAttribute('data-plakakodu');
        const province = PROVINCES_DATA[plate];
        if (!province) return;

        const groupId = group.getAttribute('id');
        const label = document.querySelector(`.city-map-label[data-target-id="${groupId}"]`) ||
                      document.querySelector(`.city-map-label[data-target-id="${province.id}"]`);
        if (label) {
            label.classList.toggle('active-label', isHover);
        }
    }

    // =========================================================================
    // 2. ŞEHRİ SEÇME VE CANLI ŞEHİR SAYFASINI GÜNCELLEME
    // =========================================================================
    function selectCity(province, updateHash, activeSide) {
        if (!province) return;
        AppState.currentProvince = province;
        const cityGuideSections = {
            '01': elements.adanaGuideSection,
            '05': elements.amasyaGuideSection,
            '07': elements.antalyaGuideSection,
            '09': elements.aydinGuideSection,
            '35': elements.izmirGuideSection,
            '03': elements.afyonkarahisarGuideSection,
            '02': elements.adiyamanGuideSection,
            '04': elements.agriGuideSection,
            '68': elements.aksarayGuideSection,
            '75': elements.ardahanGuideSection,
            '08': elements.artvinGuideSection,
            '20': elements.denizliGuideSection,
            '43': elements.kutahyaGuideSection,
            '45': elements.manisaGuideSection,
            '48': elements.muglaGuideSection,
            '64': elements.usakGuideSection,
            '10': elements.balikesirGuideSection,
            '74': elements.bartinGuideSection,
            '72': elements.batmanGuideSection,
            '69': elements.bayburtGuideSection,
            '11': elements.bilecikGuideSection,
            '12': elements.bingolGuideSection,
            '13': elements.bitlisGuideSection,
            '14': elements.boluGuideSection,
            '15': elements.burdurGuideSection,
            '16': elements.bursaGuideSection,
            '17': elements.canakkaleGuideSection,
            '18': elements.cankiriGuideSection,
            '19': elements.corumGuideSection,
            '81': elements.duzceGuideSection,
            '22': elements.edirneGuideSection,
            '23': elements.elazigGuideSection,
            '24': elements.erzincanGuideSection,
            '25': elements.erzurumGuideSection,
            '26': elements.eskisehirGuideSection,
            '27': elements.gaziantepGuideSection,
            '28': elements.giresunGuideSection,
            '29': elements.gumushaneGuideSection,
            '30': elements.hakkariGuideSection,
            '31': elements.hatayGuideSection,
            '32': elements.ispartaGuideSection,
            '34': elements.istanbulGuideSection,
            '33': elements.mersinGuideSection,
            '44': elements.malatyaGuideSection,
            '47': elements.mardinGuideSection,
            '49': elements.musGuideSection,
            '78': elements.karabukGuideSection,
            '70': elements.karamanGuideSection,
            '36': elements.karsGuideSection,
            '37': elements.kastamonuGuideSection,
            '38': elements.kayseriGuideSection,
            '71': elements.kirikkaleGuideSection,
            '39': elements.kirklareliGuideSection,
            '40': elements.kirsehirGuideSection,
            '79': elements.kilisGuideSection,
            '41': elements.kocaeliGuideSection,
            '42': elements.konyaGuideSection,
            '50': elements.nevsehirGuideSection,
            '51': elements.nigdeGuideSection,
            '52': elements.orduGuideSection,
            '53': elements.rizeGuideSection,
            '54': elements.sakaryaGuideSection,
            '55': elements.samsunGuideSection,
            '56': elements.siirtGuideSection,
            '57': elements.sinopGuideSection,
            '58': elements.sivasGuideSection,
            '63': elements.sanliurfaGuideSection,
            '21': elements.diyarbakirGuideSection,
            '76': elements.igdirGuideSection,
            '46': elements.kahramanmarasGuideSection,
            '80': elements.osmaniyeGuideSection,
            '59': elements.tekirdagGuideSection,
            '60': elements.tokatGuideSection,
            '61': elements.trabzonGuideSection,
            '62': elements.tunceliGuideSection,
            '65': elements.vanGuideSection,
            '66': elements.yozgatGuideSection,
            '67': elements.zonguldakGuideSection,
            '73': elements.sirnakGuideSection,
            '77': elements.yalovaGuideSection
        };
        Object.values(cityGuideSections)
            .filter(Boolean)
            .forEach(section => {
                section.hidden = section !== cityGuideSections[province.plate];
            });

        // URL Hash güncelle (istenirse)
        if (updateHash) {
            window.location.hash = `#/sehir/${province.id}`;
        }

        // Haritada seçili görsel sınıfı
        const svg = document.getElementById('svg-turkiye-haritasi');
        if (svg) {
            svg.querySelectorAll('#turkiye > g:not(#istanbul), #istanbul > g').forEach(g => {
                const isSelected = g.getAttribute('data-plakakodu') === province.plate;
                g.classList.toggle('selected', isSelected);
            });
            const istParent = svg.querySelector('#istanbul');
            if (istParent) {
                istParent.classList.toggle('selected', province.plate === '34');
            }
        }

        // İstanbul özel yaka seçimi mantığı
        if (province.plate === '06') {
            toggleAnkaraGuide(true);
        } else {
            toggleAnkaraGuide(false);
        }

        if (province.plate === '34' && province.sides) {
            if (elements.istanbulSidesBar) {
                elements.istanbulSidesBar.style.display = 'block';
            }
            if (activeSide && (activeSide === 'avrupa' || activeSide === 'asya')) {
                AppState.selectedIstanbulSide = activeSide;
            } else if (!AppState.selectedIstanbulSide) {
                AppState.selectedIstanbulSide = 'all';
            }
            renderIstanbulSide(AppState.selectedIstanbulSide);
        } else {
            if (elements.istanbulSidesBar) {
                elements.istanbulSidesBar.style.display = 'none';
            }
            AppState.selectedIstanbulSide = 'all';
            renderStandardCity(province);
        }

        // Bu Şehre Ait Notu Yükle (Supabase varsa oradan, yoksa localStorage'dan)
        const lsNote = localStorage.getItem(`turkey_note_${province.id}`) || '';
        elements.liveNoteTextarea.value = lsNote;
        elements.liveNoteStatus.textContent = lsNote ? 'Kayıtlı notunuz yüklendi' : 'Henüz not eklenmedi';
        elements.liveNoteStatus.className = 'save-status-msg';

        if (window.GeziSupabase && window.GeziSupabase.isReady()) {
            window.GeziSupabase.getNoteFromSupabase(province.id).then(cloudNote => {
                if (cloudNote !== null && cloudNote !== lsNote) {
                    elements.liveNoteTextarea.value = cloudNote;
                    elements.liveNoteStatus.textContent = '☁️ Buluttan yüklendi';
                    localStorage.setItem(`turkey_note_${province.id}`, cloudNote);
                }
            });
        }

        // Ziyaret Durumu Butonlarını Güncelle
        updateVisitButtons(province.id);
    }

    // İSTANBUL YAKALARINA ÖZEL GÖRÜNÜM (AVRUPA / ASYA / TÜM İSTANBUL)
    function renderIstanbulSide(sideKey) {
        const istData = PROVINCES_DATA["34"];
        if (!istData) return;

        // Sekme butonlarının aktiflik durumunu güncelle
        [elements.sideTabAll, elements.sideTabAvrupa, elements.sideTabAsya].forEach(tab => {
            if (tab) {
                const tabSide = tab.getAttribute('data-side');
                tab.classList.toggle('active', tabSide === sideKey);
            }
        });

        const regionInfo = TURKEY_REGIONS[istData.regionId];
        elements.liveRegion.textContent = regionInfo ? regionInfo.badge : '🌊 Marmara Bölgesi';
        elements.liveAltitude.textContent = istData.altitude;
        elements.liveBestTime.textContent = istData.bestTime;

        if (sideKey === 'avrupa' && istData.sides && istData.sides.avrupa) {
            const side = istData.sides.avrupa;
            elements.livePlate.textContent = '34 • 0212';
            elements.liveName.innerHTML = `${side.sideIcon} ${side.name}`;
            elements.liveTagline.textContent = side.tagline;
            elements.liveDesc.textContent = side.desc;
            elements.liveAreaCode.textContent = side.areaCode;
            elements.livePopulation.textContent = '10.200.000 (Avrupa)';

            // Gezilecek Yerler (12 Nokta)
            renderBulletList(elements.liveHighlightsList, side.highlights, '🏛️');
            // Meşhur Lezzetler (9 Lezzet)
            renderBulletList(elements.liveFoodsList, side.foods, '🍲');
            // Semtler
            renderDistricts(side.keyDistricts);

        } else if (sideKey === 'asya' && istData.sides && istData.sides.asya) {
            const side = istData.sides.asya;
            elements.livePlate.textContent = '34 • 0216';
            elements.liveName.innerHTML = `${side.sideIcon} ${side.name}`;
            elements.liveTagline.textContent = side.tagline;
            elements.liveDesc.textContent = side.desc;
            elements.liveAreaCode.textContent = side.areaCode;
            elements.livePopulation.textContent = '5.700.000 (Anadolu)';

            // Gezilecek Yerler (12 Nokta)
            renderBulletList(elements.liveHighlightsList, side.highlights, '🏛️');
            // Meşhur Lezzetler (8 Lezzet)
            renderBulletList(elements.liveFoodsList, side.foods, '🍲');
            // Semtler
            renderDistricts(side.keyDistricts);

        } else {
            // Tüm İstanbul (Genel Bakış)
            elements.livePlate.textContent = '34';
            elements.liveName.innerHTML = `🌍 İstanbul (İki Kıta)`;
            elements.liveTagline.textContent = istData.tagline;
            elements.liveDesc.textContent = istData.desc;
            elements.liveAreaCode.textContent = `0${istData.areaCode}`;
            elements.livePopulation.textContent = istData.population;

            renderBulletList(elements.liveHighlightsList, istData.highlights, '🏛️');
            renderBulletList(elements.liveFoodsList, istData.foods, '🍲');

            const combinedDistricts = ["Sultanahmet", "Galata / Beyoğlu", "Beşiktaş", "Kadıköy / Moda", "Üsküdar", "Kuzguncuk", "Ortaköy", "Adalar"];
            renderDistricts(combinedDistricts);
        }
    }

    // STANDART İL GÖRÜNÜMÜ (DİĞER 80 İL)
    function renderStandardCity(province) {
        elements.livePlate.textContent = province.plate;
        elements.liveName.textContent = province.name;
        elements.liveTagline.textContent = province.tagline;
        elements.liveDesc.textContent = province.desc;

        const regionInfo = TURKEY_REGIONS[province.regionId];
        elements.liveRegion.textContent = regionInfo ? regionInfo.badge : province.regionId;

        elements.livePopulation.textContent = province.population;
        elements.liveAltitude.textContent = province.altitude;
        elements.liveAreaCode.textContent = `0${province.areaCode}`;
        elements.liveBestTime.textContent = province.bestTime;

        renderBulletList(elements.liveHighlightsList, province.highlights, '🏛️');
        renderBulletList(elements.liveFoodsList, province.foods, '🍲');

        if (elements.sideDistrictsBox) {
            elements.sideDistrictsBox.style.display = 'none';
        }

        if (province.plate === '06') {
            toggleAnkaraGuide(true);
        } else if (elements.ankaraGuideSection) {
            toggleAnkaraGuide(false);
        }
    }

    function toggleAnkaraGuide(isVisible) {
        if (!elements.ankaraGuideSection) return;
        elements.ankaraGuideSection.hidden = !isVisible;
        elements.ankaraGuideSection.style.removeProperty('display');
    }

    function initAnkaraGuide() {
        if (!elements.ankaraGuideSection || !elements.ankaraSearchInput) return;

        const buttons = elements.ankaraFilterPills ? elements.ankaraFilterPills.querySelectorAll('.ankara-filter-btn') : [];
        let activeCategory = 'all';

        function applyAnkaraFilter() {
            const term = (elements.ankaraSearchInput.value || '').trim().toLowerCase();
            const sections = document.querySelectorAll('.ankara-cat-section');

            sections.forEach(section => {
                const cat = section.getAttribute('data-ankara-cat');
                const cards = section.querySelectorAll('.ankara-item-card');
                let visibleCount = 0;

                cards.forEach(card => {
                    const matchesCategory = activeCategory === 'all' || activeCategory === cat;
                    const searchableText = `${card.dataset.search || ''} ${card.dataset.tags || ''} ${card.textContent || ''}`.toLowerCase();
                    const matchesSearch = !term || searchableText.includes(term);
                    const shouldShow = matchesCategory && matchesSearch;
                    card.style.display = shouldShow ? '' : 'none';
                    if (shouldShow) visibleCount += 1;
                });

                section.style.display = visibleCount ? '' : 'none';
            });
        }

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                activeCategory = button.getAttribute('data-ankara-cat');
                buttons.forEach(btn => btn.classList.toggle('active', btn === button));
                applyAnkaraFilter();
            });
        });

        elements.ankaraSearchInput.addEventListener('input', applyAnkaraFilter);
        applyAnkaraFilter();
    }

    function renderBulletList(container, items, icon) {
        container.innerHTML = '';
        if (!items) return;
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${icon}</span> <span>${item}</span>`;
            container.appendChild(li);
        });
    }

    function renderDistricts(districts) {
        if (!elements.sideDistrictsBox || !elements.sideDistrictsList) return;
        if (!districts || districts.length === 0) {
            elements.sideDistrictsBox.style.display = 'none';
            return;
        }
        elements.sideDistrictsBox.style.display = 'flex';
        elements.sideDistrictsList.innerHTML = '';
        districts.forEach(d => {
            const span = document.createElement('span');
            span.className = 'district-pill';
            span.textContent = d;
            elements.sideDistrictsList.appendChild(span);
        });
    }

    function scrollToCitySection() {
        const cityGuideSections = {
            '01': elements.adanaGuideSection,
            '05': elements.amasyaGuideSection,
            '07': elements.antalyaGuideSection,
            '09': elements.aydinGuideSection,
            '35': elements.izmirGuideSection,
            '03': elements.afyonkarahisarGuideSection,
            '02': elements.adiyamanGuideSection,
            '04': elements.agriGuideSection,
            '68': elements.aksarayGuideSection,
            '75': elements.ardahanGuideSection,
            '08': elements.artvinGuideSection,
            '20': elements.denizliGuideSection,
            '43': elements.kutahyaGuideSection,
            '45': elements.manisaGuideSection,
            '48': elements.muglaGuideSection,
            '64': elements.usakGuideSection,
            '10': elements.balikesirGuideSection,
            '74': elements.bartinGuideSection,
            '72': elements.batmanGuideSection,
            '69': elements.bayburtGuideSection,
            '11': elements.bilecikGuideSection,
            '12': elements.bingolGuideSection,
            '13': elements.bitlisGuideSection,
            '14': elements.boluGuideSection,
            '15': elements.burdurGuideSection,
            '16': elements.bursaGuideSection,
            '17': elements.canakkaleGuideSection,
            '18': elements.cankiriGuideSection,
            '19': elements.corumGuideSection,
            '81': elements.duzceGuideSection,
            '22': elements.edirneGuideSection,
            '23': elements.elazigGuideSection,
            '24': elements.erzincanGuideSection,
            '25': elements.erzurumGuideSection,
            '26': elements.eskisehirGuideSection,
            '27': elements.gaziantepGuideSection,
            '28': elements.giresunGuideSection,
            '29': elements.gumushaneGuideSection,
            '30': elements.hakkariGuideSection,
            '31': elements.hatayGuideSection,
            '32': elements.ispartaGuideSection,
            '34': elements.istanbulGuideSection,
            '33': elements.mersinGuideSection,
            '44': elements.malatyaGuideSection,
            '47': elements.mardinGuideSection,
            '49': elements.musGuideSection,
            '78': elements.karabukGuideSection,
            '70': elements.karamanGuideSection,
            '36': elements.karsGuideSection,
            '37': elements.kastamonuGuideSection,
            '38': elements.kayseriGuideSection,
            '71': elements.kirikkaleGuideSection,
            '39': elements.kirklareliGuideSection,
            '40': elements.kirsehirGuideSection,
            '79': elements.kilisGuideSection,
            '41': elements.kocaeliGuideSection,
            '42': elements.konyaGuideSection,
            '50': elements.nevsehirGuideSection,
            '51': elements.nigdeGuideSection,
            '52': elements.orduGuideSection,
            '53': elements.rizeGuideSection,
            '54': elements.sakaryaGuideSection,
            '55': elements.samsunGuideSection,
            '56': elements.siirtGuideSection,
            '57': elements.sinopGuideSection,
            '58': elements.sivasGuideSection,
            '63': elements.sanliurfaGuideSection,
            '21': elements.diyarbakirGuideSection,
            '76': elements.igdirGuideSection,
            '46': elements.kahramanmarasGuideSection,
            '80': elements.osmaniyeGuideSection,
            '59': elements.tekirdagGuideSection,
            '60': elements.tokatGuideSection,
            '61': elements.trabzonGuideSection,
            '62': elements.tunceliGuideSection,
            '65': elements.vanGuideSection,
            '66': elements.yozgatGuideSection,
            '67': elements.zonguldakGuideSection,
            '73': elements.sirnakGuideSection,
            '77': elements.yalovaGuideSection,
            '06': elements.ankaraGuideSection
        };
        const guideSection = AppState.currentProvince && cityGuideSections[AppState.currentProvince.plate];
        if (guideSection && !guideSection.hidden) {
            guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (elements.liveCitySection) {
            elements.liveCitySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // =========================================================================
    // 3. ŞEHRİ SABİTLEME (PIN) & NOT DEFTERİ
    // =========================================================================
    function togglePinCity() {
        AppState.isPinned = !AppState.isPinned;
        elements.pinCityBtn.classList.toggle('active', AppState.isPinned);
        if (AppState.isPinned) {
            elements.pinText.textContent = 'Şehir Sabitlendi 🔒';
            elements.pinCityBtn.style.background = '#2563eb';
            elements.pinCityBtn.style.color = '#fff';
        } else {
            elements.pinText.textContent = 'Şehri Sabitle';
            elements.pinCityBtn.style.background = '';
            elements.pinCityBtn.style.color = '';
        }
    }

    function saveLiveCityNote() {
        if (!AppState.currentProvince) return;
        const note = elements.liveNoteTextarea.value.trim();
        const key = `turkey_note_${AppState.currentProvince.id}`;
        const cityId = AppState.currentProvince.id;

        // localStorage'a kaydet
        if (note) {
            localStorage.setItem(key, note);
        } else {
            localStorage.removeItem(key);
        }

        elements.liveNoteStatus.textContent = '💾 Kaydediliyor...';
        elements.liveNoteStatus.className = 'save-status-msg';

        // Supabase'e kaydet (varsa)
        if (window.GeziSupabase && window.GeziSupabase.isReady()) {
            window.GeziSupabase.saveNoteToSupabase(cityId, note).then(ok => {
                if (ok) {
                    elements.liveNoteStatus.textContent = note ? '☁️ Buluta kaydedildi!' : '🗑️ Not silindi.';
                } else {
                    elements.liveNoteStatus.textContent = note ? '✓ Yerel kaydedildi (bulut hatası)' : 'Not temizlendi.';
                }
                elements.liveNoteStatus.className = 'save-status-msg saved';
                setTimeout(() => {
                    elements.liveNoteStatus.textContent = 'Kayıtlı';
                    elements.liveNoteStatus.className = 'save-status-msg';
                }, 2500);
            });
        } else {
            elements.liveNoteStatus.textContent = note ? '✓ Notunuz başarıyla kaydedildi!' : 'Not temizlendi.';
            elements.liveNoteStatus.className = 'save-status-msg saved';
            setTimeout(() => {
                elements.liveNoteStatus.textContent = 'Kayıtlı';
                elements.liveNoteStatus.className = 'save-status-msg';
            }, 2500);
        }
    }

    // Ziyaret Durumu
    function toggleVisitStatus(type) {
        if (!AppState.currentProvince) return;
        const id = AppState.currentProvince.id;
        let newStatus = null;

        if (type === 'visited') {
            if (AppState.visitedCities.includes(id)) {
                AppState.visitedCities = AppState.visitedCities.filter(c => c !== id);
                newStatus = null; // Kaldır
            } else {
                AppState.visitedCities.push(id);
                AppState.wishlistCities = AppState.wishlistCities.filter(c => c !== id);
                newStatus = 'visited';
            }
        } else if (type === 'wishlist') {
            if (AppState.wishlistCities.includes(id)) {
                AppState.wishlistCities = AppState.wishlistCities.filter(c => c !== id);
                newStatus = null; // Kaldır
            } else {
                AppState.wishlistCities.push(id);
                AppState.visitedCities = AppState.visitedCities.filter(c => c !== id);
                newStatus = 'wishlist';
            }
        }

        localStorage.setItem('turkey_visited_cities', JSON.stringify(AppState.visitedCities));
        localStorage.setItem('turkey_wishlist_cities', JSON.stringify(AppState.wishlistCities));

        // Supabase'e kaydet (arka planda)
        if (window.GeziSupabase && window.GeziSupabase.isReady()) {
            window.GeziSupabase.saveCityStatusToSupabase(id, newStatus);
        }

        updateVisitButtons(id);
        updateAllMapStatuses();
        updateTravelStats();
    }

    function updateVisitButtons(provinceId) {
        const isVisited = AppState.visitedCities.includes(provinceId);
        const isWishlist = AppState.wishlistCities.includes(provinceId);

        elements.liveVisitedBtn.classList.toggle('visited-active', isVisited);
        elements.liveWishlistBtn.classList.toggle('wishlist-active', isWishlist);

        elements.liveVisitedBtn.innerHTML = isVisited ? '<span>✓</span> <span>Gezildi</span>' : '<span>✓</span> <span>Gezdim</span>';
        elements.liveWishlistBtn.innerHTML = isWishlist ? '<span>★</span> <span>Listede</span>' : '<span>★</span> <span>Gezilecek</span>';
    }

    function updateProvinceMapStatus(group, provinceId) {
        group.classList.remove('visited', 'wishlist');
        if (AppState.visitedCities.includes(provinceId)) {
            group.classList.add('visited');
        } else if (AppState.wishlistCities.includes(provinceId)) {
            group.classList.add('wishlist');
        }
    }

    function updateAllMapStatuses() {
        const svg = document.getElementById('svg-turkiye-haritasi');
        if (!svg) return;
        svg.querySelectorAll('#turkiye > g:not(#istanbul), #istanbul > g').forEach(g => {
            const plate = g.getAttribute('data-plakakodu');
            const provinceData = PROVINCES_DATA[plate];
            if (provinceData) {
                updateProvinceMapStatus(g, provinceData.id);
            }
        });
    }

    function updateTravelStats() {
        const count = AppState.visitedCities.length;
        const percent = Math.round((count / 81) * 100);
        elements.visitedCountText.textContent = `${count} / 81 (%${percent})`;
    }

    // =========================================================================
    // 4. ARAMA VE BÖLGE FİLTRESİ
    // =========================================================================
    function initSearch() {
        elements.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 1) {
                elements.searchResults.classList.remove('active');
                elements.searchResults.innerHTML = '';
                return;
            }

            const matches = [];
            for (const key in PROVINCES_DATA) {
                const p = PROVINCES_DATA[key];
                const matchesName = p.name.toLowerCase().includes(query);
                const matchesPlate = p.plate.includes(query);
                const matchesHighlight = p.highlights.some(h => h.toLowerCase().includes(query));
                const matchesFood = p.foods.some(f => f.toLowerCase().includes(query));

                let matchesSide = false;
                if (p.sides) {
                    if (p.sides.avrupa) {
                        matchesSide = matchesSide ||
                            p.sides.avrupa.name.toLowerCase().includes(query) ||
                            p.sides.avrupa.tagline.toLowerCase().includes(query) ||
                            p.sides.avrupa.highlights.some(h => h.toLowerCase().includes(query)) ||
                            p.sides.avrupa.foods.some(f => f.toLowerCase().includes(query)) ||
                            p.sides.avrupa.keyDistricts.some(d => d.toLowerCase().includes(query));
                    }
                    if (p.sides.asya) {
                        matchesSide = matchesSide ||
                            p.sides.asya.name.toLowerCase().includes(query) ||
                            p.sides.asya.tagline.toLowerCase().includes(query) ||
                            p.sides.asya.highlights.some(h => h.toLowerCase().includes(query)) ||
                            p.sides.asya.foods.some(f => f.toLowerCase().includes(query)) ||
                            p.sides.asya.keyDistricts.some(d => d.toLowerCase().includes(query));
                    }
                }

                if (matchesName || matchesPlate || matchesHighlight || matchesFood || matchesSide) {
                    matches.push(p);
                }
            }

            renderSearchResults(matches.slice(0, 8));
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box-wrapper')) {
                elements.searchResults.classList.remove('active');
            }
        });
    }

    function renderSearchResults(results) {
        if (results.length === 0) {
            elements.searchResults.innerHTML = `
                <div style="padding: 10px 14px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    Eşleşen şehir bulunamadı.
                </div>
            `;
            elements.searchResults.classList.add('active');
            return;
        }

        elements.searchResults.innerHTML = '';
        results.forEach(p => {
            const item = document.createElement('div');
            item.className = 'search-item';
            const regionInfo = TURKEY_REGIONS[p.regionId];
            item.innerHTML = `
                <div class="search-item-left">
                    <span class="search-plate-badge">${p.plate}</span>
                    <span style="font-weight: 600;">${p.name}</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${regionInfo ? regionInfo.name : ''}</span>
            `;
            item.onclick = () => {
                elements.searchInput.value = '';
                elements.searchResults.classList.remove('active');
                selectCity(p, true);
                scrollToCitySection();
            };
            elements.searchResults.appendChild(item);
        });

        elements.searchResults.classList.add('active');
    }

    function initRegionFilter() {
        const buttons = elements.regionPillsContainer.querySelectorAll('.region-pill');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const region = btn.getAttribute('data-region');
                AppState.activeRegionFilter = region;
                filterMapByRegion(region);
            });
        });
    }

    function filterMapByRegion(regionId) {
        const svg = document.getElementById('svg-turkiye-haritasi');
        if (!svg) return;

        const provinceGroups = svg.querySelectorAll('#turkiye > g:not(#istanbul), #istanbul > g');
        provinceGroups.forEach(g => {
            const plate = g.getAttribute('data-plakakodu');
            const provinceData = PROVINCES_DATA[plate];
            if (!provinceData) return;

            const isMatch = (regionId === 'all' || provinceData.regionId === regionId);
            g.classList.toggle('dimmed', !isMatch);

            const groupId = g.getAttribute('id');
            const label = svg.querySelector(`.city-map-label[data-target-id="${groupId}"]`) ||
                          svg.querySelector(`.city-map-label[data-target-id="${provinceData.id}"]`);
            if (label) {
                const defaultOpacity = regionId === 'all' ? '0.45' : isMatch ? '1' : '0.25';
                label.style.opacity = defaultOpacity;
            }
        });
    }

    // =========================================================================
    // 5. GÖRÜNÜM & TEMA BUTONLARI & İSTANBUL YAKA SEKMELERİ
    // =========================================================================
    function initViewControls() {
        // Sabitleme butonu
        elements.pinCityBtn.addEventListener('click', togglePinCity);

        // Not kaydet butonu
        elements.liveSaveNoteBtn.addEventListener('click', saveLiveCityNote);

        // Ziyaret butonları
        elements.liveVisitedBtn.addEventListener('click', () => toggleVisitStatus('visited'));
        elements.liveWishlistBtn.addEventListener('click', () => toggleVisitStatus('wishlist'));

        // İstanbul Yakaları Sekmeleri (Tüm İstanbul / Avrupa / Asya)
        if (elements.sideTabAll) {
            elements.sideTabAll.addEventListener('click', () => {
                AppState.selectedIstanbulSide = 'all';
                renderIstanbulSide('all');
            });
        }
        if (elements.sideTabAvrupa) {
            elements.sideTabAvrupa.addEventListener('click', () => {
                AppState.selectedIstanbulSide = 'avrupa';
                renderIstanbulSide('avrupa');
            });
        }
        if (elements.sideTabAsya) {
            elements.sideTabAsya.addEventListener('click', () => {
                AppState.selectedIstanbulSide = 'asya';
                renderIstanbulSide('asya');
            });
        }

        // Ctrl+S kaydetme
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveLiveCityNote();
            }
        });

        // Görünüm Modu (Varsa)
        if (elements.reliefToggleBtn) {
            elements.reliefToggleBtn.addEventListener('click', () => {
                AppState.reliefMode = !AppState.reliefMode;
                elements.reliefToggleBtn.classList.toggle('active', AppState.reliefMode);
                elements.mapStage.classList.toggle('relief-on', AppState.reliefMode);
            });
        }

        // Tema Değiştirme
        elements.themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark');
            elements.themeToggleBtn.textContent = isDark ? '🌙' : '☀️';
            localStorage.setItem('turkey_theme', isDark ? 'dark' : 'light');
        });

        // Başlangıç teması
        const savedTheme = localStorage.getItem('turkey_theme') || 
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            elements.themeToggleBtn.textContent = '🌙';
        } else {
            elements.themeToggleBtn.textContent = '☀️';
        }
    }

    // Hash Kontrolü
    function handleRoute() {
        const hash = window.location.hash;
        if (hash.startsWith('#/sehir/')) {
            const cityId = hash.replace('#/sehir/', '').trim();
            const province = getProvinceById(cityId) || getProvinceByPlate(cityId) || getProvinceByName(cityId);
            if (province) {
                selectCity(province, false);
            }
        }
    }

    // =========================================================================
    // 6. BAŞLAT
    // =========================================================================
    async function init() {
        initViewControls();
        initSearch();
        initRegionFilter();
        updateTravelStats();

        // Harita ve Şehir İsimlerini Yükle
        initMap();
        filterMapByRegion(AppState.activeRegionFilter);

        // Supabase Entegrasyonu
        if (window.GeziSupabase) {
            const sbReady = window.GeziSupabase.initSupabase();
            if (sbReady) {
                // localStorage'daki verileri Supabase'e aktar (tek seferlik migration)
                await window.GeziSupabase.syncLocalToSupabase(
                    AppState.visitedCities,
                    AppState.wishlistCities
                );

                // Supabase'den güncel şehir durumlarını yükle
                const cloudStatuses = await window.GeziSupabase.loadCityStatusesFromSupabase();
                if (cloudStatuses) {
                    AppState.visitedCities = cloudStatuses.visited;
                    AppState.wishlistCities = cloudStatuses.wishlist;
                    localStorage.setItem('turkey_visited_cities', JSON.stringify(AppState.visitedCities));
                    localStorage.setItem('turkey_wishlist_cities', JSON.stringify(AppState.wishlistCities));
                    updateAllMapStatuses();
                    updateTravelStats();
                    console.log('☁️ Supabase şehir durumları yüklendi:', cloudStatuses.visited.length, 'gezildi,', cloudStatuses.wishlist.length, 'listede.');
                }
            }
        }

        // Hash dinle
        window.addEventListener('hashchange', handleRoute);
        handleRoute();

        console.log('⚡ Türkiye Şehirleri Gezi Rehberi: Yüksek Performanslı Canlı Şehir Portalı Hazır.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
