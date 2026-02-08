// ========================================
// 관리 기능 (관리자 전용)
// ========================================

let currentEditingEmployee = null;
let currentEditingTeam = null;

// ========================================
// 직원 관리 페이지
// ========================================
function renderEmployeeManagementPage() {
    if (!canManageEmployees()) {
        return renderAccessDenied();
    }
    
    const employees = getEmployees().filter(e => e.role !== 'admin');
    const teams = getTeams();
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-users-cog"></i> 직원 관리</h3>
                <button class="btn btn-primary" onclick="openEmployeeModal()">
                    <i class="fas fa-plus"></i> 직원 추가
                </button>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>이름</th>
                                <th>팀</th>
                                <th>역할</th>
                                <th>비밀번호</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    employees.forEach(emp => {
        const team = getTeamById(emp.team);
        const roleInfo = getRoleInfo(emp.role);
        const hasPwd = hasPassword(emp.name);
        
        html += `
            <tr>
                <td><strong>${emp.name}</strong></td>
                <td>
                    ${team ? `<span class="team-badge" style="background-color: ${team.color}">${team.name}</span>` : '-'}
                </td>
                <td><span class="badge ${roleInfo.badge}">${roleInfo.label}</span></td>
                <td>
                    ${hasPwd ? '<span class="badge badge-success">설정됨</span>' : '<span class="badge badge-secondary">미설정</span>'}
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="openEmployeeModal('${emp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${hasPwd ? `<button class="btn btn-sm btn-warning" onclick="resetEmployeePassword('${emp.name}')">
                        <i class="fas fa-key"></i>
                    </button>` : ''}
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteEmployee('${emp.id}', '${emp.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// ========================================
// 팀 관리 페이지
// ========================================
function renderTeamManagementPage() {
    if (!canManageTeams()) {
        return renderAccessDenied();
    }
    
    const teams = getTeams();
    
    let html = `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-sitemap"></i> 팀 관리</h3>
                <button class="btn btn-primary" onclick="openTeamModal()">
                    <i class="fas fa-plus"></i> 팀 추가
                </button>
            </div>
        </div>
        
        <div class="team-grid mt-3">
    `;
    
    teams.forEach(team => {
        const members = getTeamMembers(team.id);
        const leader = getTeamLeader(team.id);
        
        html += `
            <div class="team-card">
                <div class="team-card-header">
                    <div>
                        <span class="team-badge" style="background-color: ${team.color}">
                            ${team.name}
                        </span>
                        <div class="team-card-name">${team.name}팀</div>
                    </div>
                    <div class="team-card-actions">
                        <button class="btn btn-sm btn-icon btn-secondary" onclick="openTeamModal('${team.id}')" title="수정">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-icon btn-danger" onclick="confirmDeleteTeam('${team.id}', '${team.name}')" title="삭제">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="team-card-body">
                    <div class="team-card-info">
                        <div><i class="fas fa-users"></i> 팀원: ${members.length}명</div>
                        <div><i class="fas fa-user-tie"></i> 팀장: ${leader ? leader.name : '없음'}</div>
                    </div>
                    ${members.length > 0 ? `
                        <div class="mt-2">
                            <strong>팀원 목록:</strong>
                            <div style="margin-top: 0.5rem;">
                                ${members.map(m => {
                                    const roleInfo = getRoleInfo(m.role);
                                    return `<span class="badge ${roleInfo.badge} mr-1">${m.name}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    return html;
}

// ========================================
// 직원 모달 관리
// ========================================
function openEmployeeModal(employeeId = null) {
    const modal = document.getElementById('employee-modal');
    const title = document.getElementById('employee-modal-title');
    const nameInput = document.getElementById('emp-name');
    const teamSelect = document.getElementById('emp-team');
    const roleSelect = document.getElementById('emp-role');
    const passwordInput = document.getElementById('emp-password');
    const errorEl = document.getElementById('employee-modal-error');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    
    const teams = getTeams();
    teamSelect.innerHTML = '<option value="">팀 선택</option>';
    teams.forEach(team => {
        teamSelect.innerHTML += `<option value="${team.id}">${team.name}</option>`;
    });
    
    if (employeeId) {
        const employee = getEmployeeById(employeeId);
        if (!employee) return;
        
        title.textContent = '직원 수정';
        nameInput.value = employee.name;
        nameInput.disabled = true;
        teamSelect.value = employee.team || '';
        roleSelect.value = employee.role;
        passwordInput.value = '';
        passwordInput.placeholder = '변경하지 않으려면 비워두세요';
        
        currentEditingEmployee = employee;
    } else {
        title.textContent = '직원 추가';
        nameInput.value = '';
        nameInput.disabled = false;
        teamSelect.value = '';
        roleSelect.value = 'employee';
        passwordInput.value = '';
        passwordInput.placeholder = '미설정 시 첫 로그인에 설정';
        
        currentEditingEmployee = null;
    }
    
    modal.classList.add('active');
}

function closeEmployeeModal() {
    const modal = document.getElementById('employee-modal');
    modal.classList.remove('active');
    currentEditingEmployee = null;
}

function saveEmployee() {
    const nameInput = document.getElementById('emp-name');
    const teamSelect = document.getElementById('emp-team');
    const roleSelect = document.getElementById('emp-role');
    const passwordInput = document.getElementById('emp-password');
    const errorEl = document.getElementById('employee-modal-error');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    
    const name = nameInput.value.trim();
    const team = teamSelect.value;
    const role = roleSelect.value;
    const password = passwordInput.value;
    
    if (!name) {
        showError(errorEl, '이름을 입력하세요.');
        return;
    }
    
    if (!team) {
        showError(errorEl, '팀을 선택하세요.');
        return;
    }
    
    try {
        if (currentEditingEmployee) {
            updateEmployee(currentEditingEmployee.id, {
                team: team,
                role: role
            });
            
            if (password) {
                if (password.length < 4) {
                    showError(errorEl, '비밀번호는 최소 4자 이상이어야 합니다.');
                    return;
                }
                savePassword(name, password);
            }
            
            showToast('직원 정보가 수정되었습니다.', 'success');
        } else {
            const newEmployee = addEmployee({
                name: name,
                team: team,
                role: role
            });
            
            if (password) {
                if (password.length < 4) {
                    showError(errorEl, '비밀번호는 최소 4자 이상이어야 합니다.');
                    return;
                }
                savePassword(name, password);
            }
            
            showToast('직원이 추가되었습니다.', 'success');
        }
        
        closeEmployeeModal();
        navigateToPage('employee-management');
    } catch (error) {
        showError(errorEl, error.message);
    }
}

function confirmDeleteEmployee(employeeId, employeeName) {
    showConfirmModal(
        '직원 삭제',
        `정말 "${employeeName}" 직원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        () => {
            try {
                deleteEmployee(employeeId);
                showToast('직원이 삭제되었습니다.', 'success');
                navigateToPage('employee-management');
            } catch (error) {
                showToast('직원 삭제 중 오류가 발생했습니다.', 'error');
                console.error(error);
            }
        }
    );
}

function resetEmployeePassword(employeeName) {
    showConfirmModal(
        '비밀번호 초기화',
        `"${employeeName}" 직원의 비밀번호를 초기화하시겠습니까? 다음 로그인 시 새 비밀번호를 설정해야 합니다.`,
        () => {
            try {
                resetPassword(employeeName);
                showToast('비밀번호가 초기화되었습니다.', 'success');
                navigateToPage('employee-management');
            } catch (error) {
                showToast('비밀번호 초기화 중 오류가 발생했습니다.', 'error');
                console.error(error);
            }
        }
    );
}

// ========================================
// 팀 모달 관리
// ========================================
function openTeamModal(teamId = null) {
    const modal = document.getElementById('team-modal');
    const title = document.getElementById('team-modal-title');
    const idInput = document.getElementById('team-id');
    const nameInput = document.getElementById('team-name');
    const colorInput = document.getElementById('team-color');
    const colorPreview = document.getElementById('team-color-preview');
    const errorEl = document.getElementById('team-modal-error');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    
    if (teamId) {
        const team = getTeamById(teamId);
        if (!team) return;
        
        title.textContent = '팀 수정';
        idInput.value = team.id;
        idInput.disabled = true;
        nameInput.value = team.name;
        colorInput.value = team.color;
        updateColorPreview(team.color, team.name);
        
        currentEditingTeam = team;
    } else {
        title.textContent = '팀 추가';
        idInput.value = '';
        idInput.disabled = false;
        nameInput.value = '';
        colorInput.value = '#3b82f6';
        updateColorPreview('#3b82f6', '새 팀');
        
        currentEditingTeam = null;
    }
    
    colorInput.oninput = function() {
        updateColorPreview(this.value, nameInput.value || '팀');
    };
    
    nameInput.oninput = function() {
        updateColorPreview(colorInput.value, this.value || '팀');
    };
    
    modal.classList.add('active');
}

function closeTeamModal() {
    const modal = document.getElementById('team-modal');
    modal.classList.remove('active');
    currentEditingTeam = null;
}

function updateColorPreview(color, name) {
    const preview = document.getElementById('team-color-preview');
    preview.style.backgroundColor = color;
    preview.textContent = name;
}

function saveTeam() {
    const idInput = document.getElementById('team-id');
    const nameInput = document.getElementById('team-name');
    const colorInput = document.getElementById('team-color');
    const errorEl = document.getElementById('team-modal-error');
    
    errorEl.textContent = '';
    errorEl.classList.remove('show');
    
    const id = idInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();
    const color = colorInput.value;
    
    if (!id) {
        showError(errorEl, '팀 ID를 입력하세요.');
        return;
    }
    
    if (id.length < 2 || id.length > 4) {
        showError(errorEl, '팀 ID는 2-4자여야 합니다.');
        return;
    }
    
    if (!name) {
        showError(errorEl, '팀 이름을 입력하세요.');
        return;
    }
    
    try {
        if (currentEditingTeam) {
            updateTeam(currentEditingTeam.id, {
                name: name,
                color: color
            });
            showToast('팀 정보가 수정되었습니다.', 'success');
        } else {
            addTeam({
                id: id,
                name: name,
                color: color
            });
            showToast('팀이 추가되었습니다.', 'success');
        }
        
        closeTeamModal();
        navigateToPage('team-management');
    } catch (error) {
        showError(errorEl, error.message);
    }
}

function confirmDeleteTeam(teamId, teamName) {
    const members = getTeamMembers(teamId);
    
    if (members.length > 0) {
        showToast('팀원이 있어 삭제할 수 없습니다. 먼저 팀원을 다른 팀으로 이동시켜주세요.', 'warning');
        return;
    }
    
    showConfirmModal(
        '팀 삭제',
        `정말 "${teamName}" 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        () => {
            try {
                deleteTeam(teamId);
                showToast('팀이 삭제되었습니다.', 'success');
                navigateToPage('team-management');
            } catch (error) {
                showToast('팀 삭제 중 오류가 발생했습니다.', 'error');
                console.error(error);
            }
        }
    );
}

// ========================================
// 확인 모달
// ========================================
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const messageEl = document.getElementById('confirm-modal-message');
    const confirmBtn = document.getElementById('confirm-modal-btn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = function() {
        onConfirm();
        closeConfirmModal();
    };
    
    modal.classList.add('active');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('active');
}

// ========================================
// 모달 이벤트 리스너
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const saveEmpBtn = document.getElementById('save-employee-btn');
    if (saveEmpBtn) {
        saveEmpBtn.onclick = saveEmployee;
    }
    
    const saveTeamBtn = document.getElementById('save-team-btn');
    if (saveTeamBtn) {
        saveTeamBtn.onclick = saveTeam;
    }
    
    window.onclick = function(event) {
        const empModal = document.getElementById('employee-modal');
        const teamModal = document.getElementById('team-modal');
        const confirmModal = document.getElementById('confirm-modal');
        
        if (event.target === empModal) {
            closeEmployeeModal();
        }
        if (event.target === teamModal) {
            closeTeamModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    };
});
