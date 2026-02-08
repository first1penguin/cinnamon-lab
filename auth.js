// ========================================
// 인증 및 세션 관리
// ========================================

let currentUser = null;

// ========================================
// 세션 관리
// ========================================

function saveSession(user) {
    currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

function loadSession() {
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
        currentUser = JSON.parse(saved);
    }
    return currentUser;
}

function clearSession() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
}

function getCurrentUser() {
    if (!currentUser) {
        loadSession();
    }
    return currentUser;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ========================================
// 로그인 처리
// ========================================

function attemptLogin(name, password) {
    const employee = getEmployeeByName(name);
    
    if (!employee) {
        throw new Error('존재하지 않는 사용자입니다');
    }
    
    // 비밀번호가 설정되지 않은 경우
    if (!hasPassword(name)) {
        return {
            needsPasswordSetup: true,
            employee: employee
        };
    }
    
    // 비밀번호 확인
    if (!verifyPassword(name, password)) {
        throw new Error('비밀번호가 일치하지 않습니다');
    }
    
    // 로그인 성공
    const user = {
        ...employee,
        loginTime: new Date().toISOString()
    };
    
    saveSession(user);
    return { success: true, user };
}

function setupPassword(name, password) {
    if (!password || password.length < 4) {
        throw new Error('비밀번호는 4자 이상이어야 합니다');
    }
    
    const employee = getEmployeeByName(name);
    if (!employee) {
        throw new Error('존재하지 않는 사용자입니다');
    }
    
    // 비밀번호 저장
    savePassword(name, password);
    
    // 로그인 처리
    const user = {
        ...employee,
        loginTime: new Date().toISOString()
    };
    
    saveSession(user);
    return user;
}

function changePassword(name, currentPassword, newPassword) {
    // 관리자는 비밀번호 변경 불가
    const user = getEmployeeByName(name);
    if (user && user.role === 'admin' && name === '김지안') {
        throw new Error('관리자 계정의 비밀번호는 변경할 수 없습니다');
    }
    
    if (!verifyPassword(name, currentPassword)) {
        throw new Error('현재 비밀번호가 일치하지 않습니다');
    }
    
    if (!newPassword || newPassword.length < 4) {
        throw new Error('새 비밀번호는 4자 이상이어야 합니다');
    }
    
    savePassword(name, newPassword);
}

function logout() {
    clearSession();
    showPage('login-page');
}

// ========================================
// 권한 확인
// ========================================

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function isTeamLeader() {
    const user = getCurrentUser();
    return user && user.role === 'team_leader';
}

function isEmployee() {
    const user = getCurrentUser();
    return user && user.role === 'employee';
}

function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

function canAccessResults() {
    return isAdmin();
}

function canManageTeams() {
    return isAdmin();
}

function canManageEmployees() {
    return isAdmin();
}

function canEvaluateMembers(role) {
    return role === 'team_leader' || role === 'admin';
}

function canEvaluateTeams() {
    return !isAdmin();
}

// ========================================
// 역할 정보
// ========================================

function getRoleInfo(role) {
    const roles = {
        'admin': {
            label: '관리자',
            badge: 'badge-admin',
            icon: 'fas fa-user-shield'
        },
        'team_leader': {
            label: '팀장',
            badge: 'badge-leader',
            icon: 'fas fa-user-tie'
        },
        'employee': {
            label: '팀원',
            badge: 'badge-employee',
            icon: 'fas fa-user'
        }
    };
    return roles[role] || roles['employee'];
}

// ========================================
// UI 헬퍼
// ========================================

function showError(message) {
    alert(message);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function showMainApp() {
    showPage('main-app');
}

function checkSession() {
    const user = loadSession();
    if (user) {
        showMainApp();
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    } else {
        showPage('login-page');
    }
}

// ========================================
// 이벤트 핸들러
// ========================================

// 전역 변수로 비밀번호 설정할 사용자 이름 저장
let passwordSetupUserName = null;

function handleLogin(e) {
    e.preventDefault();
    
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!name) {
        showError('이름을 입력해주세요');
        return;
    }
    
    try {
        const result = attemptLogin(name, password);
        
        if (result.needsPasswordSetup) {
            // 비밀번호 설정 필요
            passwordSetupUserName = name;
            showPage('password-setup-page');
            
            // 입력 필드 초기화
            setTimeout(() => {
                const setupPassword = document.getElementById('setup-password');
                const setupConfirm = document.getElementById('setup-password-confirm');
                if (setupPassword) setupPassword.value = '';
                if (setupConfirm) setupConfirm.value = '';
                if (setupPassword) setupPassword.focus();
            }, 100);
        } else {
            // 로그인 성공
            showMainApp();
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
        }
    } catch (error) {
        showError(error.message);
    }
}

function handlePasswordSetup(e) {
    e.preventDefault();
    
    const name = passwordSetupUserName;
    const password = document.getElementById('setup-password').value;
    const confirmPassword = document.getElementById('setup-password-confirm').value;
    
    if (!name) {
        showError('사용자 이름을 찾을 수 없습니다. 다시 로그인해주세요.');
        showPage('login-page');
        return;
    }
    
    if (!password) {
        showError('비밀번호를 입력해주세요');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('비밀번호가 일치하지 않습니다');
        return;
    }
    
    if (password.length < 4) {
        showError('비밀번호는 4자 이상이어야 합니다');
        return;
    }
    
    try {
        setupPassword(name, password);
        passwordSetupUserName = null; // 초기화
        showMainApp();
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    } catch (error) {
        showError(error.message);
    }
}

function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        logout();
        // 로그인 페이지 입력 필드 초기화
        const loginName = document.getElementById('login-name');
        const loginPassword = document.getElementById('login-password');
        if (loginName) loginName.value = '';
        if (loginPassword) loginPassword.value = '';
        if (loginName) loginName.focus();
    }
}

// ========================================
// 초기화 (중복 방지)
// ========================================

let authInitialized = false;

function initializeAuth() {
    if (authInitialized) {
        console.log('⚠️ Auth 이미 초기화됨, 중복 실행 방지');
        return;
    }
    
    console.log('🔐 Auth 초기화 시작...');
    
    // 로그인 폼
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ 로그인 폼 이벤트 연결 완료');
    } else {
        console.error('❌ login-form을 찾을 수 없습니다');
    }
    
    // 비밀번호 설정 폼
    const setupForm = document.getElementById('password-setup-form');
    if (setupForm) {
        setupForm.addEventListener('submit', handlePasswordSetup);
        console.log('✅ 비밀번호 설정 폼 이벤트 연결 완료');
    } else {
        console.error('❌ password-setup-form을 찾을 수 없습니다');
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
        console.log('✅ 로그아웃 버튼 이벤트 연결 완료');
    }
    
    authInitialized = true;
    console.log('🔐 Auth 초기화 완료');
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}
