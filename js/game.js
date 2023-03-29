'use strict'

const MINE = '💣'



var gBoard = []
var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInitGame() {
    gGame.isOn = true
    buildBoard(gLevel.size, gLevel.size)
    renderBoard(gBoard, '.board')

}


function buildBoard(ROWS, COLS) {

    // create empty mat
    gBoard = createMat(ROWS, COLS)

    // set HARD CODED mines
    gBoard[1][1] = {
        minesAroundCount: null,
        isShown: false,
        isMine: true,
        isMarked: false
    }
    gBoard[3][3] = {
        minesAroundCount: null,
        isShown: false,
        isMine: true,
        isMarked: false
    }

    // create cells contains count of the mines around
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
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


    console.table(gBoard)
    return gBoard
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var minesNegsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine === true) minesNegsCount++
        }
    }
    return minesNegsCount
}

// render empty board first

function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


function onCellClicked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isMarked || gBoard[i][j].isShown) return
    // console.log(elCell, i, j)

    const clickedCell = gBoard[i][j]

    if (clickedCell.isMine === true) {
        revealMines()
        onGameOver()
        return
    }

    var value
    if (clickedCell.minesAroundCount > 0) {
        value = clickedCell.minesAroundCount
    }
    else {
        value = ''
    }

    clickedCell.isShown = true
    gGame.shownCount++
    const location = { i: i, j: j }
    renderCell(elCell, value)
}

function renderCell(elCell, value) {
    elCell.innerHTML = value
    // console.log(elCell)
}

function onCellMarked(elCell, i, j) {
    // console.log(elCell)
    if(!gGame.isOn) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        renderCell(elCell, '🚩')
        gGame.markedCount++

    } else {
        gBoard[i][j].isMarked = false
        renderCell(elCell, '')
        gGame.markedCount--
    }
}

function checkGameOver() {

}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine === true) {
                const elCell = document.querySelector(`.cell-${i}-${j}`)
                console.log(elCell)
                renderCell(elCell, MINE)
            }
        }
    }
}

function onGameOver() {
    gGame.isOn = false
}

function expandShown(mat, elCell, i, j) {

}
