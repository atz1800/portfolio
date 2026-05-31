import { PROJECTS as STATIC_PROJECTS } from './projects.js';
import { SUPABASE_URL, SUPABASE_KEY, ADMIN_EMAIL, TABLE, BUCKET } from './supabase-config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Supabase init ─────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── State ─────────────────────────────────────────────────────────────────────
let projects = [];
let selectedDocId = null;
let galleryImages = []; // { src: string, file: File|null }

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loginScreen  = document.getElementById('loginScreen');
const dashboard    = document.getElementById('dashboard');
const loginError        = document.getElementById('loginError');
const loginSentMsg      = document.getElementById('loginSentMsg');
const loginTitle        = document.getElementById('loginTitle');
const loginSub          = document.getElementById('loginSub');
const loginPasswordInput= document.getElementById('loginPassword');
const loginPassword2    = document.getElementById('loginPassword2');
const loginBtn          = document.getElementById('loginBtn');
const forgotPassBtn     = document.getElementById('forgotPassBtn');
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
const toast            = document.getElementById('toast');
const changePassBtn    = document.getElementById('changePassBtn');
const changePassModal  = document.getElementById('changePassModal');
const newPasswordInput = document.getElementById('newPassword');
const newPassword2Input= document.getElementById('newPassword2');
const changePassError  = document.getElementById('changePassError');
const confirmChangePassBtn = document.getElementById('confirmChangePassBtn');
const cancelChangePassBtn  = document.getElementById('cancelChangePassBtn');

const galleryGrid      = document.getElementById('galleryGrid');
const galleryImageFile = document.getElementById('galleryImageFile');
const uploadProgress   = document.getElementById('uploadProgress');
const progressFill     = document.getElementById('progressFill');
const progressText     = document.getElementById('progressText');

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

// ── Auth ──────────────────────────────────────────────────────────────────────
let recoveryMode = false;

function setRecoveryMode(on) {
  recoveryMode = on;
  loginTitle.textContent   = on ? 'קביעת סיסמה חדשה' : 'כניסת מנהל';
  loginSub.textContent     = on ? 'הכנס סיסמה חדשה' : 'כניסה מותרת לבעל האתר בלבד';
  loginBtn.textContent     = on ? 'קבע סיסמה' : 'כניסה';
  loginPassword2.classList.toggle('hidden', !on);
  forgotPassBtn.classList.toggle('hidden', on);
  loginPasswordInput.placeholder = on ? 'סיסמה חדשה' : 'סיסמה';
  loginPasswordInput.value = '';
  loginPassword2.value     = '';
  loginError.textContent   = '';
  loginPasswordInput.focus();
}

async function doLogin() {
  loginError.textContent = '';
  const password = loginPasswordInput.value;
  if (!password) { loginPasswordInput.focus(); return; }

  loginBtn.disabled = true;
  loginBtn.textContent = recoveryMode ? 'שומר...' : 'מתחבר...';

  if (recoveryMode) {
    // Set new password after recovery link
    const p2 = loginPassword2.value;
    if (password.length < 6) {
      loginError.textContent = 'סיסמה חייבת להיות לפחות 6 תווים.';
      loginBtn.disabled = false; loginBtn.textContent = 'קבע סיסמה'; return;
    }
    if (password !== p2) {
      loginError.textContent = 'הסיסמאות אינן תואמות.';
      loginBtn.disabled = false; loginBtn.textContent = 'קבע סיסמה'; return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      loginError.textContent = 'שגיאה: ' + error.message;
      loginBtn.disabled = false; loginBtn.textContent = 'קבע סיסמה';
    }
    // on success onAuthStateChange fires → dashboard shows automatically
  } else {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) throw error;
    } catch (e) {
      loginError.textContent = 'סיסמה שגויה.';
      loginBtn.disabled = false; loginBtn.textContent = 'כניסה';
      loginPasswordInput.value = ''; loginPasswordInput.focus();
    }
  }
}

loginBtn.addEventListener('click', doLogin);
loginPasswordInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
loginPassword2.addEventListener('keydown',     e => { if (e.key === 'Enter') doLogin(); });

// Forgot password → send recovery email
forgotPassBtn.addEventListener('click', async () => {
  forgotPassBtn.disabled = true;
  loginError.textContent = '';
  const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
    redirectTo: window.location.href
  });
  if (error) {
    loginError.textContent = 'שגיאה בשליחה: ' + error.message;
    forgotPassBtn.disabled = false;
  } else {
    loginSentMsg.classList.remove('hidden');
    forgotPassBtn.textContent = 'נשלח ✓';
  }
});

