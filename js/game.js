'use strict'

const STORAGE_KEY = 'bestScoreDB'
const MINE = '💣'
const MARK = '🚩'


var gBoard = []
var gLevel = {
    size: 4,
    mines: 2,
    cellSize: 'cell'
}
var gGame = {
    isOn: false,
    firstClick: true,
    hint: false,
    minesByUser: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}
var gBestScore = {
    beginner: '',
    medium: '',
    expert: ''
}

var gFirstClick = {}
var gStartTime = 0
var gTimeInterval
var gHintClicked
var gScore = 0
var gSafeclickCount
var gMinesByUserCount = 0

var gTurn = 0

var gDark = false
var gSafeclick = false


function onInitGame() {
    gGame.isOn = true
    gGame.firstClick = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.lives = 3
    gSafeclickCount = 3
    gMinesByUserCount = 0
    gTurn = 0



    buttonMinesByUserOff()
    restartButton('start')
    renderLives(gGame.lives)
    renderHints(3)
    renderSafeButton()
    loadFromStorage()

    clearInterval(gTimeInterval)
    restartTime()
    hideScore()

    // create an empty board
    gBoard = createMat(gLevel.size, gLevel.size)
    renderBoard(gBoard, '.board')
}

// SET LEVELS. HTML button call the function, according to the selected level
// each level sets the cells amount, mines amount and cells size

function onLevelSelection(str) {
    switch (str) {
        case 'Beginner':
            gLevel.size = 4
            gLevel.mines = 2
            gLevel.cellSize = 'cell'
            break
        case 'Medium':
            gLevel.size = 8
            gLevel.mines = 14
            gLevel.cellSize = 'cell cell-medium'
            break
        case 'Expert':
            gLevel.size = 12
            gLevel.mines = 32
            gLevel.cellSize = 'cell cell-small'
            break
    }
    onInitGame()
}


// RENDER HINT BOX

function renderHints(count) {
    const elHintsCount = document.querySelector('.hints')
    var str = `<button class="hint" onclick="onHintClicked(this)">💡</button>`
    elHintsCount.innerHTML = str.repeat(count)
}


// LOAD BEST SCORE FROM STORAGE

function loadFromStorage() {
    const str = localStorage.getItem(STORAGE_KEY)
    console.log(str)
    if (!str) return
    gBestScore = JSON.parse(str)

    renderBestScore('.beginner', gBestScore.beginner)
    renderBestScore('.medium', gBestScore.medium)
    renderBestScore('.expert', gBestScore.expert)
}


// RENDER EMPTY BOARD

