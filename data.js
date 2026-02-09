// ========================================
// 데이터 관리 시스템
// ========================================

// LocalStorage 키
const STORAGE_KEYS = {
    TEAMS: 'evaluation_teams',
    EMPLOYEES: 'evaluation_employees',
    TEAM_EVALUATIONS: 'evaluation_team_eval',
    MEMBER_EVALUATIONS: 'evaluation_member_eval',
    PASSWORDS: 'evaluation_passwords',
    SYSTEM_TITLE: 'evaluation_system_title',
    SELECTED_DATE: 'evaluation_selected_date'
};

// 초기 팀 데이터
const INITIAL_TEAMS = [
    { id: 'BA', name: 'BA', color: '#3b82f6' },
    { id: 'BD', name: 'BD', color: '#10b981' },
    { id: 'BE', name: 'BE', color: '#8b5cf6' },
    { id: 'BG', name: 'BG', color: '#f97316' },
    { id: 'BGS', name: 'BGS', color: '#ef4444' },
    { id: 'BR', name: 'BR', color: '#06b6d4' }
];

// 초기 직원 데이터
const INITIAL_EMPLOYEES = [
    // BA팀
    { id: 'BA001', name: '신경용', team: 'BA', role: 'team_leader' },
    { id: 'BA002', name: '윤길선', team: 'BA', role: 'employee' },
    { id: 'BA003', name: '정다혜', team: 'BA', role: 'employee' },
    { id: 'BA004', name: '이승영', team: 'BA', role: 'employee' },
    { id: 'BA005', name: '한준혁', team: 'BA', role: 'employee' },
    
    // BD팀
    { id: 'BD001', name: '윤덕형', team: 'BD', role: 'team_leader' },
    { id: 'BD002', name: '최진혁', team: 'BD', role: 'employee' },
    { id: 'BD003', name: '윤원경', team: 'BD', role: 'employee' },
    { id: 'BD004', name: '강소현', team: 'BD', role: 'employee' },
    
    // BE팀
    { id: 'BE001', name: '정진우', team: 'BE', role: 'team_leader' },
    { id: 'BE002', name: '강동우', team: 'BE', role: 'employee' },
    { id: 'BE003', name: '이윤아', team: 'BE', role: 'employee' },
    { id: 'BE004', name: '전수연', team: 'BE', role: 'employee' },
    
    // BG팀
    { id: 'BG001', name: '손진택', team: 'BG', role: 'team_leader' },
    { id: 'BG002', name: '로렌', team: 'BG', role: 'employee' },
    { id: 'BG003', name: '아니메쉬', team: 'BG', role: 'employee' },
    { id: 'BG004', name: '셀레스트', team: 'BG', role: 'employee' },
    
    // BGS팀
    { id: 'BGS001', name: '정승현', team: 'BGS', role: 'employee' },
    
    // BR팀
    { id: 'BR001', name: '한재갑', team: 'BR', role: 'team_leader' },
    { id: 'BR002', name: '박경숙', team: 'BR', role: 'employee' },
    { id: 'BR003', name: '고유진', team: 'BR', role: 'employee' },
    { id: 'BR004', name: '이정민', team: 'BR', role: 'employee' },
    { id: 'BR005', name: '정동진', team: 'BR', role: 'employee' },
    
    // 관리자
    { id: 'ADMIN001', name: '김지안', team: null, role: 'admin' }
];

// 평가 항목 정의
const EVALUATION_CRITERIA = [
    { id: 'performance', name: '업무 성과', description: '업무 목표 달성도와 성과' },
    { id: 'collaboration', name: '협업 능력', description: '팀워크와 협력 능력' },
    { id: 'communication', name: '커뮤니케이션', description: '의사소통 능력과 정보 공유' },
    { id: 'creativity', name: '창의성', description: '문제 해결과 혁신적 사고' }
];


// 평가 기간 설정 (2026-2030년)
const EVALUATION_YEARS = [2026, 2027, 2028, 2029, 2030];
const EVALUATION_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 현재 선택된 날짜 가져오기
function getSelectedDate() {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_DATE);
    if (saved) {
        return JSON.parse(saved);
    }
    // 기본값: 2026년 2월
    return { year: 2026, month: 2 };
}

// 선택된 날짜 저장하기
function saveSelectedDate(year, month) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_DATE, JSON.stringify({ year, month }));
}

