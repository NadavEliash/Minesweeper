'use strict'

const MINE = '💣'



var gBoard = []
var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: false,
    firstClick: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gFirstClick = { i: 0, j: 0}



function onInitGame() {
    gGame.isOn = true
    gGame.firstClick = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    restartButton('start')

    // create an empty board
    gBoard = createMat(gLevel.size, gLevel.size)
    renderBoard(gBoard, '.board')
}

// set 3 levels. HTML button call the function, according to the selected level

function onLevelSelection(str) {
    switch (str) {
        case 'Beginner':
            gLevel.size = 4
            gLevel.mines = 2
            break
        case 'Medium':
            gLevel.size = 8
            gLevel.mines = 14
            break
        case 'Expert':
            gLevel.size = 12
            gLevel.mines = 32
            break
    }
    onInitGame()
}

// BUILD REAL BOARD, add mines and claulate neighbors

function buildBoard() {

    // add mines into cells (get randomly cells without getting the first clicked)

    gBoard = createMines(gBoard)

    // set HARD CODED mines
    // gBoard[1][1] = {
    //     minesAroundCount: null,
    //     isShown: false,
    //     isMine: true,
    //     isMarked: false
    // }
    // gBoard[3][3] = {
    //     minesAroundCount: null,
    //     isShown: false,
    //     isMine: true,
    //     isMarked: false
    // }


    // create cells contains count of the mines around

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
    // console.table(gBoard)
    return gBoard
}

function createMines(board) {
    const randomCells = getRandomCells(board)
    for (var i = 0; i < randomCells.length; i++) {
        board[randomCells[i].i][randomCells[i].j].isMine = true
    }
    return board
}

function getRandomCells(board) {
    const cells = getCellsArray(board)
    var randomCells = []
    for (var i = 0; i < gLevel.mines; i++) {
        const random = getRandomInt(0, cells.length)
        randomCells.push(cells[random])
    }
    return randomCells
}

// create an array of all board cells but the first clicked

function getCellsArray(board) {
    var cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (i === gFirstClick.i && j === gFirstClick.j) continue
            cells.push({ i: i, j: j })
        }
    }
    console.log(cells)
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

// RENDER an empty board first

function renderBoard(board, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


// CLICKING CELLS

function onCellClicked(elCell, i, j) {
    if (gGame.firstClick) {
        buildBoard()
        gFirstClick = { i: i, j: j }
        gGame.firstClick = false
    }

    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    // console.log(elCell, i, j)

    const clickedCell = gBoard[i][j]

    if (clickedCell.isMine === true) {
        revealMines()
        gGame.isOn = false
        restartButton('lose')
        return
    }

    var value
    if (clickedCell.minesAroundCount > 0) {
        value = clickedCell.minesAroundCount
    }
    else {
        expandShown(gBoard, i, j)
        return
    }

    clickedCell.isShown = true
    gGame.shownCount++
    console.log(gGame.shownCount)
    // console.table(gBoard)

    checkGameOver()
    renderCell(elCell, value)
}

function expandShown(board, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isShown) continue

            const value = board[i][j].minesAroundCount
            const currElcell = getElCell(gBoard, i, j)
            renderCell(currElcell, value)
            board[i][j].isShown = true
            console.log(gGame.shownCount)
            if (value === '') expandShown(board, i, j)
            gGame.shownCount++
        }
    }
}

function getElCell(board, i, j) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    return elCell
}

// marking cell

function onCellMarked(elCell, i, j) {
    // console.log(elCell)
    if (!gGame.isOn) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        renderMarkedCell(elCell, '🚩')
        gGame.markedCount++

    } else {
        gBoard[i][j].isMarked = false
        renderMarkedCell(elCell, '')
        gGame.markedCount--
    }
}

function renderCell(elCell, value) {
    elCell.innerHTML = value
    elCell.classList.add('clicked')

    // console.log(elCell)
}

function renderMarkedCell(elCell, value) {
    elCell.innerHTML = value

    // console.log(elCell)
}



// gameover options

function checkGameOver() {
    // console.log(gGame.shownCount)

    if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) {
        gGame.isOn = false
        restartButton('win')
    }
    return
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                const elCell = getElCell(gBoard, i, j)
                // console.log(elCell)
                renderCell(elCell, MINE)
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