function renderBoard(board, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            const className = `${gLevel.cellSize} cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


// ON CLICKING CELLS

function onCellClicked(elCell, i, j) {

    // FIRST CLICKING

    if (gGame.firstClick && gGame.isOn) {
        gFirstClick = { i: i, j: j }
        // console.log(gFirstClick)
        if (!gMinesByUserCount) buildBoard()
        gStartTime = Date.now()
        getTime()
        gGame.firstClick = false
    }

    // WHEN HINT SELECTED
    // WHEN MINES-BY-USER SELCTED

    if (!gGame.isOn) {
        if (gGame.hint) {
            renderNegsHint(elCell, i, j)
            return
        } else if (gGame.minesByUser) {
            // console.log(gBoard)
            gBoard[i][j].isMine = true
            renderCellHint(elCell, MINE)
            gMinesByUserCount++

            if (gMinesByUserCount === gLevel.mines) {
                gGame.minesByUser = false
                setTimeout(buildBoardByUser, 2000)
            }
            return
        } else {
            return
        }
    }

    // conditions to play

    if (gBoard[i][j].isMarked || gBoard[i][j].isShown || gSafeclick) return


    const clickedCell = gBoard[i][j]

    // MINE CLICKING

    if (clickedCell.isMine === true) {
        gGame.lives--
        renderLives(gGame.lives)
        gBoard[i][j].isShown = true

        gTurn++
        gBoard[i][j].turn = gTurn

        if (!gGame.lives) {
            elCell.classList.add('red')
            renderCell(elCell, MINE)
            revealMines()
            gGame.isOn = false
            restartButton('lose')
            clearInterval(gTimeInterval)
            return
        } else {
            renderCell(elCell, MINE)
            return
        }
    }

    // CLICKING A NUMBER OR AN EMPTY

    var value
    if (clickedCell.minesAroundCount > 0) {
        value = clickedCell.minesAroundCount
    }
    else {
        gTurn++
        expandShown(gBoard, i, j)
        return
    }

    clickedCell.isShown = true
    gGame.shownCount++
    gTurn++
    gBoard[i][j].turn = gTurn

    // console.log(gGame.shownCount)
    // console.table(gBoard)

    checkGameOver()
    renderCell(elCell, value)
}

function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMarked) continue
            if (board[i][j].isShown) continue

            const value = board[i][j].minesAroundCount
            const currElcell = getElCell(i, j)
            renderCell(currElcell, value)
            board[i][j].isShown = true
            // console.log(gGame.shownCount)
            if (value === '') expandShown(board, i, j)
            gGame.shownCount++
            gBoard[i][j].turn = gTurn
            checkGameOver()
        }
    }
}

// RENDER CELL

function renderCell(elCell, value) {
    elCell.innerHTML = value
    elCell.classList.add('clicked')

    // console.log(elCell)
}

function getElCell(i, j) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    return elCell
}

function getValue(i, j) {
    var value
    if (gBoard[i][j].isMine) { value = MINE }
    else if (gBoard[i][j].isMarked) { value = MARK }
    else if (gBoard[i][j].minesAroundCount > 0) { value = gBoard[i][j].minesAroundCount }
    else { value = '' }
    return value
}


// BUILD THE REAL BOARD (after first clicking), add mines and claulate neighbors

function buildBoard() {

    // add mines into cells (get randomly cells without getting the first clicked)

    gBoard = createMines(gBoard)

    // HARD CODED MINES
    // gBoard[1][1] = {minesAroundCount: null, isShown: false, isMine: true, isMarked: false}
    // gBoard[3][2] = {minesAroundCount: null, isShown: false, isMine: true, isMarked: false}


    // create cells contains count of the mines around

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue
            const minesAroundCount = setMinesNegsCount(i, j, gBoard)
            const cell = {
                minesAroundCount: minesAroundCount,
                isShown: false,
                isMine: false,
                isMarked: false,
                turn: 0
            }
            gBoard[i][j] = cell
        }
    }
    // console.table(gBoard)
    return gBoard
}

function createMines(board) {
    const randomCells = getRandomCells(board)
    for (var i = 0; i < randomCells.length; i++) {
        board[randomCells[i].i][randomCells[i].j] = {
            minesAroundCount: null,
            isShown: false,
            isMine: true,
            isMarked: false
        }
    }
    return board
}

function getRandomCells(board) {
    var cells = getCellsArray(board)
    var randomCells = []
    for (var i = 0; i < gLevel.mines; i++) {
        const random = getRandomInt(0, cells.length)
        randomCells.push(cells[random])
        cells.splice(random, 1)
    }
    // console.log(randomCells)
    return randomCells
}


// FIRST CLICK SAFETY
// creates an array of all board cells without the first clicked, then puts mines randomly using that array

function getCellsArray(board) {
    var cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (i === gFirstClick.i && j === gFirstClick.j) continue
            cells.push({ i: i, j: j })
        }
    }
    // console.log(cells)
    return cells
}

function setMinesNegsCount(cellI, cellJ, board) {
    var minesNegsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine === true) minesNegsCount++
        }
    }
    if (!minesNegsCount) return ''
    return minesNegsCount
}



// MARKING CELLS

function onCellMarked(elCell, i, j) {
    // console.log(elCell)
    if (!gGame.isOn) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        renderMarkedCell(elCell, MARK)
        gGame.markedCount++

    } else {
        gBoard[i][j].isMarked = false
        renderMarkedCell(elCell, '')
        gGame.markedCount--
    }
}

function renderMarkedCell(elCell, value) {
    elCell.innerHTML = value

    // console.log(elCell)
}



// GAME OVER options

function checkGameOver() {
    // console.log(gGame.shownCount)

    if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) {

        clearInterval(gTimeInterval)
        gGame.isOn = false
        restartButton('win')
        renderScore()
        getBestScore()
    }
    return
}

function getBestScore() {
    var currLevel
    if (gLevel.size === 4) currLevel = 'beginner'
    if (gLevel.size === 8) currLevel = 'medium'
    if (gLevel.size === 12) currLevel = 'expert'

    if (gBestScore[currLevel] === '') {
        gBestScore[currLevel] = gScore
    } else if (gScore < gBestScore[currLevel]) {
        gBestScore[currLevel] = gScore
    }

    renderBestScore(`.${currLevel}`, gBestScore[currLevel])
    saveToStorage(gBestScore)
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                const elCell = getElCell(i, j)
                // console.log(elCell)
                setTimeout(renderCell, 60 * i, elCell, MINE)
            }
        }
    }
}

function restartButton(str) {
    const restartButton = document.querySelector('.restart')
    switch (str) {
        case 'start':
            restartButton.innerHTML = '🙂'
            break
        case 'win':
            restartButton.innerHTML = '😎'
            break
        case 'lose':
            restartButton.innerHTML = '😩'
            break
    }
}

function renderLives(count) {
    const elLivesCount = document.querySelector('.lives')
    elLivesCount.classList.remove('dead')
    var str = '💗 '
    elLivesCount.innerHTML = str.repeat(count)
    if (count === 0) {
        elLivesCount.innerHTML = '💀'
        elLivesCount.classList.add('dead')
    }
}


// HINTS

function onHintClicked(elHint) {
    if (!gGame.isOn || gGame.firstClick) return
    gGame.hint = true
    gGame.isOn = false
    gHintClicked = elHint
    gHintClicked.classList.add('clicked-hint')
}

function renderNegsHint(elCell, cellI, cellJ) {

    // RENDER CELL AND NEGS
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isShown === true) continue

            if (gBoard[i][j].isMine === true) {
                renderCellHint(getElCell(i, j), MINE)
            } else if (gBoard[i][j].minesAroundCount > 0) {
                renderCellHint(getElCell(i, j), gBoard[i][j].minesAroundCount)
            } else {
                renderCellHint(getElCell(i, j), '')
            }
        }
    }

    // RENDER IT BACK TO COVER CELL
    setTimeout(renderNegsHintBack, 1000, elCell, cellI, cellJ)
}

function renderCellHint(elCell, value) {
    elCell.innerHTML = value
    elCell.classList.add('clicked-hint')
}

function renderNegsHintBack(elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (gBoard[i][j].isShown === true) continue
            renderCellEmpty(getElCell(i, j), '')
        }
    }
    cancelHint()
}

function renderCellEmpty(elCell, value) {
    elCell.innerHTML = value
    elCell.classList.remove('clicked', 'clicked-hint', 'safe')
}

function cancelHint() {
    gGame.hint = false
    gGame.isOn = true
    gHintClicked.classList.add('hide')
}


// TIME AND SCORE

function getTime() {
    gTimeInterval = setInterval(() => {
        var diff = Date.now() - gStartTime

        var zeroFill = ''
        if (diff < 100000) zeroFill = '0'
        if (diff < 10000) zeroFill = '00'

        gScore = (diff / 1000).toFixed()
        const elTime = document.querySelector('.time')
        elTime.innerHTML = `${zeroFill}${(diff / 1000).toFixed()}`
    }, 1000);
}

function restartTime() {
    const elTime = document.querySelector('.time')
    elTime.innerHTML = '000'
}

function renderScore() {
    var zeroFill = ''
    if (gScore < 100) zeroFill = '0'
    if (gScore < 10) zeroFill = '00'

    const elScore = document.querySelector('.h1-score')
    elScore.innerHTML = `Nice! You done it by <span class="score-dig"> ${zeroFill}${gScore}</span> seconds`
}

function hideScore() {
    const elScore = document.querySelector('.h1-score')
    elScore.innerHTML = ''
}
function renderBestScore(levelStr, bestScore) {
    if (bestScore === '') return
    var zeroFill = ''
    if (bestScore < 100) zeroFill = '0'
    if (bestScore < 10) zeroFill = '00'

    const elBestScore = document.querySelector(levelStr)
    elBestScore.innerHTML = `${zeroFill}${bestScore}`
}


// SAFE CLICK BUTTON

function onSafeClick() {
    if (!gGame.isOn || !gSafeclickCount || gGame.firstClick) return
    const cells = getCoverCells()
    const random = getRandomInt(0, cells.length)
    const safeCell = cells[random]
    const elCell = getElCell(safeCell.i, safeCell.j)

    var value = ''
    if (gBoard[safeCell.i][safeCell.j].minesAroundCount > 0) value = gBoard[safeCell.i][safeCell.j].minesAroundCount
    if (gBoard[safeCell.i][safeCell.j].isMine) value = MINE
    renderSafeCell(elCell, value)
    gSafeclick = true
    setTimeout(renderCellEmpty, 1000, elCell, '');
    setTimeout(() => { gSafeclick = false }, 1000);
    gSafeclickCount--
    renderSafeButton()
}

function getCoverCells() {
    var cells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked || gBoard[i][j].isMine) continue
            cells.push({ i: i, j: j })
        }
    }
    return cells
}

function renderSafeCell(elCell, value) {
    elCell.innerHTML = value
    elCell.classList.add('safe')
}

function renderSafeButton() {
    const elSafeButtonNum = document.querySelector('.num-clicks-remain')
    elSafeButtonNum.innerHTML = `${gSafeclickCount}`
}


// MANUALY POSITIONED MINES

function onMinesByUser() {
    onInitGame()
    gGame.isOn = false
    gGame.minesByUser = true
    buttonMinesByUserOn()
}

function buildBoardByUser() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue
            const minesAroundCount = setMinesNegsCount(i, j, gBoard)
            const cell = {
                minesAroundCount: minesAroundCount,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gBoard[i][j] = cell
        }
    }

    buttonMinesByUserOff()
    renderBoard(gBoard, '.board')
    gGame.isOn = true
    gGame.minesByUser = false
    // console.log(gBoard)
}

function buttonMinesByUserOn() {
    const elButton = document.querySelector('.button.mines-by-user')
    elButton.classList.add('clicked')
}

function buttonMinesByUserOff() {
    const elButton = document.querySelector('.button.mines-by-user')
    elButton.classList.remove('clicked')
}


// UNDO

function onUndo() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].turn === gTurn) {
                gBoard[i][j].isShown = false
                gGame.shownCount--
                gBoard[i][j].turn = 0
                renderCellEmpty(getElCell(i, j), '')
            }
        }
    }
    gTurn--
}


// DARK MODE

function onDark() {
    gDark = !gDark

    const elLink = document.querySelector('.dark-mode')
    
    if (gDark) {
        elLink.href = 'css/dark.css'
    } else {
        elLink.href = ''
    }
}

// SAVE TO STORAGE

function saveToStorage(records) {
    const str = JSON.stringify(records)
    localStorage.setItem(STORAGE_KEY, str)
}