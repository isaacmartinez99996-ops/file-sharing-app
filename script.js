// Sistema de archivos en localStorage
const STORAGE_KEY = 'sharedFiles';
const ADMIN_KEY = 'adminPassword';
const DEFAULT_ADMIN_PASSWORD = 'admin123'; // Cambia esto a tu contraseña

let isAdmin = false;
let files = [];

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    setupEventListeners();
    checkAdminStatus();
    updateFilesList();
});

// Verificar si es admin
function checkAdminStatus() {
    const adminPassword = localStorage.getItem(ADMIN_KEY) || DEFAULT_ADMIN_PASSWORD;
    const savedAdminStatus = sessionStorage.getItem('isAdmin');
    
    if (savedAdminStatus === 'true') {
        isAdmin = true;
        showAdminPanel();
    } else {
        showAdminLogin();
    }
}

// Panel de login admin
function showAdminLogin() {
    const adminSection = document.querySelector('.admin-section');
    adminSection.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <h2>🔐 Área de Administrador</h2>
            <p style="color: #666; margin: 20px 0;">Ingresa tu contraseña para acceder</p>
            <input type="password" id="adminPassword" placeholder="Contraseña" style="
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 2px solid #667eea;
                border-radius: 8px;
                font-size: 1em;
            ">
            <button onclick="loginAdmin()" style="
                width: 100%;
                padding: 12px;
                margin-top: 15px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Entrar</button>
        </div>
    `;
}

// Login
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    const adminPassword = localStorage.getItem(ADMIN_KEY) || DEFAULT_ADMIN_PASSWORD;
    
    if (password === adminPassword) {
        sessionStorage.setItem('isAdmin', 'true');
        isAdmin = true;
        location.reload();
    } else {
        alert('❌ Contraseña incorrecta');
    }
}

// Mostrar panel admin
function showAdminPanel() {
    const adminSection = document.querySelector('.admin-section');
    adminSection.innerHTML = `
        <div class="admin-header">
            <div class="admin-status">
                <span class="admin-badge">✓ ADMINISTRADOR</span>
                <button onclick="logoutAdmin()" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 5px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85em;
                ">Cerrar Sesión</button>
            </div>
            <button class="btn-add-web" onclick="addWebFile()">
                ➕ Agregar Archivo Web
            </button>
        </div>

        <div class="upload-area" id="uploadArea">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            <input type="file" id="fileInput" multiple hidden>
        </div>
        
        <div class="admin-files">
            <h3>Archivos Cargados:</h3>
            <div id="adminFilesList" class="files-list">
                <p class="empty-message">Sin archivos aún</p>
            </div>
        </div>
    `;
    
    setupEventListeners();
}

// Logout
function logoutAdmin() {
    sessionStorage.removeItem('isAdmin');
    isAdmin = false;
    location.reload();
}

// Agregar archivo web
function addWebFile() {
    const fileName = prompt('Nombre del archivo (ej: datos.txt):');
    if (!fileName) return;
    
    const fileContent = prompt('Contenido del archivo:');
    if (fileContent === null) return;
    
    const newFile = {
        id: Date.now(),
        name: fileName,
        content: fileContent,
        type: 'text',
        createdAt: new Date().toLocaleString('es-ES')
    };
    
    files.push(newFile);
    saveFiles();
    updateFilesList();
    alert('✅ Archivo agregado exitosamente');
}

// Event listeners
function setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // Click en área de upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // Seleccionar archivos
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

// Manejar archivos
function handleFiles(fileList) {
    if (!isAdmin) {
        alert('Solo el administrador puede subir archivos');
        return;
    }
    
    for (let file of fileList) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const newFile = {
                id: Date.now() + Math.random(),
                name: file.name,
                content: e.target.result,
                type: file.type,
                size: file.size,
                createdAt: new Date().toLocaleString('es-ES')
            };
            
            files.push(newFile);
            saveFiles();
            updateFilesList();
        };
        
        reader.readAsText(file);
    }
}

// Guardar archivos
function saveFiles() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// Cargar archivos
function loadFiles() {
    const saved = localStorage.getItem(STORAGE_KEY);
    files = saved ? JSON.parse(saved) : [];
}

// Actualizar lista de archivos
function updateFilesList() {
    updateAdminList();
    updateUserList();
}

// Actualizar lista admin
function updateAdminList() {
    const adminList = document.getElementById('adminFilesList');
    if (!adminList) return;
    
    if (files.length === 0) {
        adminList.innerHTML = '<p class="empty-message">Sin archivos aún</p>';
        return;
    }
    
    adminList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <span class="file-icon">📄</span>
                <div>
                    <div class="file-name">${file.name}</div>
                    <small style="color: #999;">${file.createdAt}</small>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-icon btn-view" onclick="viewFile(${file.id})" title="Ver">👁️</button>
                <button class="btn-icon btn-delete" onclick="deleteFile(${file.id})" title="Eliminar">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Actualizar lista usuario
function updateUserList() {
    const userList = document.getElementById('userFilesList');
    if (!userList) return;
    
    if (files.length === 0) {
        userList.innerHTML = '<p class="empty-message">Sin archivos disponibles</p>';
        return;
    }
    
    userList.innerHTML = files.map(file => `
        <div class="user-file-item">
            <div class="user-file-info">
                <span class="file-icon">📄</span>
                <span class="user-file-name">${file.name}</span>
            </div>
            <div class="user-file-actions">
                <button class="btn-view-content" onclick="openContentModal(${file.id})">
                    📋 Ver & Copiar
                </button>
                <button class="btn-download" onclick="downloadFile(${file.id})">
                    📥 Descargar
                </button>
            </div>
        </div>
    `).join('');
}

// Ver archivo (admin)
function viewFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    openContentModal(id);
}

// Eliminar archivo
function deleteFile(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
        files = files.filter(f => f.id !== id);
        saveFiles();
        updateFilesList();
        alert('✅ Archivo eliminado');
    }
}

// Abrir modal de contenido
function openContentModal(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    const modal = document.getElementById('contentModal');
    document.getElementById('modalFileName').textContent = file.name;
    document.getElementById('fileContent').textContent = file.content;
    
    modal.classList.add('show');
    
    // Botones del modal
    document.getElementById('copyBtn').onclick = () => copyContent(file.content);
    document.getElementById('downloadBtn').onclick = () => downloadFile(id);
    document.getElementById('closeModal').onclick = () => modal.classList.remove('show');
}

// Copiar contenido
function copyContent(content) {
    navigator.clipboard.writeText(content).then(() => {
        alert('✅ ¡Contenido copiado al portapapeles!');
    }).catch(() => {
        alert('❌ Error al copiar');
    });
}

// Descargar archivo
function downloadFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', (e) => {
    const modal = document.getElementById('contentModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});