import { PROJECTS as STATIC_PROJECTS } from './projects.js';
import { SUPABASE_URL, SUPABASE_KEY, ADMIN_EMAIL, TABLE, BUCKET } from './supabase-config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Supabase init ─────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── State ─────────────────────────────────────────────────────────────────────
let projects = [];
let selectedDocId = null;
let pendingImageFile = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loginScreen  = document.getElementById('loginScreen');
const dashboard    = document.getElementById('dashboard');
const loginError   = document.getElementById('loginError');
const loginEmailInput = document.getElementById('loginEmail');
const loginBtn     = document.getElementById('loginBtn');
const loginSentMsg = document.getElementById('loginSentMsg');
const logoutBtn    = document.getElementById('logoutBtn');
const addBtn       = document.getElementById('addBtn');
const seedBtn      = document.getElementById('seedBtn');
const projectsList = document.getElementById('projectsList');
const listEmpty    = document.getElementById('listEmpty');
const countBadge   = document.getElementById('projectCountBadge');
const editPanel    = document.getElementById('editPanel');
const closePanelBtn= document.getElementById('closePanelBtn');
const panelTitle   = document.getElementById('panelTitle');
const projectForm  = document.getElementById('projectForm');
const saveBtn      = document.getElementById('saveBtn');
const saveBtnText  = document.getElementById('saveBtnText');
const saveBtnSpinner=document.getElementById('saveBtnSpinner');
const deleteBtn    = document.getElementById('deleteBtn');
const deleteModal  = document.getElementById('deleteModal');
const deleteModalName = document.getElementById('deleteModalName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn  = document.getElementById('cancelDeleteBtn');
const toast        = document.getElementById('toast');

const imageFile    = document.getElementById('imageFile');
const imageUrl     = document.getElementById('imageUrl');
const previewImg   = document.getElementById('previewImg');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Form fields
const fieldDocId   = document.getElementById('fieldDocId');
const fieldTitle   = document.getElementById('fieldTitle');
const fieldEmoji   = document.getElementById('fieldEmoji');
const fieldDesc    = document.getElementById('fieldDesc');
const fieldLink    = document.getElementById('fieldLink');
const fieldYear    = document.getElementById('fieldYear');
const fieldCategory= document.getElementById('fieldCategory');
const fieldOrder   = document.getElementById('fieldOrder');
const fieldTags    = document.getElementById('fieldTags');

// ── Auth — Magic Link (OTP) ───────────────────────────────────────────────────
loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  const email = loginEmailInput.value.trim();
  if (!email) {
    loginError.textContent = 'יש להזין כתובת מייל.';
    loginEmailInput.focus();
    return;
  }
  if (email !== ADMIN_EMAIL) {
    loginError.textContent = 'גישה מורשית לבעל האתר בלבד.';
    return;
  }
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    });
    if (error) throw error;
    if (loginSentMsg) loginSentMsg.classList.remove('hidden');
    loginBtn.disabled = true;
  } catch (e) {
    loginError.textContent = 'שגיאה בשליחה. נסה שוב.';
  }
});

logoutBtn.addEventListener('click', () => supabase.auth.signOut());

supabase.auth.onAuthStateChange((event, session) => {
  if (session && session.user && session.user.email === ADMIN_EMAIL) {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadProjects();
  } else {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
    if (loginBtn) loginBtn.disabled = false;
    if (loginSentMsg) loginSentMsg.classList.add('hidden');
  }
});

