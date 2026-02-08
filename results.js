// ========================================
// 평가 결과 (관리자 전용)
// ========================================

// 접근 권한 체크
function checkResultsAccess() {
    if (!canAccessResults()) {
        return false;
    }
    return true;
}

// 결과 페이지 렌더링
function renderResultsPage() {
    if (!checkResultsAccess()) {
        document.getElementById('page-content').innerHTML = renderAccessDenied();
        return;
    }
    
    const selectedDate = getSelectedDate();
    const teams = getTeams();
    const rankings = getAllTeamRankings();
    
    let html = `
        <div class="date-selector">
            <label><strong>📅 결과 조회 기간</strong></label>
            <div class="date-inputs">
                <select id="result-year">
                    ${EVALUATION_YEARS.map(y => `
                        <option value="${y}" ${y === selectedDate.year ? 'selected' : ''}>${y}년</option>
                    `).join('')}
                </select>
                <select id="result-month">
                    ${EVALUATION_MONTHS.map(m => `
                        <option value="${m}" ${m === selectedDate.month ? 'selected' : ''}>${m}월</option>
                    `).join('')}
                </select>
                <button class="btn btn-secondary btn-sm" id="change-result-date-btn">
                    <i class="fas fa-check"></i> 적용
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-trophy"></i> 팀 종합 평가 결과 (${selectedDate.year}년 ${selectedDate.month}월)</h3>
                <button class="btn btn-sm btn-secondary" onclick="exportResults()">
                    <i class="fas fa-download"></i> 데이터 내보내기
                </button>
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h3><i class="fas fa-list-ol"></i> 팀 순위표</h3>
            </div>
            <div class="card-body">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>순위</th>
                                <th>팀</th>
                                <th>업무 성과</th>
                                <th>협업 능력</th>
                                <th>커뮤니케이션</th>
                                <th>창의성</th>
                                <th>평균 점수</th>
                                <th>평가 수</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    rankings.forEach((item, index) => {
        const team = item.team;
        const scores = item.scores;
        
        html += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>
                    <span class="team-badge" style="background-color: ${team.color}">
                        ${team.name}
                    </span>
                </td>
                <td>${scores.performance.toFixed(2)}</td>
                <td>${scores.collaboration.toFixed(2)}</td>
                <td>${scores.communication.toFixed(2)}</td>
                <td>${scores.creativity.toFixed(2)}</td>
                <td><strong>${scores.average.toFixed(2)}</strong></td>
                <td>${scores.count}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h3><i class="fas fa-chart-radar"></i> 팀별 상세 분석</h3>
            </div>
            <div class="card-body">
    `;
    
    teams.forEach(team => {
        html += renderTeamDetailChart(team);
    });
    
    html += `
            </div>
        </div>
        
        <div class="card mt-3">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> 직원 개별 평가 결과</h3>
            </div>
            <div class="card-body">
    `;
    
    teams.forEach(team => {
        html += renderTeamMembersResults(team);
    });
    
    html += `
            </div>
        </div>
    `;
    
    document.getElementById('page-content').innerHTML = html;
    
    // 날짜 변경 이벤트 등록
    const changeDateBtn = document.getElementById('change-result-date-btn');
    if (changeDateBtn) {
        changeDateBtn.addEventListener('click', handleResultDateChange);
    }
}

function renderAccessDenied() {
    return `
        <div class="card">
            <div class="card-body text-center" style="padding: 3rem;">
                <i class="fas fa-lock" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                <h2 style="color: var(--text-primary); margin-bottom: 1rem;">접근 권한 없음</h2>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">
                    평가 결과는 관리자만 조회할 수 있습니다.
                </p>
            </div>
        </div>
    `;
}

function renderTeamDetailChart(team) {
    const scores = getTeamAverageScores(team.id);
    const chartId = `team-chart-${team.id}`;
    
    let html = `
        <div class="mb-4">
            <h4>
                <span class="team-badge" style="background-color: ${team.color}">
                    ${team.name}
                </span>
                ${team.name}팀
                <span class="badge badge-secondary ml-2">평가 수: ${scores.count}</span>
            </h4>
            <div class="chart-container" style="height: 300px;">
                <canvas id="${chartId}"></canvas>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        createRadarChart(chartId, team.name, scores);
    }, 100);
    
    return html;
}

function renderTeamMembersResults(team) {
    const members = getTeamMembers(team.id);
    
    if (members.length === 0) return '';
    
    let html = `
        <div class="mb-4">
            <h4>
                <span class="team-badge" style="background-color: ${team.color}">
                    ${team.name}
                </span>
                ${team.name}팀 팀원
            </h4>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>역할</th>
                            <th>업무 성과</th>
                            <th>협업 능력</th>
                            <th>커뮤니케이션</th>
                            <th>창의성</th>
                            <th>평균 점수</th>
                            <th>평가 수</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    members.forEach(member => {
        const scores = getEmployeeAverageScores(member.name);
        const roleInfo = getRoleInfo(member.role);
        
        html += `
            <tr>
                <td><strong>${member.name}</strong></td>
                <td><span class="badge ${roleInfo.badge}">${roleInfo.label}</span></td>
                <td>${scores.count > 0 ? scores.performance.toFixed(2) : '-'}</td>
                <td>${scores.count > 0 ? scores.collaboration.toFixed(2) : '-'}</td>
                <td>${scores.count > 0 ? scores.communication.toFixed(2) : '-'}</td>
                <td>${scores.count > 0 ? scores.creativity.toFixed(2) : '-'}</td>
                <td><strong>${scores.count > 0 ? scores.average.toFixed(2) : '-'}</strong></td>
                <td>${scores.count}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return html;
}

// 레이더 차트 생성
function createRadarChart(canvasId, teamName, scores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    canvas.chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['업무 성과', '협업 능력', '커뮤니케이션', '창의성'],
            datasets: [{
                label: teamName,
                data: [
                    scores.performance,
                    scores.collaboration,
                    scores.communication,
                    scores.creativity
                ],
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 데이터 내보내기
function exportResults() {
    const data = exportAllData();
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_results_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showToast('데이터가 내보내기 되었습니다.', 'success');
}

// 결과 날짜 변경 핸들러
function handleResultDateChange() {
    const year = parseInt(document.getElementById('result-year').value);
    const month = parseInt(document.getElementById('result-month').value);
    
    saveSelectedDate(year, month);
    showToast(`${year}년 ${month}월 결과로 변경되었습니다.`, 'success');
    
    setTimeout(() => renderResultsPage(), 300);
}
