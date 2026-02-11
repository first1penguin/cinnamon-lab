// ========================================
// 평가 기능
// ========================================

// 분기 정의
const EVALUATION_QUARTERS = [
    { id: 1, label: '1분기', months: [1, 2, 3] },
    { id: 2, label: '2분기', months: [4, 5, 6] },
    { id: 3, label: '3분기', months: [7, 8, 9] },
    { id: 4, label: '4분기', months: [10, 11, 12] }
];

// 팀간 평가 페이지 렌더링
function renderTeamEvaluationPage() {
    const user = getCurrentUser();
    const teams = getTeams();
    const myTeam = user.team;
    const selectedDate = getSelectedDate();
    
    // 자기 팀을 제외한 다른 팀들
    const otherTeams = teams.filter(t => t.id !== myTeam);
    
    // 내가 작성한 평가들
    const myEvaluations = getTeamEvaluationsByEvaluator(user.name);
    
    // 진행률 계산
    const totalTeams = otherTeams.length;
    const completedTeams = myEvaluations.length;
    const progress = totalTeams > 0 ? (completedTeams / totalTeams * 100).toFixed(0) : 0;
    
    let html = `
        <div class="date-selector">
            <label><strong>📅 평가 기간</strong></label>
            <div class="date-inputs">
                <select id="team-eval-year" onchange="handleTeamEvalDateChange()">
                    ${EVALUATION_YEARS.map(y => `
                        <option value="${y}" ${y === selectedDate.year ? 'selected' : ''}>${y}년</option>
                    `).join('')}
                </select>
                <select id="team-eval-quarter" onchange="handleTeamEvalDateChange()">
                    ${EVALUATION_QUARTERS.map(q => `
                        <option value="${q.id}" ${q.id === selectedDate.quarter ? 'selected' : ''}>${q.label}</option>
                    `).join('')}
                </select>
            </div>
        </div>
        
        <div class="evaluation-header">
            <div class="evaluation-progress">
                <div class="progress-info">
                    <span>평가 진행률</span>
                    <span class="progress-percent">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-detail">
                    ${completedTeams} / ${totalTeams} 팀 평가 완료
                </div>
            </div>
        </div>
        
        <div class="evaluation-list">
    `;
    
    otherTeams.forEach(team => {
        // 이 팀에 대한 내 평가가 있는지 확인
        const myEval = myEvaluations.find(e => e.targetTeam === team.id);
        const isCompleted = !!myEval;
        
        html += `
            <div class="evaluation-card ${isCompleted ? 'completed' : ''}">
                <div class="evaluation-card-header">
                    <div class="team-info">
                        <span class="team-badge" style="background-color: ${team.color}">${team.name}</span>
                        <h3>${team.name} 팀 평가</h3>
                    </div>
                    ${isCompleted ? '<span class="status-badge completed">✓ 완료</span>' : '<span class="status-badge pending">미완료</span>'}
                </div>
                
                <form class="evaluation-form" data-team-id="${team.id}">
                    ${EVALUATION_CRITERIA.map(criteria => `
                        <div class="evaluation-item">
                            <div class="evaluation-item-header">
                                <strong>${criteria.name}</strong>
                                <span class="evaluation-description">${criteria.description}</span>
                            </div>
                            <div class="rating-buttons" data-criteria="${criteria.id}">
                                ${[1, 2, 3, 4, 5].map(score => `
                                    <button type="button" 
                                            class="rating-btn ${myEval && myEval.scores[criteria.id] === score ? 'active' : ''}" 
                                            data-score="${score}"
                                            ${isCompleted ? 'disabled' : ''}>
                                        ${score}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="evaluation-item">
                        <label for="comment-${team.id}"><strong>코멘트 (선택)</strong></label>
                        <textarea id="comment-${team.id}" 
                                  name="comment" 
                                  rows="3" 
                                  placeholder="추가 의견을 작성해주세요..."
                                  ${isCompleted ? 'disabled' : ''}>${myEval ? myEval.comment || '' : ''}</textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" ${isCompleted ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas ${isCompleted ? 'fa-check' : 'fa-save'}"></i>
                        ${isCompleted ? '평가 완료' : '평가 저장'}
                    </button>
                </form>
            </div>
        `;
    });
    
    html += '</div>';
    
    document.getElementById('page-content').innerHTML = html;
}

// 팀원 평가 페이지 렌더링
function renderMemberEvaluationPage() {
    const user = getCurrentUser();
    const selectedDate = getSelectedDate();
    const canEvaluate = canEvaluateForDate(selectedDate.year, selectedDate.month);
    
    // 권한 확인
    if (!canEvaluateMembers(user.role)) {
        renderAccessDenied('팀원 평가');
        return;
    }
    
    let employees = [];
    
    if (user.role === 'admin') {
        // 관리자: 모든 직원 (자기 자신 제외)
        employees = getEmployees().filter(e => e.name !== user.name);
    } else if (user.role === 'team_leader') {
        // 팀장: 자기 팀원만
        employees = getEmployees().filter(e => 
            e.team === user.team && e.name !== user.name
        );
    }
    
    // 내가 작성한 평가들 (선택한 날짜 기준)
    const myEvaluations = getMemberEvaluationsByEvaluator(user.name, selectedDate.year, selectedDate.month);
    
    // 진행률 계산
    const totalMembers = employees.length;
    const completedMembers = myEvaluations.length;
    const progress = totalMembers > 0 ? (completedMembers / totalMembers * 100).toFixed(0) : 0;
    
    const quarterLabel = EVALUATION_QUARTERS.find(q => q.id === selectedDate.quarter)?.label || '1분기';
    
    let html = `
        <div class="evaluation-header">
            <div class="date-selector">
                <label><strong>📅 평가 기간 선택</strong></label>
                <div class="date-inputs">
                    <select id="eval-year" ${!canEvaluate ? 'disabled' : ''}>
                        ${EVALUATION_YEARS.map(y => `
                            <option value="${y}" ${y === selectedDate.year ? 'selected' : ''}>${y}년</option>
                        `).join('')}
                    </select>
                    <select id="eval-quarter" ${!canEvaluate ? 'disabled' : ''}>
                        ${EVALUATION_QUARTERS.map(q => `
                            <option value="${q.id}" ${q.id === selectedDate.quarter ? 'selected' : ''}>${q.label}</option>
                        `).join('')}
                    </select>
                    <button class="btn btn-secondary btn-sm" id="change-date-btn" ${!canEvaluate ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> 적용
                    </button>
                </div>
                ${!canEvaluate ? '<p class="warning-text">⚠️ 이 기간은 이미 지났습니다. 평가를 수정할 수 없습니다.</p>' : ''}
            </div>
            
            <div class="evaluation-progress">
                <div class="progress-info">
                    <span>평가 진행률</span>
                    <span class="progress-percent">${progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-detail">
                    ${completedMembers} / ${totalMembers} 명 평가 완료
                </div>
            </div>
        </div>
    `;
    
    if (user.role === 'admin') {
        // 관리자는 팀별로 그룹화
        const teams = getTeams();
        html += '<div class="evaluation-list">';
        
        teams.forEach(team => {
            const teamMembers = employees.filter(e => e.team === team.id);
            if (teamMembers.length === 0) return;
            
            html += `
                <div class="team-section">
                    <h3 class="team-section-title">
                        <span class="team-badge" style="background-color: ${team.color}">${team.name}</span>
                        ${team.name} 팀 (${teamMembers.length}명)
                    </h3>
                    <div class="team-members-grid">
                        ${teamMembers.map(emp => renderMemberEvaluationForm(emp, myEvaluations, canEvaluate)).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    } else {
        // 팀장은 일반 목록
        html += `
            <div class="evaluation-list">
                <div class="team-members-grid">
                    ${employees.map(emp => renderMemberEvaluationForm(emp, myEvaluations, canEvaluate)).join('')}
                </div>
            </div>
        `;
    }
    
    document.getElementById('page-content').innerHTML = html;
    
    // 날짜 변경 이벤트 등록
    const changeDateBtn = document.getElementById('change-date-btn');
    if (changeDateBtn) {
        changeDateBtn.addEventListener('click', handleDateChange);
    }
}

// 팀원 평가 폼 렌더링
function renderMemberEvaluationForm(employee, myEvaluations, canEvaluate) {
    const myEval = myEvaluations.find(e => e.targetEmployee === employee.name);
    const isCompleted = !!myEval;
    const roleInfo = getRoleInfo(employee.role);
    
    return `
        <div class="evaluation-card member-card ${isCompleted ? 'completed' : ''}">
            <div class="evaluation-card-header">
                <div class="member-info">
                    <i class="fas ${roleInfo.icon}"></i>
                    <div>
                        <h4>${employee.name}</h4>
                        <span class="role-badge ${employee.role}">${roleInfo.label}</span>
                    </div>
                </div>
                ${isCompleted ? '<span class="status-badge completed">✓ 완료</span>' : '<span class="status-badge pending">미완료</span>'}
            </div>
            
            <form class="evaluation-form member-eval-form" data-employee-name="${employee.name}">
                ${EVALUATION_CRITERIA.map(criteria => `
                    <div class="evaluation-item compact">
                        <div class="evaluation-item-header">
                            <strong>${criteria.name}</strong>
                        </div>
                        <div class="rating-buttons" data-criteria="${criteria.id}">
                            ${[1, 2, 3, 4, 5].map(score => `
                                <button type="button" 
                                        class="rating-btn ${myEval && myEval.scores[criteria.id] === score ? 'active' : ''}" 
                                        data-score="${score}"
                                        ${!canEvaluate || isCompleted ? 'disabled' : ''}>
                                    ${score}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                
                <div class="evaluation-item">
                    <label><strong>종합 의견</strong></label>
                    <textarea name="comment" 
                              rows="2" 
                              placeholder="종합 의견..."
                              ${!canEvaluate || isCompleted ? 'disabled' : ''}>${myEval ? myEval.comment || '' : ''}</textarea>
                </div>
                
                <button type="submit" class="btn btn-primary btn-sm" ${!canEvaluate || isCompleted ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    <i class="fas ${isCompleted ? 'fa-check' : 'fa-save'}"></i>
                    ${isCompleted ? '평가 완료' : '저장'}
                </button>
            </form>
        </div>
    `;
}

// 평가 이벤트 초기화
function initializeEvaluationEvents() {
    setTimeout(() => {
        // 평가 점수 버튼 클릭
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('rating-btn') && !e.target.disabled) {
                handleRatingClick(e);
            }
        });
        
        // 팀간 평가 제출
        document.addEventListener('submit', function(e) {
            if (e.target.classList.contains('evaluation-form') && 
                e.target.hasAttribute('data-team-id')) {
                e.preventDefault();
                handleTeamEvaluationSubmit(e);
            }
        });
        
        // 팀원 평가 제출
        document.addEventListener('submit', function(e) {
            if (e.target.classList.contains('member-eval-form')) {
                e.preventDefault();
                handleMemberEvaluationSubmit(e);
            }
        });
    }, 100);
}

// 평가 점수 버튼 클릭 핸들러
function handleRatingClick(e) {
    const button = e.target;
    const ratingButtons = button.parentElement;
    const score = parseInt(button.getAttribute('data-score'));
    
    // 같은 그룹의 다른 버튼들 비활성화
    ratingButtons.querySelectorAll('.rating-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 클릭한 버튼 활성화
    button.classList.add('active');
}

// 팀간 평가 제출 핸들러
async function handleTeamEvaluationSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const teamId = form.getAttribute('data-team-id');
    const user = getCurrentUser();
    const selectedDate = getSelectedDate();
    
    // 이미 평가한 경우 수정 불가
    const exists = await checkTeamEvaluationExists(user.name, teamId, selectedDate.year, selectedDate.quarter);
    if (exists) {
        alert('이미 평가를 완료했습니다. 평가는 수정할 수 없습니다.');
        return;
    }
    
    // 점수 수집
    const scores = {};
    let allScored = true;
    
    EVALUATION_CRITERIA.forEach(criteria => {
        const ratingButtons = form.querySelector(`[data-criteria="${criteria.id}"]`);
        const activeBtn = ratingButtons.querySelector('.rating-btn.active');
        
        if (activeBtn) {
            scores[criteria.id] = parseInt(activeBtn.getAttribute('data-score'));
        } else {
            allScored = false;
        }
    });
    
    if (!allScored) {
        alert('모든 평가 항목에 점수를 입력해주세요.');
        return;
    }
    
    // 코멘트
    const commentInput = form.querySelector('textarea[name="comment"]');
    const comment = commentInput ? commentInput.value : '';
    
    // API로 저장
    const apiData = {
        evaluator_name: user.name,
        evaluator_team: user.team,
        target_team: teamId,
        year: selectedDate.year,
        quarter: selectedDate.quarter,
        performance: scores.performance,
        collaboration: scores.collaboration,
        communication: scores.communication,
        creativity: scores.creativity,
        performance_comment: comment,
        collaboration_comment: '',
        communication_comment: '',
        creativity_comment: ''
    };
    
    try {
        await saveTeamEvaluationAPI(apiData);
        showToast('팀 평가가 저장되었습니다!', 'success');
        
        // 페이지 새로고침 후 완료 체크
        setTimeout(() => {
            navigateToPage('team-evaluation');
            checkAllEvaluationsComplete();
        }, 500);
    } catch (error) {
        alert('저장 실패: ' + error.message);
    }
}

// 팀원 평가 제출 핸들러
async function handleMemberEvaluationSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const employeeName = form.getAttribute('data-employee-name');
    const user = getCurrentUser();
    const selectedDate = getSelectedDate();
    
    // 대상 직원 정보 가져오기
    const targetUser = getEmployeeByName(employeeName);
    if (!targetUser) {
        alert('직원 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 이미 평가한 경우 수정 불가
    const exists = await checkMemberEvaluationExists(user.name, employeeName, selectedDate.year, selectedDate.quarter);
    if (exists) {
        alert('이미 평가를 완료했습니다. 평가는 수정할 수 없습니다.');
        return;
    }
    
    // 점수 수집
    const scores = {};
    let allScored = true;
    
    EVALUATION_CRITERIA.forEach(criteria => {
        const ratingButtons = form.querySelector(`[data-criteria="${criteria.id}"]`);
        const activeBtn = ratingButtons.querySelector('.rating-btn.active');
        
        if (activeBtn) {
            scores[criteria.id] = parseInt(activeBtn.getAttribute('data-score'));
        } else {
            allScored = false;
        }
    });
    
    if (!allScored) {
        alert('모든 평가 항목에 점수를 입력해주세요.');
        return;
    }
    
    // 코멘트
    const commentInput = form.querySelector('textarea[name="comment"]');
    const comment = commentInput ? commentInput.value : '';
    
    // API로 저장
    const apiData = {
        evaluator_name: user.name,
        evaluator_team: user.team,
        evaluator_role: user.role,
        target_employee: employeeName,
        target_team: targetUser.team,
        year: selectedDate.year,
        quarter: selectedDate.quarter,
        performance: scores.performance,
        collaboration: scores.collaboration,
        communication: scores.communication,
        creativity: scores.creativity,
        performance_comment: comment,
        collaboration_comment: '',
        communication_comment: '',
        creativity_comment: ''
    };
    
    try {
        await saveMemberEvaluationAPI(apiData);
        showToast('팀원 평가가 저장되었습니다!', 'success');
        
        // 페이지 새로고침 후 완료 체크
        setTimeout(() => {
            navigateToPage('member-evaluation');
            checkAllEvaluationsComplete();
        }, 500);
    } catch (error) {
        alert('저장 실패: ' + error.message);
    }
}

// 접근 거부 페이지
function renderAccessDenied(feature) {
    document.getElementById('page-content').innerHTML = `
        <div class="access-denied">
            <i class="fas fa-lock"></i>
            <h2>접근 권한이 없습니다</h2>
            <p>${feature} 기능은 권한이 있는 사용자만 이용할 수 있습니다.</p>
        </div>
    `;
}

// 날짜 변경 핸들러 (팀원평가용)
function handleDateChange() {
    const year = parseInt(document.getElementById('eval-year').value);
    const quarter = parseInt(document.getElementById('eval-quarter').value);
    
    saveSelectedDate(year, quarter);
    const quarterLabel = EVALUATION_QUARTERS.find(q => q.id === quarter)?.label || '1분기';
    showToast(`${year}년 ${quarterLabel}로 변경되었습니다.`, 'success');
    
    // 현재 페이지 새로고침
    setTimeout(() => renderMemberEvaluationPage(), 300);
}

// 팀간평가 날짜 변경 핸들러
function handleTeamEvalDateChange() {
    const year = parseInt(document.getElementById('team-eval-year').value);
    const quarter = parseInt(document.getElementById('team-eval-quarter').value);
    
    saveSelectedDate(year, quarter);
    const quarterLabel = EVALUATION_QUARTERS.find(q => q.id === quarter)?.label || '1분기';
    showToast(`${year}년 ${quarterLabel}로 변경되었습니다.`, 'success');
    
    // 페이지 새로고침
    setTimeout(() => renderTeamEvaluationPage(), 300);
}

// 모든 평가 완료 체크 및 로그아웃
function checkAllEvaluationsComplete() {
    const user = getCurrentUser();
    
    // 관리자는 체크하지 않음
    if (user.role === 'admin') {
        return;
    }
    
    const teams = getTeams();
    const myTeam = user.team;
    
    // 팀간 평가 체크
    const otherTeams = teams.filter(t => t.id !== myTeam);
    const myTeamEvaluations = getTeamEvaluationsByEvaluator(user.name);
    const teamEvalComplete = myTeamEvaluations.length === otherTeams.length;
    
    // 팀원 평가 체크 (팀장만)
    let memberEvalComplete = true;
    if (user.role === 'team_leader') {
        const selectedDate = getSelectedDate();
        const teamMembers = getEmployees().filter(e => 
            e.team === user.team && e.name !== user.name
        );
        const myMemberEvaluations = getMemberEvaluationsByEvaluator(user.name, selectedDate.year, selectedDate.month);
        memberEvalComplete = myMemberEvaluations.length === teamMembers.length;
    }
    
    // 모든 평가가 완료되었는지 확인
    const allComplete = teamEvalComplete && memberEvalComplete;
    
    if (allComplete) {
        setTimeout(() => {
            if (confirm('🎉 모든 평가가 끝났습니다!\n\n로그아웃 하시겠습니까?')) {
                alert('오늘의 우리를 자랑스럽게 기억되게 합시다! 🌟');
                logout();
            }
        }, 1000);
    }
}

// 분기에서 월 가져오기
function getMonthFromQuarter(quarter) {
    const q = EVALUATION_QUARTERS.find(q => q.id === quarter);
    return q ? q.months[0] : 1;
}

// 월에서 분기 가져오기
function getQuarterFromMonth(month) {
    const q = EVALUATION_QUARTERS.find(q => q.months.includes(month));
    return q ? q.id : 1;
}

// saveSelectedDate 함수 오버라이드 (분기 기반)
function saveSelectedDate(year, quarter) {
    const month = getMonthFromQuarter(quarter);
    localStorage.setItem('evaluation_selected_date', JSON.stringify({ year, month, quarter }));
}