// 평가 가능 여부 확인 (해당 월이 지났는지)
function canEvaluateForDate(year, month) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-11 → 1-12
    
    // 선택한 날짜가 현재보다 미래이거나 같은 달이면 평가 가능
    if (year > currentYear) return true;
    if (year === currentYear && month >= currentMonth) return true;
    
    return false;
}

// 날짜 키 생성 (예: "2026-02")
function getDateKey(year, month) {
    return `${year}-${String(month).padStart(2, '0')}`;
}

// ========================================
// 데이터 초기화
// ========================================
function initializeData() {
    // 팀 데이터 초기화
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
        saveTeams(INITIAL_TEAMS);
    }
    
    // 직원 데이터 초기화
    if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
        saveEmployees(INITIAL_EMPLOYEES);
    }
    
    // 비밀번호 초기화 (관리자만 설정)
    if (!localStorage.getItem(STORAGE_KEYS.PASSWORDS)) {
        const passwords = {
            '김지안': hashPassword('75857585@@')
        };
        localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
    }
    
    // 평가 데이터 초기화
    if (!localStorage.getItem(STORAGE_KEYS.TEAM_EVALUATIONS)) {
        localStorage.setItem(STORAGE_KEYS.TEAM_EVALUATIONS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.MEMBER_EVALUATIONS)) {
        localStorage.setItem(STORAGE_KEYS.MEMBER_EVALUATIONS, JSON.stringify([]));
    }
    
    // 시스템 타이틀 초기화
    if (!localStorage.getItem(STORAGE_KEYS.SYSTEM_TITLE)) {
        localStorage.setItem(STORAGE_KEYS.SYSTEM_TITLE, 'Working Together Review 🤝');
    }
}

// ========================================
// 팀 관리
// ========================================
function getTeams() {
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
}

function saveTeams(teams) {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
}

function getTeamById(teamId) {
    const teams = getTeams();
    return teams.find(t => t.id === teamId);
}

function addTeam(team) {
    const teams = getTeams();
    
    // 중복 체크
    if (teams.find(t => t.id === team.id)) {
        throw new Error('이미 존재하는 팀 ID입니다.');
    }
    
    teams.push({
        id: team.id,
        name: team.name,
        color: team.color,
        createdAt: new Date().toISOString()
    });
    
    saveTeams(teams);
    return team;
}

