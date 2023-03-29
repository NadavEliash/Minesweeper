'use strict'

/* MATRIX */

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push([{}])
        }
        mat.push(row)
    }
    return mat
}

function copyMat(mat) {
    var newMat = []
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j]
        }
    }
    return newMat
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsCount++
        }
    }
    return neighborsCount
}

function getAmountOfNeighboursContaining(BOARD, ROW, COL, ITEM) {
    var amount = 0
    for (var i = ROW - 1; i <= ROW + 1; i++) {
        if (i < 0 || i > BOARD.length - 1) continue
        for (var j = COL - 1; j <= COL + 1; j++) {
            if (j < 0 || j > BOARD[i].length - 1 || (i === ROW && j === COL)) continue
            if (BOARD[i][j] === ITEM) amount++
        }
    }
    return amount
}

function getAmountOfCellsContaining(BOARD, ITEM) {
    var amount = 0
    for (var i = 0; i < BOARD.length; i++) {
        for (var j = 0; j < BOARD[i].length; j++) {
            if (BOARD[i][j] === ITEM) amount++
        }
    }
    return amount
}


// function getCellsArray(board) {
//     var cells = []
//     for (var i = 0; i < board.length; i++) {
//         for (var j = 0; j < board.length; j++) {
//             cells.push({ i: i, j: j })
//         }
//     }
//     return cells
// }

function getEmptyCells(board) {
    var cells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j] === null) {
                cells.push({ i: i, j: j })
            }
        }
    }
    return cells
}

function createRandomNumsMat(ROWS, COLS) {
    const nums = getRandomOrderNumbersArray(ROWS * COLS)
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push(nums[i * COLS + j])
        }
        mat.push(row)
    }
    return mat
}

function putStringAmountTimesInMat(MAT, STRING, AMOUNT) {
    if (AMOUNT > MAT.length * MAT[0].length) return
    for (var i = 0; i < AMOUNT; i++) {
        var row = getRandomInt(0, MAT.length)
        var col = getRandomInt(0, MAT[0].length)
        if (MAT[row][col] === STRING) {
            i--
        } else {
            MAT[row][col] = STRING
        }
    }
}



/* Random */


function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function getRandomOrderNumbersArray(MAX) {
    const nums = getArrayWithAscNums(MAX)
    var res = []
    for (var i = 0; i < MAX; i++) {
        res[i] = drawNum(nums)
    }
    return res
}

function getArrayWithAscNums(MAX) {
    var numbers = []
    for (var i = 0; i < MAX; i++) {
        numbers[i] = i + 1
    }
    return numbers
}


/* RENDER */

// function renderBoard(mat, selector) {

//     var strHTML = '<table border="0"><tbody>'
//     for (var i = 0; i < mat.length; i++) {
//         strHTML += '<tr>'
//         for (var j = 0; j < mat[0].length; j++) {
//             const cell = mat[i][j]
//             const className = `cell cell-${i}-${j}`

//             strHTML += `<td class="${className}">${cell}</td>`
//         }
//         strHTML += '</tr>'
//     }
//     strHTML += '</tbody></table>'

//     const elContainer = document.querySelector(selector)
//     elContainer.innerHTML = strHTML
// }

function renderBoardByObjProperty(mat, selector, property) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j][property]
            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
// function renderCell(location, value) {
//     const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }



function drawNum(NUMS) {
    return NUMS.splice(getRandomInt(0, NUMS.length), 1)[0]
}

function shuffle(items) {
    for (var i = items.length - 1; i > 0; i--) {
        var randIdx = getRandomInt(0, items.length);
        var keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}
