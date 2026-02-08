// ========================================
// 메인 앱 로직
// ========================================

let currentPage = 'dashboard';

// ========================================
// 앱 초기화
// ========================================
function initializeApp() {
    const user = getCurrentUser();
    
    if (!user) {
        location.reload();
        return;
    }
    
    updateSystemTitleDisplay();
    renderUserInfo();
    renderSidebar();
    
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);
    
    navigateToPage('dashboard');
    initializeEvaluationEvents();
}

// ========================================
// 사용자 정보 표시
// ========================================
function renderUserInfo() {
    const user = getCurrentUser();
    const roleInfo = getRoleInfo(user.role);
    
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = roleInfo.label;
}

// ========================================
// 사이드바 렌더링
// ========================================
function renderSidebar() {
    const user = getCurrentUser();
    const nav = document.getElementById('sidebar-nav');
    
    const menuItems = getMenuItems(user.role);
    
    let html = '';
    menuItems.forEach(item => {
        html += `
            <div class="nav-item" data-page="${item.id}" onclick="navigateToPage('${item.id}')">
                <i class="fas ${item.icon}"></i>
                <span>${item.label}</span>
            </div>
        `;
    });
    
    nav.innerHTML = html;
}

function getMenuItems(role) {
    if (role === 'admin') {
        return [
            { id: 'dashboard', label: '대시보드', icon: 'fa-chart-line' },
            { id: 'team-evaluation', label: '팀간 평가', icon: 'fa-star' },
            { id: 'member-evaluation', label: '팀원 평가', icon: 'fa-clipboard-check' },
            { id: 'results', label: '평가 결과', icon: 'fa-chart-bar' },
            { id: 'employee-management', label: '직원 관리', icon: 'fa-users-cog' },
            { id: 'team-management', label: '팀 관리', icon: 'fa-sitemap' },
            { id: 'settings', label: '설정', icon: 'fa-cog' }
        ];
    }
    
    if (role === 'team_leader') {
        return [
            { id: 'dashboard', label: '대시보드', icon: 'fa-chart-line' },
            { id: 'team-evaluation', label: '팀간 평가', icon: 'fa-star' },
            { id: 'member-evaluation', label: '팀원 평가', icon: 'fa-clipboard-check' },
            { id: 'settings', label: '설정', icon: 'fa-cog' }
        ];
    }
    
    return [
        { id: 'dashboard', label: '대시보드', icon: 'fa-chart-line' },
        { id: 'team-evaluation', label: '팀간 평가', icon: 'fa-star' },
        { id: 'settings', label: '설정', icon: 'fa-cog' }
    ];
}

// ========================================
// 페이지 네비게이션
// ========================================
function navigateToPage(pageId) {
    currentPage = pageId;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    renderPage(pageId);
}

function renderPage(pageId) {
    const titleEl = document.getElementById('page-title');
    const contentEl = document.getElementById('page-content');
    
    let title = '';
    let content = '';
    
    switch (pageId) {
        case 'dashboard':
            title = '대시보드';
            content = renderDashboard();
            break;
        case 'team-evaluation':
            title = '팀간 평가';
            renderTeamEvaluationPage();
            return;
        case 'member-evaluation':
            title = '팀원 평가';
            renderMemberEvaluationPage();
            return;
        case 'results':
            title = '평가 결과';
            renderResultsPage();
            return;
        case 'employee-management':
            title = '직원 관리';
            content = renderEmployeeManagementPage();
            break;
        case 'team-management':
            title = '팀 관리';
            content = renderTeamManagementPage();
            break;
        case 'settings':
            title = '설정';
            content = renderSettingsPage();
            break;
        default:
            title = '페이지를 찾을 수 없습니다';
            content = '<div class="card"><p>요청한 페이지를 찾을 수 없습니다.</p></div>';
    }
    
    titleEl.textContent = title;
    contentEl.innerHTML = content;
}

// ========================================
// 대시보드
// ========================================
function renderDashboard() {
    const user = getCurrentUser();
    
    if (user.role === 'admin') {
        return renderAdminDashboard();
    } else {
        return renderEmployeeDashboard();
    }
}