function updateTeam(teamId, updates) {
    const teams = getTeams();
    const index = teams.findIndex(t => t.id === teamId);
    
    if (index === -1) {
        throw new Error('팀을 찾을 수 없습니다.');
    }
    
    teams[index] = {
        ...teams[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    saveTeams(teams);
    return teams[index];
}

function deleteTeam(teamId) {
    const employees = getEmployees();
    const teamMembers = employees.filter(e => e.team === teamId);
    
    if (teamMembers.length > 0) {
        throw new Error('팀원이 있어 삭제할 수 없습니다. 먼저 팀원을 다른 팀으로 이동시켜주세요.');
    }
    
    const teams = getTeams();
    const filtered = teams.filter(t => t.id !== teamId);
    saveTeams(filtered);
}

function getTeamMembers(teamId) {
    const employees = getEmployees();
    return employees.filter(e => e.team === teamId);
}

function getTeamLeader(teamId) {
    const employees = getEmployees();
    return employees.find(e => e.team === teamId && e.role === 'team_leader');
}

// ========================================
// 직원 관리
// ========================================
function getEmployees() {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
}

function saveEmployees(employees) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
}

function getEmployeeByName(name) {
    const employees = getEmployees();
    return employees.find(e => e.name === name);
}

function getEmployeeById(id) {
    const employees = getEmployees();
    return employees.find(e => e.id === id);
}

function addEmployee(employee) {
    const employees = getEmployees();
    
    // 이름 중복 체크
    if (employees.find(e => e.name === employee.name)) {
        throw new Error('이미 존재하는 이름입니다.');
    }
    
    // ID 생성
    const teamPrefix = employee.team || 'EMP';
    const teamMembers = employees.filter(e => e.team === employee.team);
    const nextNumber = String(teamMembers.length + 1).padStart(3, '0');
    const id = `${teamPrefix}${nextNumber}`;
    
    const newEmployee = {
        id,
        name: employee.name,
        team: employee.team,
        role: employee.role || 'employee',
        createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    saveEmployees(employees);
    
    return newEmployee;
}

function updateEmployee(employeeId, updates) {
    const employees = getEmployees();
    const index = employees.findIndex(e => e.id === employeeId);
    
    if (index === -1) {
        throw new Error('직원을 찾을 수 없습니다.');
    }
    
    // 이름 변경 시 중복 체크
    if (updates.name && updates.name !== employees[index].name) {
        if (employees.find(e => e.name === updates.name)) {
            throw new Error('이미 존재하는 이름입니다.');
        }
    }
    
    employees[index] = {
        ...employees[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    saveEmployees(employees);
    return employees[index];
}

function deleteEmployee(employeeId) {
    const employees = getEmployees();
    const filtered = employees.filter(e => e.id !== employeeId);
    saveEmployees(filtered);
}

function getEmployeesByTeam(teamId) {
    const employees = getEmployees();
    return employees.filter(e => e.team === teamId);
}

function getEmployeesByRole(role) {
    const employees = getEmployees();
    return employees.filter(e => e.role === role);
}

// ========================================
// 비밀번호 관리
// ========================================
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function savePassword(name, password) {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    passwords[name] = hashPassword(password);
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
}

function verifyPassword(name, password) {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    return passwords[name] === hashPassword(password);
}

function hasPassword(name) {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    return passwords.hasOwnProperty(name);
}

function resetPassword(name) {
    const passwords = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    delete passwords[name];
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwords));
}

// ========================================
// 팀간 평가 관리
// ========================================
function getTeamEvaluations() {
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_EVALUATIONS);
    return data ? JSON.parse(data) : [];
}

function saveTeamEvaluation(evaluation) {
    const evaluations = getTeamEvaluations();
    const selectedDate = getSelectedDate();
    const dateKey = getDateKey(selectedDate.year, selectedDate.month);
    
    // 기존 평가 찾기 (evaluator + targetTeam + dateKey)
    const index = evaluations.findIndex(e => 
        e.evaluatorName === evaluation.evaluatorName && 
        e.targetTeam === evaluation.targetTeam &&
        e.dateKey === dateKey
    );
    
    const newEvaluation = {
        ...evaluation,
        dateKey: dateKey,
        year: selectedDate.year,
        month: selectedDate.month,
        timestamp: new Date().toISOString()
    };
    
    if (index !== -1) {
        evaluations[index] = newEvaluation;
    } else {
        evaluations.push(newEvaluation);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEAM_EVALUATIONS, JSON.stringify(evaluations));
}

function getTeamEvaluationsByEvaluator(evaluatorName, year, month) {
    const evaluations = getTeamEvaluations();
    const dateKey = year && month ? getDateKey(year, month) : getDateKey(getSelectedDate().year, getSelectedDate().month);
    return evaluations.filter(e => e.evaluatorName === evaluatorName && e.dateKey === dateKey);
}

function getTeamEvaluationsForTeam(teamId, year, month) {
    const evaluations = getTeamEvaluations();
    if (year && month) {
        const dateKey = getDateKey(year, month);
        return evaluations.filter(e => e.targetTeam === teamId && e.dateKey === dateKey);
    }
    return evaluations.filter(e => e.targetTeam === teamId);
}


// ========================================
// 팀원 평가 관리
// ========================================
function getMemberEvaluations() {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBER_EVALUATIONS);
    return data ? JSON.parse(data) : [];
}

function saveMemberEvaluation(evaluation) {
    const evaluations = getMemberEvaluations();
    const selectedDate = getSelectedDate();
    const dateKey = getDateKey(selectedDate.year, selectedDate.month);
    
    // 기존 평가 찾기 (evaluator + targetEmployee + dateKey)
    const index = evaluations.findIndex(e => 
        e.evaluatorName === evaluation.evaluatorName && 
        e.targetEmployee === evaluation.targetEmployee &&
        e.dateKey === dateKey
    );
    
    const newEvaluation = {
        ...evaluation,
        dateKey: dateKey,
        year: selectedDate.year,
        month: selectedDate.month,
        timestamp: new Date().toISOString()
    };
    
    if (index !== -1) {
        evaluations[index] = newEvaluation;
    } else {
        evaluations.push(newEvaluation);
    }
    
    localStorage.setItem(STORAGE_KEYS.MEMBER_EVALUATIONS, JSON.stringify(evaluations));
}


