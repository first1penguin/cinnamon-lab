// ========================================
// RESTful Table API 함수들
// ========================================

// 팀 평가 저장 (API)
async function saveTeamEvaluationAPI(evaluation) {
    try {
        const response = await fetch('tables/team_evaluations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(evaluation)
        });
        if (!response.ok) throw new Error('저장 실패');
        return await response.json();
    } catch (error) {
        console.error('팀 평가 저장 실패:', error);
        throw error;
    }
}

// 팀 평가 조회 (API)
async function getTeamEvaluationsAPI(year, quarter) {
    try {
        let url = 'tables/team_evaluations?limit=1000';
        const response = await fetch(url);
        if (!response.ok) throw new Error('조회 실패');
        const result = await response.json();
        
        // 연도/분기 필터링
        if (year && quarter) {
            return result.data.filter(e => e.year === year && e.quarter === quarter);
        }
        return result.data;
    } catch (error) {
        console.error('팀 평가 조회 실패:', error);
        return [];
    }
}

// 팀원 평가 저장 (API)
async function saveMemberEvaluationAPI(evaluation) {
    try {
        const response = await fetch('tables/member_evaluations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(evaluation)
        });
        if (!response.ok) throw new Error('저장 실패');
        return await response.json();
    } catch (error) {
        console.error('팀원 평가 저장 실패:', error);
        throw error;
    }
}

// 팀원 평가 조회 (API)
async function getMemberEvaluationsAPI(year, quarter) {
    try {
        let url = 'tables/member_evaluations?limit=1000';
        const response = await fetch(url);
        if (!response.ok) throw new Error('조회 실패');
        const result = await response.json();
        
        // 연도/분기 필터링
        if (year && quarter) {
            return result.data.filter(e => e.year === year && e.quarter === quarter);
        }
        return result.data;
    } catch (error) {
        console.error('팀원 평가 조회 실패:', error);
        return [];
    }
}

// 특정 평가자의 팀 평가 확인 (중복 방지)
async function checkTeamEvaluationExists(evaluatorName, targetTeam, year, quarter) {
    try {
        const evaluations = await getTeamEvaluationsAPI(year, quarter);
        return evaluations.some(e => 
            e.evaluator_name === evaluatorName && 
            e.target_team === targetTeam &&
            e.year === year &&
            e.quarter === quarter
        );
    } catch (error) {
        console.error('평가 확인 실패:', error);
        return false;
    }
}

// 특정 평가자의 팀원 평가 확인 (중복 방지)
async function checkMemberEvaluationExists(evaluatorName, targetEmployee, year, quarter) {
    try {
        const evaluations = await getMemberEvaluationsAPI(year, quarter);
        return evaluations.some(e => 
            e.evaluator_name === evaluatorName && 
            e.target_employee === targetEmployee &&
            e.year === year &&
            e.quarter === quarter
        );
    } catch (error) {
        console.error('평가 확인 실패:', error);
        return false;
    }
}

// 팀 평균 점수 계산 (API)
async function getTeamAverageScoresAPI(teamId, year, quarter) {
    try {
        const evaluations = await getTeamEvaluationsAPI(year, quarter);
        const teamEvals = evaluations.filter(e => e.target_team === teamId);
        
        if (teamEvals.length === 0) {
            return {
                performance: 0,
                collaboration: 0,
                communication: 0,
                creativity: 0,
                average: 0,
                count: 0
            };
        }
        
        const scores = {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0
        };
        
        teamEvals.forEach(e => {
            scores.performance += e.performance;
            scores.collaboration += e.collaboration;
            scores.communication += e.communication;
            scores.creativity += e.creativity;
        });
        
        const count = teamEvals.length;
        scores.performance /= count;
        scores.collaboration /= count;
        scores.communication /= count;
        scores.creativity /= count;
        scores.average = (scores.performance + scores.collaboration + scores.communication + scores.creativity) / 4;
        scores.count = count;
        
        return scores;
    } catch (error) {
        console.error('팀 평균 계산 실패:', error);
        return {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0,
            average: 0,
            count: 0
        };
    }
}

// 직원 평균 점수 계산 (API)
async function getEmployeeAverageScoresAPI(employeeName, year, quarter) {
    try {
        const evaluations = await getMemberEvaluationsAPI(year, quarter);
        const empEvals = evaluations.filter(e => e.target_employee === employeeName);
        
        if (empEvals.length === 0) {
            return {
                performance: 0,
                collaboration: 0,
                communication: 0,
                creativity: 0,
                average: 0,
                count: 0
            };
        }
        
        const scores = {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0
        };
        
        empEvals.forEach(e => {
            scores.performance += e.performance;
            scores.collaboration += e.collaboration;
            scores.communication += e.communication;
            scores.creativity += e.creativity;
        });
        
        const count = empEvals.length;
        scores.performance /= count;
        scores.collaboration /= count;
        scores.communication /= count;
        scores.creativity /= count;
        scores.average = (scores.performance + scores.collaboration + scores.communication + scores.creativity) / 4;
        scores.count = count;
        
        return scores;
    } catch (error) {
        console.error('직원 평균 계산 실패:', error);
        return {
            performance: 0,
            collaboration: 0,
            communication: 0,
            creativity: 0,
            average: 0,
            count: 0
        };
    }
}

// 전체 팀 랭킹 (API)
async function getAllTeamRankingsAPI(year, quarter) {
    try {
        const teams = getTeams();
        const rankings = [];
        
        for (const team of teams) {
            const scores = await getTeamAverageScoresAPI(team.id, year, quarter);
            rankings.push({
                team: team,
                scores: scores
            });
        }
        
        // 평균 점수로 정렬
        rankings.sort((a, b) => b.scores.average - a.scores.average);
        
        return rankings;
    } catch (error) {
        console.error('랭킹 조회 실패:', error);
        return [];
    }
}