// ── Load projects from Supabase ───────────────────────────────────────────────
async function loadProjects() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('order', { ascending: true });

  if (!error && data) {
    projects = data.map(row => ({
      docId: row.id,
      ...row,
      desc: row.description || row.desc || '',
      imageUrl: row.image_url || row.imageUrl || null
    }));
  } else {
    projects = [];
  }
  renderSidebar();
  if (seedBtn) seedBtn.classList.toggle('hidden', projects.length > 0);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function renderSidebar() {
  projectsList.querySelectorAll('.list-item').forEach(el => el.remove());
  countBadge.textContent = `${projects.length} פרויקטים`;
  listEmpty.classList.toggle('hidden', projects.length > 0);

  projects.forEach(p => {
    const item = document.createElement('div');
    item.className = 'list-item' + (p.docId === selectedDocId ? ' active' : '');
    item.dataset.id = p.docId;

    const thumb = p.imageUrl
      ? `<img class="list-item-img" src="${p.imageUrl}" alt="" />`
      : `<span class="list-item-emoji">${p.emoji || '📱'}</span>`;

    item.innerHTML = `
      ${thumb}
      <div class="list-item-info">
        <div class="list-item-title">${escHtml(p.title)}</div>
        <div class="list-item-meta">${catLabel(p.category)} · ${p.year || ''}</div>
      </div>
      <span class="list-item-order">${p.order ?? '-'}</span>
    `;
    item.addEventListener('click', () => openEditPanel(p.docId));
    projectsList.appendChild(item);
  });
}

// ── Add / Edit panel ──────────────────────────────────────────────────────────
addBtn.addEventListener('click', () => openNewPanel());
closePanelBtn.addEventListener('click', closePanel);

function openNewPanel() {
  selectedDocId = null;
  panelTitle.textContent = 'פרויקט חדש';
  projectForm.reset();
  fieldDocId.value = '';
  fieldYear.value = new Date().getFullYear().toString();
  fieldOrder.value = projects.length;
  clearImagePreview();
  pendingImageFile = null;
  deleteBtn.classList.add('hidden');
  editPanel.classList.remove('hidden');
  updateSidebarActive();
  fieldTitle.focus();
}

function openEditPanel(docId) {
  const p = projects.find(x => x.docId === docId);
  if (!p) return;
  selectedDocId = docId;
  panelTitle.textContent = 'עריכת פרויקט';
  fieldDocId.value = docId;
  fieldTitle.value = p.title || '';
  fieldEmoji.value = p.emoji || '';
  fieldDesc.value = p.desc || p.description || '';
  fieldLink.value = p.link || '';
  fieldYear.value = p.year || '';
  fieldCategory.value = p.category || 'app';
  fieldOrder.value = p.order ?? '';
  fieldTags.value = (p.tags || []).join(', ');
  imageUrl.value = '';
  pendingImageFile = null;
  if (p.imageUrl) {
    showImagePreview(p.imageUrl);
    imageUrl.value = p.imageUrl;
  } else {
    clearImagePreview();
  }
  deleteBtn.classList.remove('hidden');
  editPanel.classList.remove('hidden');
  updateSidebarActive();
}

function closePanel() {
  editPanel.classList.add('hidden');
  selectedDocId = null;
  updateSidebarActive();
}

function updateSidebarActive() {
  document.querySelectorAll('.list-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === selectedDocId);
  });
}

// ── Image preview ─────────────────────────────────────────────────────────────
imageFile.addEventListener('change', () => {
  const file = imageFile.files[0];
  if (!file) return;
  pendingImageFile = file;
  imageUrl.value = '';
  const reader = new FileReader();
  reader.onload = e => showImagePreview(e.target.result);
  reader.readAsDataURL(file);
});

imageUrl.addEventListener('input', () => {
  const url = imageUrl.value.trim();
  if (url) {
    pendingImageFile = null;
    imageFile.value = '';
    showImagePreview(url);
  } else {
    clearImagePreview();
  }
});

function showImagePreview(src) {
  previewImg.src = src;
  previewImg.classList.remove('hidden');
  previewPlaceholder.classList.add('hidden');
}
function clearImagePreview() {
  previewImg.src = '';
  previewImg.classList.add('hidden');
  previewPlaceholder.classList.remove('hidden');
}

