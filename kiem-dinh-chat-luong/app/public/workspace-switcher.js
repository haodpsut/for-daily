// ─── Workspace switcher ─────────────────────────────────────────────────────
// Inserts a small dropdown into .topnav. Persists choice via cookie `ws_id`,
// so the backend can read the active workspace without changing existing fetch calls.
(function () {
  const COOKIE = 'ws_id';

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function setCookie(name, value) {
    // 1 year, site-wide
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }

  // Menu definitions per workspace type. The current page is highlighted via location.pathname.
  const MENUS = {
    CSGD: [
      { href: '/',             icon: '📂', label: 'Minh chứng' },
      { href: '/module2.html', icon: '📋', label: 'Đánh giá TC' },
      { href: '/module3.html', icon: '📊', label: 'KPI – Biểu 16' },
      { href: '/module4.html', icon: '📅', label: 'Tiến độ TĐG' },
      { href: '/module5.html', icon: '📝', label: 'Khảo sát' },
      { href: '/module6.html', icon: '📄', label: 'Báo cáo TĐG' },
      { href: '/module7.html', icon: '🏛', label: 'Dashboard' },
    ],
    CTDT: [
      { href: '/ctdt.html',     icon: '🎓', label: 'Tổng quan CTĐT' },
      { href: '/ctdt-m8.html',         icon: '🧭', label: 'Khung CĐR' },
      { href: '/ctdt-m8-mapping.html', icon: '🗺', label: 'Ma trận ánh xạ' },
      { href: '/ctdt-m9.html',  icon: '📐', label: 'Rubric Library' },
      { href: '/ctdt-m10.html', icon: '🧪', label: 'Đo CLO' },
      { href: '/ctdt-m11.html', icon: '📊', label: 'Tổng hợp PLO' },
      { href: '/',              icon: '📂', label: 'Minh chứng' },
      { href: '/module5.html',  icon: '📝', label: 'Khảo sát' },
      { href: '/module6.html',  icon: '📄', label: 'Báo cáo' },
    ],
  };

  function injectStyles() {
    if (document.getElementById('ws-switcher-style')) return;
    const css = `
.ws-switcher { margin-left: auto; display: flex; align-items: center; gap: 8px; padding-right: 4px; }
.ws-switcher select {
  background: #22263a; color: #e2e8f0; border: 1px solid #2a2d3e;
  border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; outline: none; max-width: 240px;
}
.ws-switcher select:hover { border-color: #4f8ef7; }
.ws-switcher .ws-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
.ws-switcher .ws-badge {
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
  background: #2ea87e; color: #fff;
}
.ws-switcher .ws-badge.ctdt { background: #7c5cbf; }
.ws-switcher button {
  background: transparent; color: #64748b; border: 1px solid #2a2d3e;
  border-radius: 6px; padding: 4px 8px; font-size: 12px; cursor: pointer;
}
.ws-switcher button:hover { color: #4f8ef7; border-color: #4f8ef7; }
.ws-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex;
  align-items: center; justify-content: center; z-index: 9999;
}
.ws-modal {
  background: #1a1d27; border: 1px solid #2a2d3e; border-radius: 8px;
  padding: 20px; min-width: 380px; color: #e2e8f0;
}
.ws-modal h3 { margin-bottom: 12px; font-size: 14px; color: #4f8ef7; }
.ws-modal label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin: 10px 0 4px; }
.ws-modal input, .ws-modal select, .ws-modal textarea {
  width: 100%; background: #22263a; color: #e2e8f0; border: 1px solid #2a2d3e;
  border-radius: 4px; padding: 6px 8px; font-size: 13px; font-family: inherit;
}
.ws-modal textarea { resize: vertical; min-height: 60px; }
.ws-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
.ws-modal-actions button { padding: 6px 14px; font-size: 13px; border-radius: 4px; cursor: pointer; border: none; }
.ws-modal-actions .primary { background: #4f8ef7; color: #fff; }
.ws-modal-actions .ghost { background: #22263a; color: #e2e8f0; border: 1px solid #2a2d3e; }

/* Nav links rendered dynamically by workspace-switcher */
.nav-link.ws-soon { opacity: .55; cursor: not-allowed; }
.nav-link.ws-soon::after {
  content: 'sắp có';
  font-size: 9px; font-weight: 700; letter-spacing: .5px;
  background: #e0a847; color: #0f1117; padding: 1px 5px; border-radius: 3px;
  margin-left: 6px; text-transform: uppercase;
}

/* Mismatch banner: visible when current page does not belong to current workspace type */
.ws-mismatch-banner {
  background: #3b2f1a; border-bottom: 2px solid #e0a847; color: #f0d97a;
  padding: 8px 16px; font-size: 12px; display: flex; align-items: center; gap: 10px;
}
.ws-mismatch-banner strong { color: #fff; }
.ws-mismatch-banner a { color: #4f8ef7; text-decoration: underline; cursor: pointer; }
`;
    const s = document.createElement('style');
    s.id = 'ws-switcher-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  async function loadWorkspaces() {
    const r = await fetch('/api/workspaces');
    return r.json();
  }

  function rebuildNav(nav, type) {
    // Remove existing nav-link anchors (keep .brand and #ws-switcher)
    nav.querySelectorAll('a.nav-link').forEach(el => el.remove());
    const switcher = nav.querySelector('#ws-switcher');
    const items = MENUS[type] || MENUS.CSGD;
    const here = location.pathname.replace(/\/$/, '') || '/';
    const frag = document.createDocumentFragment();
    for (const it of items) {
      const a = document.createElement('a');
      a.className = 'nav-link';
      const isActive = (here === it.href) || (here === '' && it.href === '/');
      if (isActive) a.classList.add('active');
      if (it.soon)  a.classList.add('ws-soon');
      a.href = it.soon ? '#' : it.href;
      a.innerHTML = `${it.icon} ${it.label}`;
      if (it.soon) a.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Module này sắp có. Đang được triển khai trong các Increment kế tiếp.');
      });
      frag.appendChild(a);
    }
    if (switcher) nav.insertBefore(frag, switcher);
    else nav.appendChild(frag);
  }

  function showMismatchBannerIfNeeded(type) {
    const here = location.pathname.replace(/\/$/, '') || '/';
    const allowed = (MENUS[type] || []).map(m => m.href);
    if (allowed.includes(here)) return;
    // Pages that exist but are not in current workspace's menu = mismatch
    const banner = document.createElement('div');
    banner.className = 'ws-mismatch-banner';
    banner.innerHTML = `
      ⚠️ <strong>Trang này không thuộc workspace hiện tại</strong> (${type}).
      <a id="ws-go-home">Về trang chủ workspace</a>
      <a id="ws-go-csgd">hoặc chuyển sang workspace CSGD</a>
    `;
    const body = document.body;
    body.insertBefore(banner, body.firstChild);
    document.getElementById('ws-go-home').onclick = () => {
      const home = (MENUS[type] || [])[0];
      if (home) location.href = home.href;
    };
    document.getElementById('ws-go-csgd').onclick = async () => {
      const r = await fetch('/api/workspaces');
      const data = await r.json();
      const csgd = data.items.find(w => w.type === 'CSGD');
      if (csgd) { setCookie(COOKIE, String(csgd.id)); location.reload(); }
    };
  }

  function render(data) {
    const nav = document.querySelector('.topnav');
    if (!nav) return;
    let host = document.getElementById('ws-switcher');
    if (!host) {
      host = document.createElement('div');
      host.id = 'ws-switcher';
      host.className = 'ws-switcher';
      nav.appendChild(host);
    }
    const current = data.items.find(w => w.current) || data.items[0];
    const badge = current.type === 'CSGD'
      ? '<span class="ws-badge">CSGD</span>'
      : '<span class="ws-badge ctdt">CTĐT</span>';
    host.innerHTML = `
      <span class="ws-label">Workspace</span>
      ${badge}
      <select id="ws-select" title="Chuyển workspace">
        ${data.items.map(w => `<option value="${w.id}" ${w.id === current.id ? 'selected' : ''}>${w.name} · ${w.law}</option>`).join('')}
      </select>
      <button id="ws-new" title="Tạo workspace mới">+ Mới</button>
    `;
    document.getElementById('ws-select').addEventListener('change', (e) => {
      setCookie(COOKIE, e.target.value);
      location.reload();
    });
    document.getElementById('ws-new').addEventListener('click', openCreateModal);

    // Inc3: rebuild nav menu based on workspace type, then warn if page mismatch.
    rebuildNav(nav, current.type);
    showMismatchBannerIfNeeded(current.type);
  }

  function openCreateModal() {
    const overlay = document.createElement('div');
    overlay.className = 'ws-modal-overlay';
    overlay.innerHTML = `
      <div class="ws-modal">
        <h3>Tạo Workspace mới</h3>
        <label>Loại workspace</label>
        <select id="m-type">
          <option value="CSGD">CSGD — Kiểm định Cơ sở Giáo dục (TT26/2026)</option>
          <option value="CTDT">CTĐT — Kiểm định Chương trình Đào tạo (TT04/2025)</option>
        </select>
        <label>Tên workspace</label>
        <input id="m-name" placeholder="Ví dụ: CTĐT CNTT 2026">
        <label>Mô tả (tuỳ chọn)</label>
        <textarea id="m-desc" placeholder="Ghi chú về kỳ kiểm định, ngành, khóa..."></textarea>
        <div class="ws-modal-actions">
          <button class="ghost" id="m-cancel">Hủy</button>
          <button class="primary" id="m-save">Tạo</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#m-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#m-save').onclick = async () => {
      const name = overlay.querySelector('#m-name').value.trim();
      const type = overlay.querySelector('#m-type').value;
      const description = overlay.querySelector('#m-desc').value.trim();
      if (!name) { alert('Vui lòng nhập tên workspace'); return; }
      const r = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description }),
      });
      const data = await r.json();
      if (!r.ok) { alert(data.error || 'Lỗi'); return; }
      setCookie(COOKIE, String(data.id));
      location.reload();
    };
  }

  function injectDemoBannerIfVercel() {
    if (!location.hostname.endsWith('.vercel.app')) return;
    if (document.getElementById('vercel-demo-banner')) return;
    const b = document.createElement('div');
    b.id = 'vercel-demo-banner';
    b.style.cssText = 'background:#3b2f1a;border-bottom:1px solid #e0a847;color:#f0d97a;padding:6px 16px;font-size:11px;text-align:center;';
    b.innerHTML = '⚠️ <b>Chế độ demo trên Vercel</b> — dữ liệu mới thêm có thể reset sau ~15 phút không hoạt động (serverless <code>/tmp</code> là ephemeral). Dữ liệu mẫu sẽ được khôi phục tự động. Production cần DB ngoài (Supabase/Neon/MongoDB).';
    document.body.insertBefore(b, document.body.firstChild);
  }

  async function init() {
    injectStyles();
    injectDemoBannerIfVercel();
    try {
      const data = await loadWorkspaces();
      if (!data.items || data.items.length === 0) return;
      render(data);
    } catch (e) {
      console.warn('workspace-switcher: load failed', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