function renderAdminDashboard() {
    const teams = getTeams();
    const employees = getEmployees().filter(e => e.role !== 'admin');
    const teamEvals = getTeamEvaluations();
    const memberEvals = getMemberEvaluations();
    
    const totalPossibleTeamEvals = employees.filter(e => e.team !== null).length * 5;
    const teamEvalProgress = totalPossibleTeamEvals > 0 ? 
        (teamEvals.length / totalPossibleTeamEvals * 100).toFixed(1) : 0;
    
    const totalPossibleMemberEvals = employees.length;
    const memberEvalProgress = totalPossibleMemberEvals > 0 ? 
        (memberEvals.length / totalPossibleMemberEvals * 100).toFixed(1) : 0;
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">총 팀 수</div>
                    <div class="stat-card-icon"><i class="fas fa-sitemap"></i></div>
                </div>
                <div class="stat-card-value">${teams.length}</div>
                <div class="stat-card-subtitle">등록된 팀</div>
            </div>
            
            <div class="stat-card success">
                <div class="stat-card-header">
                    <div class="stat-card-title">총 직원 수</div>
                    <div class="stat-card-icon"><i class="fas fa-users"></i></div>
                </div>
                <div class="stat-card-value">${employees.length}</div>
                <div class="stat-card-subtitle">관리자 제외</div>
            </div>
            
            <div class="stat-card warning">
                <div class="stat-card-header">
                    <div class="stat-card-title">팀간 평가 진행률</div>
                    <div class="stat-card-icon"><i class="fas fa-star"></i></div>
                </div>
                <div class="stat-card-value">${teamEvalProgress}%</div>
                <div class="stat-card-subtitle">${teamEvals.length}/${totalPossibleTeamEvals} 완료</div>
            </div>
            
            <div class="stat-card danger">
                <div class="stat-card-header">
                    <div class="stat-card-title">팀원 평가 진행률</div>
                    <div class="stat-card-icon"><i class="fas fa-clipboard-check"></i></div>
                </div>
                <div class="stat-card-value">${memberEvalProgress}%</div>
                <div class="stat-card-subtitle">${memberEvals.length}/${totalPossibleMemberEvals} 완료</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-info-circle"></i> 관리자 안내</h3>
            </div>
            <div class="card-body">
                <p>전체 관리자로서 모든 평가 데이터를 관리하고 조회할 수 있습니다.</p>
                <ul style="margin-top: 1rem; padding-left: 1.5rem;">
                    <li><strong>팀간 평가</strong>: 다른 팀을 평가할 수 있습니다 (선택사항)</li>
                    <li><strong>팀원 평가</strong>: 모든 직원을 평가할 수 있습니다</li>
                    <li><strong>평가 결과</strong>: 모든 팀과 직원의 평가 결과를 확인할 수 있습니다</li>
                    <li><strong>직원 관리</strong>: 직원 추가, 수정, 삭제가 가능합니다</li>
                    <li><strong>팀 관리</strong>: 팀 추가, 수정, 삭제가 가능합니다</li>
                </ul>
            </div>
        </div>
    `;
    
    return html;
}

function renderEmployeeDashboard() {
    const user = getCurrentUser();
    const teams = getTeams();
    
    const otherTeams = teams.filter(t => t.id !== user.team);
    const myTeamEvals = getTeamEvaluationsByEvaluator(user.name);
    const teamEvalProgress = otherTeams.length > 0 ? 
        (myTeamEvals.length / otherTeams.length * 100).toFixed(1) : 0;
    
    let memberEvalHtml = '';
    if (user.role === 'team_leader') {
        const teamMembers = getEmployeesByTeam(user.team).filter(e => e.id !== user.id);
        const myMemberEvals = getMemberEvaluationsByEvaluator(user.name);
        const memberEvalProgress = teamMembers.length > 0 ? 
            (myMemberEvals.length / teamMembers.length * 100).toFixed(1) : 0;
        
        memberEvalHtml = `
            <div class="stat-card warning">
                <div class="stat-card-header">
                    <div class="stat-card-title">팀원 평가 진행률</div>
                    <div class="stat-card-icon"><i class="fas fa-clipboard-check"></i></div>
                </div>
                <div class="stat-card-value">${memberEvalProgress}%</div>
                <div class="stat-card-subtitle">${myMemberEvals.length}/${teamMembers.length} 완료</div>
            </div>
        `;
    }
    
    const team = getTeamById(user.team);
    const roleInfo = getRoleInfo(user.role);
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <div class="stat-card-title">내 정보</div>
                    <div class="stat-card-icon"><i class="fas ${roleInfo.icon}"></i></div>
                </div>
                <div class="stat-card-value">${user.name}</div>
                <div class="stat-card-subtitle">
                    ${team ? `<span class="team-badge" style="background-color: ${team.color}">${team.name}</span>` : ''}
                    <span class="badge ${roleInfo.badge} ml-1">${roleInfo.label}</span>
                </div>
            </div>
            
            <div class="stat-card success">
                <div class="stat-card-header">
                    <div class="stat-card-title">팀간 평가 진행률</div>
                    <div class="stat-card-icon"><i class="fas fa-star"></i></div>
                </div>
                <div class="stat-card-value">${teamEvalProgress}%</div>
                <div class="stat-card-subtitle">${myTeamEvals.length}/${otherTeams.length} 완료</div>
            </div>
            
            ${memberEvalHtml}
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-tasks"></i> 할 일</h3>
            </div>
            <div class="card-body">
                <ul style="padding-left: 1.5rem;">
                    ${myTeamEvals.length < otherTeams.length ? 
                        '<li><strong>팀간 평가</strong>: 아직 평가하지 않은 팀이 있습니다.</li>' : 
                        '<li><i class="fas fa-check" style="color: var(--success-color);"></i> 팀간 평가를 모두 완료했습니다!</li>'}
                    ${user.role === 'team_leader' ? 
                        (memberEvalHtml.includes('100%') ? 
                            '<li><i class="fas fa-check" style="color: var(--success-color);"></i> 팀원 평가를 모두 완료했습니다!</li>' : 
                            '<li><strong>팀원 평가</strong>: 아직 평가하지 않은 팀원이 있습니다.</li>') 
                        : ''}
                </ul>
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h3><i class="fas fa-info-circle"></i> 안내</h3>
            </div>
            <div class="card-body">
                <p><strong>평가 결과는 관리자만 확인할 수 있습니다.</strong></p>
                <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                    평가 시스템은 투명하고 공정한 평가를 위해 결과를 관리자에게만 공개합니다.
                    평가에 참여해주셔서 감사합니다!
                </p>
            </div>
        </div>
    `;
    
    return html;
}

