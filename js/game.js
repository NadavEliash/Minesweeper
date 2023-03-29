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
    buildBoard(gLevel.size, gLevel.size)
    renderBoard(gBoard, '.board')

}

function buildBoard(ROWS, COLS) {

    // create empty mat
    gBoard = createMat(ROWS, COLS)

    // set HARD CODED mines
    gBoard[1][1] = MINE
    gBoard[3][3] = MINE

    // create cells contains count of the mines around
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            if (gBoard[i][j] === MINE) continue
            const minesAroundCount = setMinesNegsCount(i, j, gBoard)
            const cell = {
                minesAroundCount: minesAroundCount,
                isShown: false,
                isMine: false,
                isMarked: true
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
            if (mat[i][j] === MINE) minesNegsCount++
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
            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this)"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


function onCellClicked(elCell, i, j) {
    // console.log(elCell, i, j)

    const clickedCell = gBoard[i][j]

    var value
    if (clickedCell === MINE) {
        value = MINE
    } else if (clickedCell.minesAroundCount === 0) {
        value = ''
    }
    else {
        value = clickedCell.minesAroundCount
    }


    const location = { i: i, j: j }
    renderCell(elCell, value)
}

function renderCell(elCell, value) {
    elCell.innerHTML = value
}

function onCellMarked(elCell) {
    // console.log(elCell)
    
    renderCell(elCell, '🚩')
}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}