// ── Upload image to Supabase Storage ─────────────────────────────────────────
// NOTE: Run this SQL in the Supabase SQL editor to set up storage policies:
//
//   create policy "Admin upload" on storage.objects for insert
//     with check (bucket_id = 'portfolio-images' and auth.email() = 'amichai85@gmail.com');
//
//   create policy "Public read" on storage.objects for select
//     using (bucket_id = 'portfolio-images');
//
async function uploadImage(file, docId) {
  uploadProgress.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = 'מעלה...';

  const ext = file.name.split('.').pop();
  const path = `${docId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  uploadProgress.classList.add('hidden');
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── Save project ──────────────────────────────────────────────────────────────
projectForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!fieldTitle.value.trim()) {
    showToast('יש למלא שם פרויקט', 'error');
    fieldTitle.focus();
    return;
  }
  setSaving(true);

  try {
    const docId = fieldDocId.value || crypto.randomUUID();
    let finalImageUrl = imageUrl.value.trim() || null;

    if (pendingImageFile) {
      try {
        finalImageUrl = await uploadImage(pendingImageFile, docId);
      } catch (uploadErr) {
        showToast('שגיאה בהעלאת תמונה — ודא שהגדרת את מדיניות האחסון ב-Supabase', 'error');
        setSaving(false);
        return;
      }
    }

    const record = {
      id:          docId,
      title:       fieldTitle.value.trim(),
      emoji:       fieldEmoji.value.trim() || '📱',
      description: fieldDesc.value.trim(),
      link:        fieldLink.value.trim() || null,
      year:        fieldYear.value.trim() || new Date().getFullYear().toString(),
      category:    fieldCategory.value,
      order:       parseInt(fieldOrder.value) || 0,
      tags:        fieldTags.value.split(',').map(t => t.trim()).filter(Boolean),
      image_url:   finalImageUrl
    };

    const { error } = await supabase.from(TABLE).upsert(record);
    if (error) throw error;

    pendingImageFile = null;
    showToast('נשמר בהצלחה ✓', 'success');
    selectedDocId = docId;
    fieldDocId.value = docId;
    deleteBtn.classList.remove('hidden');
    panelTitle.textContent = 'עריכת פרויקט';

    // Reload project list to reflect changes
    await loadProjects();
    updateSidebarActive();
  } catch (err) {
    showToast('שגיאה בשמירה: ' + err.message, 'error');
  } finally {
    setSaving(false);
  }
});

function setSaving(on) {
  saveBtn.disabled = on;
  saveBtnText.textContent = on ? 'שומר...' : 'שמור';
  saveBtnSpinner.classList.toggle('hidden', !on);
}

// ── Delete project ────────────────────────────────────────────────────────────
deleteBtn.addEventListener('click', () => {
  const p = projects.find(x => x.docId === selectedDocId);
  if (!p) return;
  deleteModalName.textContent = p.title;
  deleteModal.classList.remove('hidden');
});

cancelDeleteBtn.addEventListener('click', () => deleteModal.classList.add('hidden'));

confirmDeleteBtn.addEventListener('click', async () => {
  deleteModal.classList.add('hidden');
  if (!selectedDocId) return;
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', selectedDocId);
    if (error) throw error;
    closePanel();
    showToast('הפרויקט נמחק', 'success');
    await loadProjects();
  } catch (err) {
    showToast('שגיאה במחיקה: ' + err.message, 'error');
  }
});

// ── Seed from static data ─────────────────────────────────────────────────────
if (seedBtn) {
  seedBtn.addEventListener('click', async () => {
    if (!confirm(`לייבא ${STATIC_PROJECTS.length} פרויקטים ל-Supabase?`)) return;
    seedBtn.disabled = true;
    try {
      for (let i = 0; i < STATIC_PROJECTS.length; i++) {
        const p = STATIC_PROJECTS[i];
        const { id, desc, image, ...rest } = p;
        const { error } = await supabase.from(TABLE).upsert({
          id,
          ...rest,
          description: desc || '',
          image_url:   image || null,
          order:       i
        });
        if (error) throw error;
      }
      showToast(`יובאו ${STATIC_PROJECTS.length} פרויקטים ✓`, 'success');
      await loadProjects();
    } catch (err) {
      showToast('שגיאה בייבוא: ' + err.message, 'error');
    } finally {
      seedBtn.disabled = false;
    }
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className = `toast show${type ? ' ' + type : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function catLabel(cat) {
  return cat === 'web' ? 'אתר' : cat === 'tool' ? 'כלי' : 'אפליקציה';
}
function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
