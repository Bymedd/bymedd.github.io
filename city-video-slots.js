(function () {
    'use strict';

    const hero = document.querySelector('header.hero');
    const ankaraGuide = document.getElementById('ankaraGuideSection');
    const videoContainer = hero || ankaraGuide;
    if (!videoContainer || document.getElementById('creator-video-showcase')) return;

    const cityName = hero
        ? hero.querySelector('h1')?.textContent.replace(/\s+Gezi Rehberi\s*$/i, '').trim()
        : 'Ankara';
    if (!cityName) return;

    const showcase = document.createElement('section');
    showcase.id = 'creator-video-showcase';
    showcase.className = 'creator-video-showcase';
    showcase.setAttribute('aria-label', `${cityName} yerli ve uluslararası YouTuber videoları`);

    const heading = document.createElement('div');
    heading.className = 'creator-video-heading';
    const eyebrow = document.createElement('span');
    eyebrow.className = 'creator-video-eyebrow';
    eyebrow.textContent = 'ŞEHRİ VİDEOLARLA KEŞFET';
    const title = document.createElement('h2');
    title.textContent = `${cityName} YouTuber Rehberi`;
    const intro = document.createElement('p');
    intro.textContent = 'Şehirle ilgili gezi ve yemek videoları burada sayfadan ayrılmadan izlenebilir.';
    heading.append(eyebrow, title, intro);
    showcase.appendChild(heading);

    const videoGroups = [
        {
            title: 'Yerli YouTuber’lardan',
            label: 'Yerli içerik üreticisi',
            items: [
                { creator: 'MiniYo', title: 'Miniyo ile Türkiye\'yi Geziyorum | ANKARA', url: 'https://www.youtube.com/watch?v=-VVLyhG4P7I' },
                { creator: 'Birhayalinpeşinde', title: 'Ankara Gezilecek Yerler: VLOG', url: 'https://www.youtube.com/watch?v=ZEspznfItFs' },
                { creator: 'Ankara Seyahat Planı', title: 'Ankara Seyahat Planı Vlogu', url: 'https://www.youtube.com/watch?v=3GdflbBjjEs' },
                { creator: 'Samandağ’dan Ankara’ya Yolculuk', title: 'Samandağ\'dan Ankara\'ya Yolculuk Vlogu', url: 'https://www.youtube.com/watch?v=35xgz4vh3Wk' }
            ]
        },
        {
            title: 'Global YouTuber’lardan',
            label: 'Uluslararası içerik üreticisi',
            items: [
                { creator: 'WAY AWAY', title: 'ANKARA! 🇹🇷 The Capital of Turkey! Travel VLOG #390', url: 'https://www.youtube.com/watch?v=HKlGLflYy7M' },
                { creator: 'Go Türkiye', title: 'Add to Your Bucket List: Go&Visit – Ankara', url: 'https://www.youtube.com/watch?v=fc-600QpU_4' },
                { creator: 'Travel Vlog', title: 'Ankara Turkey Travel Vlog', url: 'https://www.youtube.com/results?search_query=Ankara+Turkey+travel+vlog' },
                { creator: 'Travel Guide', title: 'Ankara Turkey Travel Guide', url: 'https://www.youtube.com/results?search_query=Ankara+Turkey+travel+guide' }
            ]
        }
    ];

    videoGroups.forEach((group, groupIndex) => {
        const section = document.createElement('section');
        section.className = 'creator-video-group';
        const groupHeading = document.createElement('h3');
        groupHeading.textContent = group.title;
        section.appendChild(groupHeading);

        const grid = document.createElement('div');
        grid.className = 'creator-video-grid';

        for (let slotIndex = 1; slotIndex <= 4; slotIndex += 1) {
            const video = group.items[slotIndex - 1];
            const card = document.createElement('article');
            card.className = 'creator-video-card';

            const slot = document.createElement('div');
            slot.className = 'creator-video-slot';
            slot.dataset.videoGroup = groupIndex === 0 ? 'local' : 'global';
            slot.dataset.videoSlot = String(slotIndex);
            slot.dataset.videoUrl = video?.url || '';

            const frame = document.createElement('iframe');
            frame.src = 'about:blank';
            frame.title = video ? `${cityName} · ${video.title}` : `${cityName} ${group.label} ${slotIndex} video alanı`;
            frame.loading = 'lazy';
            frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            frame.allowFullscreen = true;
            frame.referrerPolicy = 'strict-origin-when-cross-origin';
            slot.appendChild(frame);

            const placeholder = document.createElement('div');
            placeholder.className = 'creator-video-placeholder';
            const playIcon = document.createElement('span');
            playIcon.className = 'creator-video-play';
            playIcon.setAttribute('aria-hidden', 'true');
            playIcon.textContent = '▶';
            const creatorLabel = document.createElement('strong');
            creatorLabel.textContent = video?.creator || `${group.label} ${slotIndex}`;
            const placeholderText = document.createElement('span');
            placeholderText.textContent = video?.title || 'Video bağlantısı eklenecek';
            placeholder.append(playIcon, creatorLabel, placeholderText);

            if (video) {
                const directLink = document.createElement('a');
                directLink.className = 'creator-video-link';
                directLink.href = video.url;
                directLink.target = '_blank';
                directLink.rel = 'noopener noreferrer';
                directLink.textContent = 'YouTube\'da Aç ↗';
                placeholder.appendChild(directLink);
            }

            slot.appendChild(placeholder);

            const caption = document.createElement('p');
            caption.className = 'creator-video-caption';
            caption.textContent = video ? video.title : `${cityName} · ${group.label} · Video ${slotIndex}`;
            card.append(slot, caption);
            grid.appendChild(card);
        }

        section.appendChild(grid);
        showcase.appendChild(section);
    });

    if (hero) hero.insertAdjacentElement('afterend', showcase);
    else ankaraGuide.prepend(showcase);

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './city-video-slots.css';
    document.head.appendChild(stylesheet);

    function getYouTubeEmbedUrl(value) {
        if (!value) return null;
        let url;
        try {
            url = new URL(value);
        } catch {
            return null;
        }
        const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
        let videoId = '';
        if (host === 'youtu.be') {
            videoId = url.pathname.split('/').filter(Boolean)[0] || '';
        } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
            if (url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
            else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] || '';
            else if (url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2] || '';
        }
        return /^[\w-]{11}$/.test(videoId)
            ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`
            : null;
    }

    showcase.querySelectorAll('.creator-video-slot').forEach(slot => {
        const embedUrl = getYouTubeEmbedUrl(slot.dataset.videoUrl);
        if (!embedUrl) return;
        slot.querySelector('iframe').src = embedUrl;
        slot.querySelector('.creator-video-placeholder').hidden = true;
    });
})();