// ========================================
// 설정 페이지
// ========================================
function renderSettingsPage() {
    const user = getCurrentUser();
    const canChangePassword = user.role !== 'admin';
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-user-circle"></i> 내 정보</h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label>이름</label>
                    <input type="text" value="${user.name}" disabled style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                </div>
                <div class="form-group">
                    <label>역할</label>
                    <input type="text" value="${getRoleInfo(user.role).label}" disabled style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                </div>
                ${user.team ? `
                <div class="form-group">
                    <label>팀</label>
                    <input type="text" value="${getTeamById(user.team)?.name || '-'}" disabled style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    if (canChangePassword) {
        html += `
            <div class="card mt-3">
                <div class="card-header">
                    <h3><i class="fas fa-key"></i> 비밀번호 변경</h3>
                </div>
                <div class="card-body">
                    <form id="change-password-form">
                        <div class="form-group">
                            <label>현재 비밀번호</label>
                            <input type="password" id="current-password" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                        </div>
                        <div class="form-group">
                            <label>새 비밀번호</label>
                            <input type="password" id="new-password-setting" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                        </div>
                        <div class="form-group">
                            <label>새 비밀번호 확인</label>
                            <input type="password" id="confirm-password-setting" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> 비밀번호 변경
                        </button>
                    </form>
                    <div id="password-change-error" class="error-message"></div>
                    <div id="password-change-success" class="success-message"></div>
                </div>
            </div>
        `;
    }
    
    if (user.role === 'admin') {
        const currentTitle = getSystemTitle();
        html += `
            <div class="card mt-3">
                <div class="card-header">
                    <h3><i class="fas fa-heading"></i> 시스템 타이틀 변경</h3>
                </div>
                <div class="card-body">
                    <form id="change-title-form">
                        <div class="form-group">
                            <label>시스템 타이틀</label>
                            <input type="text" id="system-title-input" value="${currentTitle}" placeholder="예: Working Together Review 🤝" style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 1rem; width: 100%;">
                            <small>브라우저 탭과 로그인 페이지에 표시되는 타이틀입니다.</small>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> 타이틀 변경
                        </button>
                    </form>
                    <div id="title-change-error" class="error-message"></div>
                    <div id="title-change-success" class="success-message"></div>
                </div>
            </div>
            
            <div class="card mt-3">
                <div class="card-header">
                    <h3><i class="fas fa-database"></i> 데이터 관리</h3>
                </div>
                <div class="card-body">
                    <p>시스템의 모든 데이터를 관리할 수 있습니다.</p>
                    <button class="btn btn-danger mt-2" onclick="confirmResetData()">
                        <i class="fas fa-trash-restore"></i> 모든 데이터 초기화
                    </button>
                </div>
            </div>
        `;
    }
    
    setTimeout(() => {
        const form = document.getElementById('change-password-form');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                handlePasswordChange();
            };
        }
        
        const titleForm = document.getElementById('change-title-form');
        if (titleForm) {
            titleForm.onsubmit = function(e) {
                e.preventDefault();
                handleTitleChange();
            };
        }
    }, 100);
    
    return html;
}

function handlePasswordChange() {
    const user = getCurrentUser();
    const currentPwd = document.getElementById('current-password').value;
    const newPwd = document.getElementById('new-password-setting').value;
    const confirmPwd = document.getElementById('confirm-password-setting').value;
    const errorEl = document.getElementById('password-change-error');
    const successEl = document.getElementById('password-change-success');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    successEl.textContent = '';
    successEl.classList.remove('show');
    
    if (!currentPwd || !newPwd || !confirmPwd) {
        errorEl.textContent = '모든 필드를 입력하세요.';
        errorEl.classList.add('show');
        return;
    }
    
    if (newPwd !== confirmPwd) {
        errorEl.textContent = '새 비밀번호가 일치하지 않습니다.';
        errorEl.classList.add('show');
        return;
    }
    
    try {
        changePassword(user.name, currentPwd, newPwd);
        successEl.textContent = '비밀번호가 성공적으로 변경되었습니다!';
        successEl.classList.add('show');
        
        document.getElementById('change-password-form').reset();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.add('show');
    }
}

function handleTitleChange() {
    const titleInput = document.getElementById('system-title-input').value.trim();
    const errorEl = document.getElementById('title-change-error');
    const successEl = document.getElementById('title-change-success');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    successEl.textContent = '';
    successEl.classList.remove('show');
    
    if (!titleInput) {
        errorEl.textContent = '타이틀을 입력하세요.';
        errorEl.classList.add('show');
        return;
    }
    
    try {
        saveSystemTitle(titleInput);
        successEl.textContent = '시스템 타이틀이 성공적으로 변경되었습니다!';
        successEl.classList.add('show');
        showToast('타이틀이 변경되었습니다!', 'success');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.add('show');
    }
}

function confirmResetData() {
    showConfirmModal(
        '데이터 초기화',
        '정말 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 평가 데이터가 삭제됩니다.',
        () => {
            resetAllData();
            showToast('데이터가 초기화되었습니다. 페이지를 새로고침합니다.', 'info');
            setTimeout(() => {
                location.reload();
            }, 2000);
        }
    );
}

// ========================================
// 유틸리티 함수
// ========================================
function updateCurrentTime() {
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        const now = new Date();
        const timeStr = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        timeEl.textContent = timeStr;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

function showError(element, message) {
    if (typeof element === 'string') {
        // 문자열로 메시지만 전달된 경우 alert 표시
        alert(element);
        return;
    }
    if (element && typeof element === 'object') {
        element.textContent = message;
        element.classList.add('show');
    }
}

// ========================================
// 페이지 로드 시 세션 체크
// ========================================
window.addEventListener('load', function() {
    console.log('🚀 페이지 로드 완료');
    // auth.js의 checkSession 함수 호출
    checkSession();
});
