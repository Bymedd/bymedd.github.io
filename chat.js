/* ==========================================================================
   GEZİ SOHBET — Sağ panel, Google ile giriş (Supabase Auth) ve gerçek
   zamanlı mesajlaşma (Supabase Realtime + chat_messages tablosu).

   • Giriş SAHTE DEĞİLDİR: Supabase Auth üzerinden gerçek Google OAuth
     akışı yürütülür. Yapılandırma eksikse (Google sağlayıcısı kapalı,
     sayfa file:// ile açılmış, tablo yoksa) panelde açıklayıcı uyarı
     gösterilir; sahte bir "giriş yapıldı" ekranı asla oluşturulmaz.
   • supabase-js v2 yerel olarak vendor/ klasöründen yüklenir; CDN'e
     düşer, o da yoksa panelde açıklayıcı hata gösterilir.
   • Mesajlar public.chat_messages tablosunda tutulur; realtime kanalı
     hata verirse 5 sn'lik REST poll'üne düşer.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- Yapılandırma (gizli olmayan publishable key) ---------- */
    var SUPABASE_URL = 'https://iailejdatghtlngacwua.supabase.co';
    var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_LDDnKCVAM-0lsBucRGS7iw_VaAJ5LEk';
    var MESSAGES_TABLE = 'chat_messages';
    var MESSAGE_MAX_LEN = 1000;
    var HISTORY_LIMIT = 100;
    var POLL_INTERVAL_MS = 5000;
    var LOCAL_SDK = './vendor/supabase.min.js';
    var CDN_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

    /* ---------- Durum ---------- */
    var sb = null;
    var els = {};
    var state = {
        user: null,
        messages: [],
        loading: false,
        sending: false,
        authReady: false,
        channel: null,
        pollTimer: null
    };

    /* ---------- Yardımcılar ---------- */
    function $(id) { return document.getElementById(id); }

    function trimHostSlash(u) { return u.replace(/\/+$/, ''); }

    function isFileProtocol() {
        return location.protocol === 'file:' || location.protocol === 'blob:';
    }

    function redirectUrl() {
        // hash'i hariç tut: OAuth dönüşü token'lar hash/params ile gelir.
        return location.origin + location.pathname + location.search;
    }

    function showNotice(text, kind) {
        if (!els.notice) return;
        els.notice.hidden = false;
        els.notice.textContent = text;
        els.notice.className = 'chat-notice' + (kind ? ' chat-notice--' + kind : '');
    }

    function clearNotice() {
        if (!els.notice) return;
        els.notice.hidden = true;
        els.notice.textContent = '';
    }

    /* ---------- Panel aç / kapat ---------- */
    function openPanel() {
        els.panel.classList.add('is-open');
        els.overlay.classList.add('is-open');
        els.panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('chat-panel-open');
        if (els.openBtn) els.openBtn.setAttribute('aria-expanded', 'true');
        if (state.user) {
            // Odada ilk yükleme yapıldıysa sadece alta kaydır
            scrollToBottom(true);
        } else if (els.googleBtn) {
            setTimeout(function () { els.googleBtn.focus(); }, 260);
        }
    }

    function closePanel() {
        els.panel.classList.remove('is-open');
        els.overlay.classList.remove('is-open');
        els.panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('chat-panel-open');
        if (els.openBtn) {
            els.openBtn.setAttribute('aria-expanded', 'false');
            els.openBtn.focus();
        }
    }

    function isPanelOpen() { return els.panel.classList.contains('is-open'); }

    /* ---------- Supabase istemcisi ---------- */
    function loadSdk(cb) {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            cb(null); return;
        }
        // 1) yerel kopya, 2) CDN, ikisi de yoksa hata
        var s1 = document.createElement('script');
        s1.src = LOCAL_SDK;
        s1.onload = function () { cb(null); };
        s1.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = CDN_SDK;
            s2.onload = function () {
                if (window.supabase && typeof window.supabase.createClient === 'function') cb(null);
                else cb(new Error('sdk'));
            };
            s2.onerror = function () { cb(new Error('sdk')); };
            document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
    }

    function initClient(cb) {
        loadSdk(function (err) {
            if (err) { cb(err); return; }
            try {
                sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce'
                    }
                });
                cb(null);
            } catch (e) {
                cb(e);
            }
        });
    }

    /* ---------- Hata metinleri (Türkçe, açıklayıcı) ---------- */
    function humanDbError(error) {
        var msg = (error && (error.message || error.error_description || '')) + '';
        var code = (error && error.code) || '';
        if (code === 'PGRST205' || msg.indexOf(MESSAGES_TABLE) !== -1) {
            return 'Sohbet veritabanı hazır değil: "' + MESSAGES_TABLE + '" tablosu bulunamadı.\n' +
                'Kurulum: Supabase Dashboard → SQL Editor → supabase/chat_setup.sql dosyasını yapıştırıp çalıştırın.';
        }
        if (code === '42501' || /row-level security|permission denied/i.test(msg)) {
            return 'Yetki hatası (RLS): mesaj tablosuna erişim politikaları eksik olabilir.\n' +
                'supabase/chat_setup.sql dosyasını SQL Editor’de çalıştırın.';
        }
        if (code === '401' || /jwt|token|not authorized/i.test(msg)) {
            return 'Oturumunuzun süresi dolmuş olabilir. Çıkış yapıp yeniden giriş yapın.';
        }
        if (/failed to fetch|networkerror|load failed/i.test(msg)) {
            return 'Supabase’e ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        }
        return 'Mesaj yüklenemedi/gönderilemedi: ' + (msg || 'bilinmeyen hata');
    }

    function humanAuthError(error) {
        var msg = (error && (error.message || error.error_description || '')) + '';
        if (/provider is not enabled/i.test(msg)) {
            return googleProviderHelp();
        }
        if (/failed to fetch|networkerror|load failed/i.test(msg)) {
            return 'Supabase Auth servisine ulaşılamadı. İnternet bağlantınızı kontrol edin.';
        }
        return 'Google ile giriş başlatılamadı: ' + (msg || 'bilinmeyen hata');
    }

    function googleProviderHelp() {
        var origin = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:8137';
        return 'Google girişi bu Supabase projesinde henüz ETKİN DEĞİL.\n' +
            'Çözüm (Supabase Dashboard):\n' +
            '1) Authentication → Sign In / Providers → Google → Enable\n' +
            '2) Google Cloud Console’dan OAuth Client ID + Secret girin\n' +
            '   (Authorized redirect URI: https://<proje-ref>.supabase.co/auth/v1/callback)\n' +
            '3) Authentication → URL Configuration → Redirect URLs’ye bu sayfanın\n' +
            '   adresini ekleyin (örn. ' + origin + '/*).';
    }

    function fileProtocolHelp() {
        return 'Sayfa file:// ile açılmış; Google ile giriş yalnızca http/https üzerinden çalışır.\n' +
            'Proje klasöründe yerel sunucu başlatın:\n' +
            '  python -m http.server 8137\n' +
            'Sonra açın: http://localhost:8137/turkey.html';
    }

    /* ---------- OAuth dönüşündeki hata parametreleri ---------- ---------- */
    function consumeUrlErrors() {
        var combined = '';
        try {
            combined = location.search + '&' + (location.hash || '').replace(/^#/, '');
        } catch (e) { return; }
        var params;
        try { params = new URLSearchParams(combined); } catch (e) { return; }
        var err = params.get('error') || params.get('error_code') || '';
        var desc = params.get('error_description') || params.get('error_code') || '';
        if (!err) return;
        // Tüketilen hata parametrelerini adresten temizle
        ['error', 'error_code', 'error_description'].forEach(function (k) { params.delete(k); });
        var text;
        if (/provider_not_enabled/.test(err + ' ' + desc)) {
            text = googleProviderHelp();
        } else if (/redirect_uri|disallowed|validation_failed/.test(err + ' ' + desc)) {
            var origin2 = (location.origin && location.origin !== 'null') ? location.origin : 'http://localhost:8137';
            text = 'Google dönüş adresi (redirect URL) Supabase’de izinli değil.\n' +
                'Authentication → URL Configuration → Redirect URLs’ye bu sayfanın adresini ekleyin\n' +
                '(örn. ' + origin2 + '/*).';
        } else if (/access_denied/.test(err + ' ' + desc)) {
            text = 'Google ile giriş iptal edildi.';
        } else {
            text = 'Giriş sırasında hata oluştu: ' + (desc || err);
        }
        showNotice(text, /access_denied/.test(err) ? 'warn' : 'err');
        try {
            var clean = params.toString();
            history.replaceState(null, '', location.pathname + (clean ? '?' + clean : ''));
        } catch (e) { /* yok say */ }
    }

    /* ---------- Giriş / çıkış ---------- */
    function signInWithGoogle() {
        clearNotice();
        if (!sb) {
            showNotice('Sohbet altyapısı yüklenemedi: Supabase istemcisi hazır değil. İnternet bağlantınızı kontrol edip sayfayı yenileyin.', 'err');
            return;
        }
        if (isFileProtocol()) {
            showNotice(fileProtocolHelp(), 'warn');
            return;
        }
        els.googleBtn.disabled = true;
        els.googleBtn.setAttribute('aria-busy', 'true');

        // Sağlayıcı gerçekten etkin mi? (etkin değilse gereksiz yönlendirme yapma)
        fetch(trimHostSlash(SUPABASE_URL) + '/auth/v1/settings', {
            headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY }
        }).then(function (r) { return r.ok ? r.json() : null; }).then(function (settings) {
            if (settings && settings.external && settings.external.google === false) {
                throw new Error('provider is not enabled');
            }
            return sb.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl(),
                    queryParams: { prompt: 'select_account' }
                }
            });
        }).then(function (res) {
            if (res && res.error) throw res.error;
            // Yönlendirme başladı; sayfa artık başka bir adreste.
        }).catch(function (error) {
            showNotice(humanAuthError(error), 'err');
            els.googleBtn.disabled = false;
            els.googleBtn.removeAttribute('aria-busy');
        });
    }

    function signOut() {
        clearNotice();
        sb.auth.signOut().catch(function () { /* yok say */ });
    }

    /* ---------- Oturum durumu ---------- */
    function setUser(user) {
        var changed = (state.user && state.user.id) !== (user && user.id);
        state.user = user || null;
        renderAuthState();
        if (state.user) {
            if (changed) enterRoom();
        } else {
            leaveRoom();
        }
    }

    function renderAuthState() {
        var loggedIn = !!state.user;
        els.authView.hidden = loggedIn;
        els.roomView.hidden = !loggedIn;
        if (!loggedIn) {
            if (els.googleBtn) {
                els.googleBtn.disabled = false;
                els.googleBtn.removeAttribute('aria-busy');
            }
            return;
        }
        var meta = state.user.user_metadata || {};
        var name = meta.full_name || meta.name || state.user.email || 'Kullanıcı';
        var avatar = meta.avatar_url || meta.picture || '';
        var initial = (name || '?').trim().charAt(0).toLocaleUpperCase('tr-TR');

        els.userName.textContent = name;
        els.userEmail.textContent = state.user.email || meta.provider || '';
        setComposerBusy(state.sending);

        if (avatar && /^https?:\/\//i.test(avatar)) {
            els.userAvatar.removeAttribute('data-initial');
            els.userAvatar.textContent = '';
            els.userAvatar.style.backgroundImage = 'url("' + avatar.replace(/"/g, '%22') + '")';
            els.userAvatar.style.backgroundSize = 'cover';
            els.userAvatar.style.backgroundPosition = 'center';
        } else {
            els.userAvatar.style.backgroundImage = 'none';
            els.userAvatar.textContent = initial;
        }
    }

    /* ---------- Sohbet odası: yükle, dinle, gönder ---------- */
    function enterRoom() {
        loadMessages();
        subscribeRealtime();
    }

    function leaveRoom() {
        stopPoll();
        if (state.channel) {
            try { sb.removeChannel(state.channel); } catch (e) { /* yok say */ }
            state.channel = null;
        }
        state.messages = [];
        renderMessages();
    }

    function loadMessages() {
        if (!sb || !state.user || state.loading) return Promise.resolve();
        state.loading = true;
        return sb.from(MESSAGES_TABLE)
            .select('id,user_id,display_name,avatar_url,message,created_at')
            .order('created_at', { ascending: true })
            .limit(HISTORY_LIMIT)
            .then(function (res) {
                state.loading = false;
                if (res.error) {
                    showNotice(humanDbError(res.error), 'err');
                    renderMessages(true);
                    return;
                }
                state.messages = res.data || [];
                renderMessages();
                scrollToBottom(true);
            })
            .catch(function (e) {
                state.loading = false;
                showNotice(humanDbError(e), 'err');
            });
    }

    function subscribeRealtime() {
        if (!sb || !state.user) return;
        if (state.channel) { try { sb.removeChannel(state.channel); } catch (e) { /* yok say */ } }

        // Realtime sunucusuna mevcut erişim jetonunu ver (RLS için)
        sb.auth.getSession().then(function (_a) {
            var session = _a.data && _a.data.session;
            if (session && sb.realtime && typeof sb.realtime.setAuth === 'function') {
                try { sb.realtime.setAuth(session.access_token); } catch (e) { /* yok say */ }
            }
        }).catch(function () { /* yok say */ });

        var channel = sb.channel('gezi-chat-odasi', {
            config: { broadcast: { self: false } }
        });
        channel
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: MESSAGES_TABLE
            }, function (payload) {
                if (payload && payload.new) upsertMessage(payload.new);
            })
            .subscribe(function (status) {
                if (status === 'SUBSCRIBED') {
                    stopPoll();           // realtime çalışıyor, poll gerekmez
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    startPoll();          // realtime yok: 5 sn'de bir tazele
                }
            });
        state.channel = channel;
    }

    function startPoll() {
        if (state.pollTimer) return;
        state.pollTimer = setInterval(function () {
            if (state.user) loadMessages();
        }, POLL_INTERVAL_MS);
    }

    function stopPoll() {
        if (state.pollTimer) {
            clearInterval(state.pollTimer);
            state.pollTimer = null;
        }
    }

    function upsertMessage(row) {
        if (!row || !row.id) return;
        var idx = -1;
        for (var i = 0; i < state.messages.length; i++) {
            if (state.messages[i].id === row.id) { idx = i; break; }
        }
        if (idx === -1) state.messages.push(row);
        else state.messages[idx] = row;
        state.messages.sort(function (a, b) {
            return new Date(a.created_at) - new Date(b.created_at);
        });
        var list = els.messages;
        var nearBottom = list && (list.scrollHeight - list.scrollTop - list.clientHeight < 140);
        renderMessages();
        if (nearBottom) scrollToBottom(false);
    }

    function sendMessage(text) {
        if (!sb || !state.user || state.sending) return;
        text = (text || '').trim();
        if (!text) return;
        if (text.length > MESSAGE_MAX_LEN) text = text.slice(0, MESSAGE_MAX_LEN);

        var meta = state.user.user_metadata || {};
        var payload = {
            user_id: state.user.id,
            display_name: meta.full_name || meta.name || state.user.email || 'Kullanıcı',
            avatar_url: meta.avatar_url || meta.picture || null,
            message: text
        };

        state.sending = true;
        setComposerBusy(true);

        sb.from(MESSAGES_TABLE)
            .insert(payload)
            .select('id,user_id,display_name,avatar_url,message,created_at')
            .single()
            .then(function (res) {
                state.sending = false;
                setComposerBusy(false);
                if (res.error) {
                    showNotice(humanDbError(res.error), 'err');
                    return;
                }
                clearNotice();
                els.input.value = '';
                autosizeInput();
                if (res.data) upsertMessage(res.data);
                scrollToBottom(true);
            })
            .catch(function (e) {
                state.sending = false;
                setComposerBusy(false);
                showNotice(humanDbError(e), 'err');
            });
    }

    function setComposerBusy(busy) {
        els.sendBtn.disabled = busy || !state.user;
        els.input.disabled = !state.user;
    }

    /* ---------- Mesajların ekrana çizimi (XSS'e karşı DOM API ile) ---------- */
    function renderMessages(showErrorState) {
        var list = els.messages;
        if (!list) return;
        list.textContent = '';

        if (showErrorState) {
            var errBox = document.createElement('div');
            errBox.className = 'chat-empty';
            errBox.textContent = 'Mesajlar yüklenemedi. Yukarıdaki uyarıyı kontrol edin.';
            list.appendChild(errBox);
            return;
        }

        if (!state.messages.length) {
            var empty = document.createElement('div');
            empty.className = 'chat-empty';
            empty.textContent = 'Henüz mesaj yok. İlk mesajı siz yazın 🎉';
            list.appendChild(empty);
            return;
        }

        var ownId = state.user ? state.user.id : null;
        state.messages.forEach(function (m) {
            list.appendChild(buildMessageNode(m, m.user_id === ownId));
        });
    }

    function buildMessageNode(m, own) {
        var wrap = document.createElement('div');
        wrap.className = 'chat-msg' + (own ? ' chat-msg--own' : '');

        // Avatar
        var name = m.display_name || 'Kullanıcı';
        var avatar = document.createElement('div');
        avatar.className = 'chat-msg-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        if (m.avatar_url && /^https?:\/\//i.test(m.avatar_url)) {
            var img = document.createElement('img');
            img.className = 'chat-msg-avatar';
            img.src = m.avatar_url;
            img.alt = '';
            img.onerror = function () {
                if (img.parentNode) img.parentNode.replaceChild(fallbackAvatar(name, avatar), img);
            };
            wrap.appendChild(img);
        } else {
            wrap.appendChild(fallbackAvatar(name, avatar));
        }

        var body = document.createElement('div');
        body.className = 'chat-msg-body';

        var meta = document.createElement('div');
        meta.className = 'chat-msg-meta';
        var b = document.createElement('b');
        b.textContent = own ? 'Siz' : name;
        meta.appendChild(b);

        var bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = m.message == null ? '' : String(m.message);

        var time = document.createElement('div');
        time.className = 'chat-msg-time';
        time.textContent = formatTime(m.created_at);

        body.appendChild(meta);
        body.appendChild(bubble);
        body.appendChild(time);
        wrap.appendChild(body);
        return wrap;
    }

    function fallbackAvatar(name, template) {
        if (template) {
            template.textContent = (name || '?').trim().charAt(0).toLocaleUpperCase('tr-TR');
            return template;
        }
        var d = document.createElement('div');
        d.className = 'chat-msg-avatar';
        d.textContent = (name || '?').trim().charAt(0).toLocaleUpperCase('tr-TR');
        return d;
    }

    function formatTime(iso) {
        var d = iso ? new Date(iso) : new Date();
        if (isNaN(d.getTime())) d = new Date();
        var today = new Date();
        var sameDay = d.toDateString() === today.toDateString();
        try {
            return (sameDay ? '' : d.toLocaleDateString('tr-TR') + ' ') +
                d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return d.toISOString().slice(11, 16);
        }
    }

    function scrollToBottom(force) {
        var list = els.messages;
        if (!list) return;
        if (force) list.scrollTop = list.scrollHeight;
    }

    function autosizeInput() {
        var ta = els.input;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
    }

    /* ---------- Olay bağlamaları ---------- */
    function bindEvents() {
        els.openBtn.addEventListener('click', function () {
            if (isPanelOpen()) closePanel();
            else openPanel();
        });
        els.closeBtn.addEventListener('click', closePanel);
        els.overlay.addEventListener('click', closePanel);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isPanelOpen()) closePanel();
        });

        els.googleBtn.addEventListener('click', signInWithGoogle);
        els.logoutBtn.addEventListener('click', signOut);

        els.form.addEventListener('submit', function (e) {
            e.preventDefault();
            sendMessage(els.input.value);
        });
        els.input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(els.input.value);
            }
        });
        els.input.addEventListener('input', autosizeInput);
    }

    /* ---------- Başlangıç ---------- */
    function init() {
        els.openBtn = $('chatOpenBtn');
        els.closeBtn = $('chatCloseBtn');
        els.overlay = $('chatOverlay');
        els.panel = $('chatPanel');
        els.notice = $('chatNotice');
        els.authView = $('chatAuthView');
        els.roomView = $('chatRoomView');
        els.googleBtn = $('chatGoogleBtn');
        els.logoutBtn = $('chatLogoutBtn');
        els.userAvatar = $('chatUserAvatar');
        els.userName = $('chatUserName');
        els.userEmail = $('chatUserEmail');
        els.messages = $('chatMessages');
        els.form = $('chatForm');
        els.input = $('chatInput');
        els.sendBtn = $('chatSendBtn');

        // Bu sayfada sohbet işaretleri yoksa (ör. başka bir sayfa) sessizce çık
        if (!els.openBtn || !els.panel || !els.form) return;

        bindEvents();
        renderMessages();
        setComposerBusy(true); // giriş olmadan yazma kapalı

        initClient(function (err) {
            if (err) {
                showNotice('Sohbet altyapısı (supabase-js) yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin.', 'err');
                return;
            }

            consumeUrlErrors();

            sb.auth.getSession().then(function (res) {
                setUser(res.data && res.data.session ? res.data.session.user : null);
                state.authReady = true;
            }).catch(function () { state.authReady = true; });

            sb.auth.onAuthStateChange(function (_event, session) {
                setUser(session ? session.user : null);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
