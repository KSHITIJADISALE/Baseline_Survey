/* DMF Baseline Survey — Shared JavaScript */

// ── Section Toggle ──

function addRow(btn) {

  const tbody = btn.closest(".form-section").querySelector("tbody");

  const row = document.createElement("tr");

row.innerHTML = `
  <td>
    <input type="text" placeholder="Enter Survey Question" style="width:100%">
  </td>
  <td>
    <input type="text" placeholder="Enter Field Entry" style="width:100%">
  </td>
  <td>
    <button type="button" onclick="this.closest('tr').remove()">❌</button>
  </td>
`;


  tbody.appendChild(row);
}
let sectionCount = 0;

function addCustomSection(btn, containerId) {
  sectionCount++;

  const container = document.getElementById(containerId);

  const section = document.createElement("div");
  section.className = "form-section";
  section.style.marginTop = "15px";

  section.innerHTML = `
  <div class="form-section-header">
    <span class="section-code">Cs-${sectionCount}</span>
    <h3 contenteditable="true">Enter Section Title</h3>
    <button type="button" onclick="this.closest('.form-section').remove()">❌</button>
  </div>

  <div class="form-section-body">
    <table class="question-table">
      <thead>
        <tr>
          <th>Survey Question</th>
          <th>Field Entry</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <div style="margin-top:10px;">
      <button type="button" class="btn btn-secondary" onclick="addRow(this)">
        ➕ Add Question
      </button>
    </div>
  </div>
`;

  container.appendChild(section);
}






function initToggles() {
  document.querySelectorAll('.form-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const icon = header.querySelector('.toggle-icon');
      const isHidden = body.classList.toggle('hidden');
      header.classList.toggle('collapsed', isHidden);
      if (icon) icon.textContent = isHidden ? '▶' : '▼';
    });
  });
}

// ── LocalStorage Save/Load ──
function getPageKey() {
  return 'dmf_' + window.location.pathname.split('/').pop().replace('.html','');
}

function saveForm() {
  const key = getPageKey();
  const data = {};
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (!el.name) return;
    if (el.type === 'radio' || el.type === 'checkbox') {
      if (el.checked) {
        if (!data[el.name]) data[el.name] = [];
        if (Array.isArray(data[el.name])) data[el.name].push(el.value);
        else data[el.name] = el.value;
      }
    } else {
      data[el.name] = el.value;
    }
  });
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {}
  showToast('✓ Draft saved locally');
}

function loadForm() {
  const key = getPageKey();
  let data;
  try { data = JSON.parse(localStorage.getItem(key)); } catch(e) {}
  if (!data) return;
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (!el.name || !(el.name in data)) return;
    if (el.type === 'radio') { if (el.value === data[el.name]) el.checked = true; }
    else if (el.type === 'checkbox') { if (Array.isArray(data[el.name]) && data[el.name].includes(el.value)) el.checked = true; }
    else { el.value = data[el.name]; }
  });
}

function clearForm() {
  if (!confirm('Clear all entered data for this sector?')) return;
  try { localStorage.removeItem(getPageKey()); } catch(e) {}
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  showToast('Form cleared');
}

function printForm() { window.print(); }

// ── Print Summary ──
function exportSummary() {
  const rows = [];
  document.querySelectorAll('.question-table tbody tr').forEach(tr => {
    const num  = tr.querySelector('.q-num')?.textContent?.trim() || '';
    const q    = tr.querySelector('.q-text')?.textContent?.trim() || '';
    const inp  = tr.querySelector('input:not([type=radio]):not([type=checkbox]), textarea, select');
    let val = '';
    if (inp) val = inp.value;
    else {
      tr.querySelectorAll('input[type=radio]:checked, input[type=checkbox]:checked')
        .forEach(c => { val += (val ? ', ' : '') + c.value; });
    }
    if (val) rows.push(`${num}: ${q}\n  → ${val}`);
  });
  if (!rows.length) { alert('No data entered yet.'); return; }
  const blob = new Blob([rows.join('\n\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = getPageKey() + '_summary.txt';
  a.click();
}

// ── Toast ──
function showToast(msg) {
  let t = document.querySelector('.save-toast');
  if (!t) { t = document.createElement('div'); t.className = 'save-toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Auto-save every 60s ──
let autoSaveTimer;
function initAutoSave() {
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('change', () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveForm, 3000);
    });
  });
}

// ── Sidebar active link ──
function initScrollSpy() {
  const sections = document.querySelectorAll('.form-section[id]');
  const links    = document.querySelectorAll('.sidebar-nav a');
  if (!sections.length || !links.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.sidebar-nav a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initToggles();
  loadForm();
  initAutoSave();
  initScrollSpy();
});
