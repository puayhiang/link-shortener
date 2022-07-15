class TeamScores {

    constructor(scores) {
        this.scores = scores;
    }

    rankingSort(teamA, teamB) {

        if (teamA['MatchPoints'] > teamB['MatchPoints']) {
            return -1;
        }
        if (teamA['MatchPoints'] < teamB['MatchPoints']) {
            return 1;
        }
        if (teamA['GoalsScored'] > teamB['GoalsScored']) {
            return -1;
        }
        if (teamA['GoalsScored'] < teamB['GoalsScored']) {
            return 1;
        }
        if (teamA['AltMatchPoints'] > teamB['AltMatchPoints']) {
            return -1;
        }
        if (teamA['AltMatchPoints'] < teamB['AltMatchPoints']) {
            return 1;
        }
        if (teamA['AltMatchPoints'] > teamB['AltMatchPoints']) {
            return -1;
        }
        if (teamA['AltMatchPoints'] < teamB['AltMatchPoints']) {
            return 1;
        }
        
        //Month Inverted
        if (teamA['registrationDate']['month'] > teamB['registrationDate']['month']) {
            return 1;
        }
        if (teamA['registrationDate']['month'] < teamB['registrationDate']['month']) {
            return -1;
        }

        if (teamA['registrationDate']['day'] > teamB['registrationDate']['day']) {
            return -1;
        }
        if (teamA['registrationDate']['day'] < teamB['registrationDate']['day']) {
            return 1;
        }

        alert(teamA["teamName"] + ":" + teamB["teamName"] + " scores are the same")
        return 0;
    }

    createRankingList() {
        let teamScoresArray = [];
        for (const [key, value] of Object.entries(this.scores)) {
            teamScoresArray.push({
                "teamName": key,
                ...value
            })
        }
        return teamScoresArray.sort(this.rankingSort);
    }

    static reconcile(teamInfo, gameScores) {

        const teamsTally = {}

        for (var i = 0; i < gameScores.length; i++) {
            const gameScore = gameScores[i]
            const teams = Object.keys(gameScore);
            for (var j = 0; j < teams.length; j++) {
                var gameTeam = teams[j];
                if (typeof teamInfo[gameTeam] !== 'object') {
                    throw new Error(`Invalid Match Team - "${gameTeam}"`)
                }


                if (typeof teamsTally[gameTeam] === 'undefined') {
                    teamsTally[gameTeam] = {
                        "groupNumber": teamInfo[gameTeam]['groupNumber'],
                        "registrationDate": teamInfo[gameTeam]['registrationDate'],
                        "MatchPoints": 0,
                        "GoalsScored": 0,
                        "AltMatchPoints": 0
                    }
                }

                // Highest total match points. A win is worth 3 points, a draw is worth 1 point, and a loss is worth 0 points.
                teamsTally[gameTeam]['MatchPoints'] = teamsTally[gameTeam]['MatchPoints'] + gameScore[gameTeam]['MatchPoints']

                // If teams are tied, highest total goals scored.
                teamsTally[gameTeam]['GoalsScored'] = teamsTally[gameTeam]['GoalsScored'] + gameScore[gameTeam]['GoalsScored']

                // If teams are still tied, highest alternate total match points. A win is worth 5 points, a draw is worth 3 points, and a loss is worth 1 point.
                teamsTally[gameTeam]['AltMatchPoints'] = teamsTally[gameTeam]['AltMatchPoints'] + gameScore[gameTeam]['AltMatchPoints']

            }
        }

        return new TeamScores(teamsTally)
    }
}

class MatchInfo {


    // Highest total match points. A win is worth 3 points, a draw is worth 1 point, and a loss is worth 0 points.
    MatchState = {
        "Normal": {
            'WIN': [3, 0],
            'DRAW': [1, 1],
            'LOSE': [0, 3],
            'INVALID': [0, 0]
        },
        "Alternate": {
            'WIN': [5, 1],
            'DRAW': [3, 3],
            'LOSE': [1, 5],
            'INVALID': [0, 0]
        }
    }

    constructor(teamA, teamB, teamAGoals, teamBGoals) {
        this.teamA = teamA
        this.teamB = teamB
        this.teamAGoals = teamAGoals
        this.teamBGoals = teamBGoals
    }