function getMemberEvaluationsByEvaluator(evaluatorName, year, month) {
    const evaluations = getMemberEvaluations();
    const dateKey = year && month ? getDateKey(year, month) : getDateKey(getSelectedDate().year, getSelectedDate().month);
    return evaluations.filter(e => e.evaluatorName === evaluatorName && e.dateKey === dateKey);
}

function getMemberEvaluationsForEmployee(employeeName, year, month) {
    const evaluations = getMemberEvaluations();
    if (year && month) {
        const dateKey = getDateKey(year, month);
        return evaluations.filter(e => e.targetEmployee === employeeName && e.dateKey === dateKey);
    }
    return evaluations.filter(e => e.targetEmployee === employeeName);
}


// ========================================
// 통계 및 분석
// ========================================
function getTeamAverageScores(teamId) {
    const evaluations = getTeamEvaluationsForTeam(teamId);
    
    if (evaluations.length === 0) {
        return {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0,
            average: 0,
            count: 0
        };
    }
    
    const totals = {
        performance: 0,
        collaboration: 0,
        communication: 0,
        creativity: 0
    };
    
    evaluations.forEach(eval => {
        totals.performance += eval.scores.performance;
        totals.collaboration += eval.scores.collaboration;
        totals.communication += eval.scores.communication;
        totals.creativity += eval.scores.creativity;
    });
    
    const count = evaluations.length;
    const scores = {
        performance: totals.performance / count,
        collaboration: totals.collaboration / count,
        communication: totals.communication / count,
        creativity: totals.creativity / count,
        count
    };
    
    scores.average = (scores.performance + scores.collaboration + 
                     scores.communication + scores.creativity) / 4;
    
    return scores;
}

function getEmployeeAverageScores(employeeName) {
    const evaluations = getMemberEvaluationsForEmployee(employeeName);
    
    if (evaluations.length === 0) {
        return {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0,
            average: 0,
            count: 0
        };
    }
    
    const totals = {
        performance: 0,
        collaboration: 0,
        communication: 0,
        creativity: 0
    };
    
    evaluations.forEach(eval => {
        totals.performance += eval.scores.performance;
        totals.collaboration += eval.scores.collaboration;
        totals.communication += eval.scores.communication;
        totals.creativity += eval.scores.creativity;
    });
    
    const count = evaluations.length;
    const scores = {
        performance: totals.performance / count,
        collaboration: totals.collaboration / count,
        communication: totals.communication / count,
        creativity: totals.creativity / count,
        count
    };
    
    scores.average = (scores.performance + scores.collaboration + 
                     scores.communication + scores.creativity) / 4;
    
    return scores;
}

function getAllTeamRankings() {
    const teams = getTeams();
    const rankings = teams.map(team => {
        const scores = getTeamAverageScores(team.id);
        return {
            team: team,
            scores: scores,
            average: scores.average
        };
    });
    
    return rankings.sort((a, b) => b.average - a.average);
}

// ========================================
// 시스템 타이틀 관리
// ========================================
function getSystemTitle() {
    return localStorage.getItem(STORAGE_KEYS.SYSTEM_TITLE) || 'Working Together Review 🤝';
}

function saveSystemTitle(title) {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_TITLE, title);
    updateSystemTitleDisplay();
}

function updateSystemTitleDisplay() {
    const title = getSystemTitle();
    
    document.title = title;
    
    const loginTitle = document.getElementById('system-title-display');
    if (loginTitle) {
        loginTitle.textContent = title;
    }
    
    const sidebarTitle = document.getElementById('sidebar-title-display');
    if (sidebarTitle) {
        const shortTitle = title.includes('🤝') ? 'Review 🤝' : 'Review';
        sidebarTitle.textContent = shortTitle;
    }
}

// ========================================
// 데이터 내보내기 및 초기화
// ========================================
function exportAllData() {
    return {
        teams: getTeams(),
        employees: getEmployees(),
        teamEvaluations: getTeamEvaluations(),
        memberEvaluations: getMemberEvaluations(),
        systemTitle: getSystemTitle(),
        exportDate: new Date().toISOString()
    };
}

function resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.TEAM_EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEMBER_EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.PASSWORDS);
    localStorage.removeItem(STORAGE_KEYS.SYSTEM_TITLE);
    initializeData();
}

// 초기화 실행
initializeData();