logoutBtn.addEventListener('click', () => supabase.auth.signOut());

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
    setRecoveryMode(true);
    return;
  }
  if (session && session.user && session.user.email === ADMIN_EMAIL) {
    setRecoveryMode(false);
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    loadProjects();
  } else {
    loginScreen.classList.remove('hidden');
    dashboard.classList.add('hidden');
    loginBtn.disabled = false;
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
      desc:     row.description || row.desc || '',
      imageUrl: row.image_url   || row.imageUrl || null,
      images:   row.images      || []
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
  galleryImages = [];
  renderGallery();
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
  galleryImages = (p.images && p.images.length > 0)
    ? p.images.filter(Boolean).map(src => ({ src, file: null }))
    : p.imageUrl ? [{ src: p.imageUrl, file: null }] : [];
  renderGallery();
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

// ── Gallery ───────────────────────────────────────────────────────────────────
function renderGallery() {
  galleryGrid.querySelectorAll('.gallery-thumb-wrap').forEach(el => el.remove());
  const addBtn = galleryGrid.querySelector('.gallery-add-btn');
  galleryImages.forEach((item, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-thumb-wrap';
    const img = document.createElement('img');
    img.className = 'gallery-thumb';
    img.src = item.src;
    img.alt = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-remove-btn';
    btn.textContent = '×';
    btn.title = 'הסר';
    btn.addEventListener('click', () => { galleryImages.splice(idx, 1); renderGallery(); });
    wrap.appendChild(img);
    wrap.appendChild(btn);
    galleryGrid.insertBefore(wrap, addBtn);
  });
}

galleryImageFile.addEventListener('change', () => {
  Array.from(galleryImageFile.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => { galleryImages.push({ src: e.target.result, file }); renderGallery(); };
    reader.readAsDataURL(file);
  });
  galleryImageFile.value = '';
});

// ── Paste image from clipboard (Ctrl+V) ──────────────────────────────────────
document.addEventListener('paste', e => {
  if (!editPanel.classList.contains('hidden')) {
    const clipItem = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
    if (clipItem) {
      const file = clipItem.getAsFile();
      const reader = new FileReader();
      reader.onload = ev => { galleryImages.push({ src: ev.target.result, file }); renderGallery(); };
      reader.readAsDataURL(file);
    }
  }
});

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

  try {
    const ext = (file.type || 'image/png').split('/')[1] || 'png';
    const path = `${docId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } finally {
    uploadProgress.classList.add('hidden');
  }
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
    // Upload any new files, keep existing URLs as-is
    const finalUrls = [];
    for (const item of galleryImages) {
      if (item.file) {
        try {
          finalUrls.push(await uploadImage(item.file, docId));
        } catch (uploadErr) {
          showToast('שגיאה בהעלאה: ' + (uploadErr.message || uploadErr), 'error');
          setSaving(false);
          return;
        }
      } else {
        finalUrls.push(item.src);
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
      image_url:   finalUrls[0] || null,
      images:      finalUrls
    };

    const { error } = await supabase.from(TABLE).upsert(record);
    if (error) throw error;

    galleryImages = finalUrls.map(src => ({ src, file: null }));
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
  toastTimer = setTimeout(() => toast.classList.remove('show'), type === 'error' ? 6000 : 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function catLabel(cat) {
  return cat === 'web' ? 'אתר' : cat === 'tool' ? 'כלי' : 'אפליקציה';
}
function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Change password ───────────────────────────────────────────────────────────
changePassBtn.addEventListener('click', () => {
  newPasswordInput.value = '';
  newPassword2Input.value = '';
  changePassError.textContent = '';
  changePassModal.classList.remove('hidden');
  newPasswordInput.focus();
});
cancelChangePassBtn.addEventListener('click', () => changePassModal.classList.add('hidden'));

confirmChangePassBtn.addEventListener('click', async () => {
  const p1 = newPasswordInput.value;
  const p2 = newPassword2Input.value;
  changePassError.textContent = '';
  if (p1.length < 6) { changePassError.textContent = 'סיסמה חייבת להיות לפחות 6 תווים.'; return; }
  if (p1 !== p2)     { changePassError.textContent = 'הסיסמאות אינן תואמות.'; return; }
  confirmChangePassBtn.disabled = true;
  const { error } = await supabase.auth.updateUser({ password: p1 });
  confirmChangePassBtn.disabled = false;
  if (error) { changePassError.textContent = 'שגיאה: ' + error.message; return; }
  changePassModal.classList.add('hidden');
  showToast('סיסמה עודכנה בהצלחה ✓', 'success');
});