    determineWinner() {
        const teamAGoals = this.teamAGoals;
        const teamBGoals = this.teamBGoals;

        let matchState = 'INVALID'
        if (teamAGoals > teamBGoals) {
            matchState = 'WIN'
        } if (teamAGoals === teamBGoals) {
            matchState = 'DRAW'
        } else if (teamAGoals < teamBGoals) {
            matchState = 'LOSE'
        }

        const teamScores = {
            'teamA': teamAGoals,
            'teamB': teamBGoals,
            'teamAWin': matchState
        }

        if (teamScores['teamAWin'] === 'INVALID') {
            throw new Error(`Invalid Match State - "${matchInfoString}"`)
        }

        return teamScores
    }

    calculateScores() {
        const AltMatchState = this.MatchState["Alternate"];
        const MatchState = this.MatchState["Normal"];
        const teamScores = this.determineWinner();
        let scores = {};
        const teamA = this.teamA;
        const teamB = this.teamB;
        scores[teamA] = {
            'MatchPoints': MatchState[teamScores['teamAWin']][0],
            'GoalsScored': teamScores['teamA'],
            'AltMatchPoints': AltMatchState[teamScores['teamAWin']][0]
        };
        scores[teamB] = {
            'MatchPoints': MatchState[teamScores['teamAWin']][1],
            'GoalsScored': teamScores['teamB'],
            'AltMatchPoints': AltMatchState[teamScores['teamAWin']][1]
        };
        return scores;
    }

    static fromString(matchInfoString) {
        // TODO handle team names with spaces
        const matchInfoArray = matchInfoString.trim().split(" ")

        if (matchInfoArray.length < 4) {
            throw new Error(`Invalid Match Info Input - "${matchInfoString}"`)
        }
        if (matchInfoArray[0].length === 0 || matchInfoArray[1].length === 0) {
            throw new Error(`Invalid Match Team Name Input - "${matchInfoString}"`)
        }

        // TODO fw and bw slash
        const teamA = matchInfoArray[0]
        const teamB = matchInfoArray[1]
        const teamAGoals = parseInt(matchInfoArray[2])
        const teamBGoals = parseInt(matchInfoArray[3])

        return new MatchInfo(teamA, teamB, teamAGoals, teamBGoals)
    }
}

class RegistrationDate {

    static validDay = {
        1: 31,
        2: [28, 29],
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
    }

    constructor(day, month) {
        this.day = day;
        this.month = month;
    }

    static validateDate(day, month) {

        const validDay = RegistrationDate.validDay;

        if (typeof validDay[month] !== 'number' && typeof validDay[month] !== 'object') {
            throw new Error(`Invalid Team Registration Month Date Input - "${teamInfoString}"`)
        }

        const validDayInMonth = validDay[month]

        if (typeof validDayInMonth === 'number') {
            if (day < 1 || day > validDayInMonth) {
                throw new Error(`Invalid Team Registration Month Date Input - "${teamInfoString}"`)
            }
        } else {
            if (day < 1 || !validDayInMonth.includes(day)) {
                throw new Error(`Invalid Team Registration Month Date Input - "${teamInfoString}"`)
            }
        }
    }

    toString(){
       return this.day.toString().padStart(2, "0") + "/" + this.month.toString().padStart(2, "0")
    }

    static fromString(dateString) {

        // TODO fw and bw slash
        const registrationDateArray = dateString.split("/")

        if (registrationDateArray.length < 2) {
            throw new Error(`Invalid Team Registration Date Input - "${teamInfoString}"`)
        }

        const day = parseInt(registrationDateArray[0])
        const month = parseInt(registrationDateArray[1])
        RegistrationDate.validateDate(day, month);
        return new RegistrationDate(day, month);
    }
}

class Team {

    constructor(teamName, registrationDate, groupNumber) {
        this.teamName = teamName;
        this.registrationDate = registrationDate;
        this.groupNumber = groupNumber;
    }

    static fromString(teamInfoString) {

        // TODO handle team names with string
        const teamInfoArray = teamInfoString.trim().split(" ")

        if (teamInfoArray.length < 3) {
            throw new Error(`Invalid Team Info Input - "${teamInfoString}"`)
        }

        if (teamInfoArray[0].length === 0) {
            throw new Error(`Invalid Team Name Input - "${teamInfoString}"`)
        }

        const teamName = teamInfoArray[0];
        const registrationDate = RegistrationDate.fromString(teamInfoArray[1])
        const groupNumber = parseInt(teamInfoArray[2])

        return new Team(teamName, registrationDate, groupNumber)

    }
}



function loadLocalData() {
    const teamsLS = localStorage.getItem("teams")
    if (teamsLS) {
        document.getElementById("team-info").value = teamsLS
    }

    const resultsLS = localStorage.getItem("results")
    if (resultsLS) {
        document.getElementById("match-results").value = resultsLS
    }
    if (resultsLS && teamsLS) {
        // tally()
    }
}

function clearForm() {
    localStorage.clear();
    document.getElementById("ranking").innerHTML = ''
    document.getElementById("team-info").value = ''
    document.getElementById("match-results").value = ''
}

function createRankingTableElement(teamScores) {
    const tableObject = document.createElement("table")

    const row = tableObject.insertRow();
    const teamNameCellHeader = row.insertCell();
    const groupCellHeader = row.insertCell();
    const rankingCellHeader = row.insertCell();
    const matchPointsCellHeader = row.insertCell();
    const goalsScoredCellHeader = row.insertCell();
    const altMatchPointsCellHeader = row.insertCell();
    const registrationDateCellHeader = row.insertCell();

    teamNameCellHeader.innerText = "Team Name"
    groupCellHeader.innerText = "Group"
    rankingCellHeader.innerText = "Ranking"
    matchPointsCellHeader.innerText = "Match Points"
    goalsScoredCellHeader.innerText = "Goals Scored"
    altMatchPointsCellHeader.innerText = "Alt Match Points"
    registrationDateCellHeader.innerText = "Registration Date"

    for (var i = 0; i < teamScores.length; i++) {
        const row = tableObject.insertRow();
        const teamNameCell = row.insertCell();
        const groupCell = row.insertCell();
        const rankingCell = row.insertCell();
        const matchPointsCell = row.insertCell();
        const goalsScoredCell = row.insertCell();
        const altMatchPointsCell = row.insertCell();
        const registrationDateCell = row.insertCell();

        teamNameCell.innerText = teamScores[i]['teamName']
        groupCell.innerText = teamScores[i]['groupNumber']
        rankingCell.innerText = "Pos " + (i + 1).toString()
        matchPointsCell.innerText = teamScores[i]['MatchPoints']
        goalsScoredCell.innerText = teamScores[i]['GoalsScored']
        altMatchPointsCell.innerText = teamScores[i]['AltMatchPoints']
        registrationDateCell.innerText = teamScores[i]['registrationDate'].toString()
    }
    return tableObject;
}

function tally() {
    const teamsString = document.getElementById("team-info").value
    localStorage.setItem("teams", teamsString)
    const matchResultString = document.getElementById("match-results").value
    localStorage.setItem("results", matchResultString)

    const teamsInfo = parseTeamInfo(teamsString)
    const gamesScore = parseMatchInfo(matchResultString)
    
    const teamScores = TeamScores.reconcile(teamsInfo, gamesScore);
    const rankingList = teamScores.createRankingList();

    const rankingDivElement = document.getElementById("ranking")
    const rankingTableElement = createRankingTableElement(rankingList)
    rankingDivElement.innerHTML = ''
    rankingDivElement.replaceChildren(rankingTableElement)
}

function parseTeamInfo(teamsString) {
    const teamStringList = teamsString.trim().split("\n")
    const teamsInfo = {}
    teamStringList.forEach(teamInfoString => {
        teamInfoString = teamInfoString.trim();
        if (teamInfoString.length === 0) {
            return;
        }
        const team = Team.fromString(teamInfoString);
        teamsInfo[team.teamName] = team;
    });
    return teamsInfo;
}

function parseMatchInfo(matchResultString) {
    const matchResultStringList = matchResultString.trim().split("\n")
    let gameScores = [];
    for (var i = 0; i < matchResultStringList.length; i++) {
        const matchInfoString = matchResultStringList[i].trim();
        if (matchInfoString.length === 0) {
            return;
        }

        const matchInfo = MatchInfo.fromString(matchInfoString);
        const gameScore = matchInfo.calculateScores()
        gameScores.push(gameScore)
    };
    return gameScores;
}