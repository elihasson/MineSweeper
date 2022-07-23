const MINE = '💣'
const FLAG = '🏁'
// const CLOSED = '🎛️'
const BOOM = '💥'
const EMPTY = ' '
const HEART = '💖'
const HEART_BLACK = '🖤'
const HINT = '💡'


// Default difficulty is Easy
var gMinesNumber = 2
var gBoardSize = 4
var gBoard = []
//elements
var gSelectedCell;
var gGame = {
    minesLeft: 0,
    time: 0,
    isOn: false,
    isSet: false,
    isWiner: false,
    currDifficulty: 1,
    life: 3,
    hint: 3,
}


var tableCell = {
    location: {
        i: 0,
        j: 0,
    },
    numOfNeighbors: 0,
    isSelected: false,
    isFlagged: false,
    isMine: false,
    isOpen: false,
    saved: false,
    lastClicked: false,
    hint: false,
}

var gStartTime
var gTimerInterval
var gTimer
var gHintMode = false
var gTimeOutHint


function init() {
    gBoard = createBoard(gBoardSize, gBoardSize)
    // console.table(gBoard)
    renderBoard(gBoard)
    //in Case of restart
    clearInterval(gTimerInterval)
    gGame.isOn = false
    gGame.life = 3
    gGame.hint = 3
    gGame.time = 0
    gGame.isWiner = false
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = gGame.time;
    // setDifficulty(gGame.currDifficulty)
    gGame.isSet = true
    updateLife()
    updateHints()
    messageUser(`All set!`)
}
// handles clicked cell (actually starts the game)
function cellClicked(cellElm, posI, posJ) {
    // console.log('cellclicked')
    gSelectedCell = gBoard[posI][posJ]

    if (gHintMode) {
        document.body.style.cursor = "auto"
        // debugger
        // document.getElementsByTagName("body")[0].style.cursor = auto
        gHintMode = false
        hintCells = getArrayOfNeighbours(gBoard, posI, posJ)
        hintCells.push(gSelectedCell)
        showHintCells(hintCells)
        // Update DOM
        renderBoard(gBoard)
        // debugger
        // elmCursor = document.body.style.cursor 
        // elmCursor.classList.help  
        
        gTimeOutHint = setTimeout(function(){
            clearHintedCells(gBoard)
        } , 1000)
        return
    }

    //starts theGame
    if (!gGame.isOn) {
        // in Case of clicking the table without restart
        if (!gGame.isSet) {
            init()
            return
        }

        setMines(gBoard, gSelectedCell, gMinesNumber)
        setNeighbours(gBoard)

        // set Mines Left
        gGame.minesLeft = 0
        updateMinesLeft(gMinesNumber)

        // increase Timer and display it
        gGame.time = 0
        gTimerInterval = setInterval(function () {
            var elTimer = document.querySelector('.timer span')
            gGame.time++
            elTimer.innerText = gGame.time;
        }, 1000);

        // start
        gGame.isOn = true
        messageUser(`Game is On ! `)

    }

    if (gSelectedCell.isOpen || gSelectedCell.isFlagged)
        return

    // end of game or life    
    if (gSelectedCell.isMine) {
        gGame.life--
        updateLife()
        if (gGame.life > 0) {
            gSelectedCell.saved = true
            // Update Model
            gBoard[posI][posJ] = gSelectedCell
            updateMinesLeft(-1)
        } else {
            gSelectedCell.lastClicked = true
            // Update Model
            gBoard[posI][posJ] = gSelectedCell
            gGame.isWiner = false
            // endGame sets the table and Updates the DOM
            endGame()
            return
        }
    }

    if (!gSelectedCell.numOfNeighbors) {
        // revealCells(+gSelectedCell.location.i, +gSelectedCell.location.j)
        revealCellsRec(+gSelectedCell.location.i, +gSelectedCell.location.j)
    } else {
        gSelectedCell.isOpen = true
        // Update Model
        gBoard[posI][posJ] = gSelectedCell

    }

    // Update DOM
    renderBoard(gBoard)
}
// sets mines on the bord (without first selected cell)
function setMines(board, selectedCell, minesNumber) {
    // const mines = []
    for (var i = 0; i < minesNumber; i++) {
        var rowIdx = getRandomInt(0, gBoardSize - 1)
        var colIdx = getRandomInt(0, gBoardSize - 1)
        if ((rowIdx === selectedCell.location.i && colIdx === selectedCell.location.j) ||
            board[rowIdx][colIdx].isMine) {
            i--
        } else {
            board[rowIdx][colIdx].isMine = true
        }
    }
    return board
}
// set neighboursCount for all the table
function setNeighbours(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                addNeighborsCount(i, j, board)
            }
        }
    }
}
// adding neighbours count to all the neighbors cells
function addNeighborsCount(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            mat[i][j].numOfNeighbors++
        }
    }
}
// RevealCells By Recursion 
function revealCellsRec(cellI, cellJ) {
    if (cellI < 0 || cellJ < 0 || cellI >= gBoard.length || cellJ >= gBoard[cellI].length ||
        gBoard[cellI][cellJ].isOpen)
        return
    gBoard[cellI][cellJ].isOpen = true
    if (gBoard[cellI][cellJ].numOfNeighbors) {
        return
    }
    // Call all neighbours
    revealCellsRec(cellI + 1, cellJ)          //up
    revealCellsRec(cellI - 1, cellJ)          //down
    revealCellsRec(cellI, cellJ + 1)          //Right
    revealCellsRec(cellI, cellJ - 1)          //Left
    revealCellsRec(cellI + 1, cellJ + 1)      // Primery Up
    revealCellsRec(cellI - 1, cellJ - 1)      // Primary Down
    revealCellsRec(cellI + 1, cellJ - 1)      // Secondary Up
    revealCellsRec(cellI - 1, cellJ + 1)      // Secondary Down
    return

}
// RevealCells without Recursion 
function revealCells(cellI, cellJ) {
    //  debugger
    for (var i = cellI + 1; i < gBoard.length; i++) {
        gBoard[i][cellJ].isOpen = true
        if (gBoard[i][cellJ].numOfNeighbors)
            break
    }

    for (var i = cellI - 1; i >= 0; i--) {
        gBoard[i][cellJ].isOpen = true
        if (gBoard[i][cellJ].numOfNeighbors)
            break
    }

    for (var j = cellJ + 1; j < gBoard[cellI].length; j++) {
        gBoard[cellI][j].isOpen = true
        if (gBoard[cellI][j].numOfNeighbors)
            break
    }

    for (var j = cellJ - 1; j >= 0; j--) {
        gBoard[cellI][j].isOpen = true
        if (gBoard[cellI][j].numOfNeighbors)
            break
    }
    // Primary Diagonal
    j = cellJ
    for (var i = cellI + 1; i < gBoard[cellI].length; i++) {
        j++
        if (j < gBoard[cellI].length) {
            gBoard[i][j].isOpen = true
            if (gBoard[i][j].numOfNeighbors) break
        } else {
            break
        }
    }

    j = cellJ
    for (var i = cellI - 1; i >= 0; i--) {
        j--
        if (j >= 0) {
            if (gBoard[i][j].numOfNeighbors) break
            gBoard[i][j].isOpen = true
        } else {
            break
        }
    }

    // Scondary Diagonal
    j = cellJ
    for (var i = cellI + 1; i < gBoard[cellI].length; i++) {
        j--
        if (j >= 0) {
            gBoard[i][j].isOpen = true
            if (gBoard[i][j].numOfNeighbors) break
        } else {
            break
        }
    }

    j = cellJ
    for (var i = cellI - 1; i >= 0; i--) {
        j++
        if (j < gBoard[cellI].length) {
            if (gBoard[i][j].numOfNeighbors) break
            gBoard[i][j].isOpen = true
        } else {
            break
        }
    }
    // for (var j = cellJ + 1; j < gBoard[cellI].length; j++) {
    //      gBoard[cellI][j].isOpen = true
    //      if (gBoard[cellI][j].numOfNeighbors)
    //      break 
    // }




    // // var neighbors = findNeghbours(cell) //return array of positions of neighbors  
    // for (var i = 0; i < board.length; i++) {
    //     for (var j = 0; j < board[i].length; j++) {
    //         /// now reveals it all - need to add neughbors
    //         if (!board[i][j].isFlagged)
    //             board[i][j].isOpen = true
    //     }
    // }
    // return board
}
// Creates Empty board
function createBoard(rowCount, colCount) {
    var board = []
    for (var i = 0; i < rowCount; i++) {
        board[i] = []
        for (var j = 0; j < colCount; j++) {
            // tmpCounter++
            board[i][j] = createCell(i, j)
        }
    }
    // console.log(board)
    return board
}
// Create Cell object
function createCell(rwIdx, colIdx) {
    // var cell = tableCell
    var cell = []
    cell.location = {
        i: rwIdx,
        j: colIdx,
    }
    cell.numOfNeighbors = 0
    cell.isSelected = false
    cell.isFlagged = false
    cell.isMine = false
    cell.isOpen = false
    cell.saved = false
    cell.lastClicked = false
    cell.hint = false
    // board[rwIdx][colIdx] = cell 
    return cell
}
// create/Update the table in the DOM 
function renderBoard(board) {
    // console.log(board)
    var strHTML = ''
    var value = EMPTY
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="table-cells" >\n`
        for (var j = 0; j < board[i].length; j++) {
            const cell = board[i][j]
            value = EMPTY

            // add cell title 
            const cellTitle = `Cell: ${i}, ${j}`

            // set classes and values
            var className = 'tableCell '
            if (cell.hint) {
                className += 'hint'
                value = cell.numOfNeighbors? cell.numOfNeighbors : EMPTY
                value = cell.isMine ? MINE : value
            } else {
                if (!cell.isOpen) {
                    className += `closedCell `
                    // value = CLOSED
                    if (cell.isFlagged) {
                        className += 'Flagged '
                        value = FLAG
                    }
                } else {
                    className += `openedCell `
                    if (cell.isMine) {
                        className += 'mine '
                        cell.saved ? value = HEART : value = MINE
                        cell.lastClicked ? value = BOOM : value
                    } else {
                        if (cell.numOfNeighbors) {
                            className += 'hasNeighbors '
                            value = cell.numOfNeighbors
                        }
                    }

                }
            }

            // onclick="cellClicked(this, ${i}, ${j}) , oncontextmenu="flagCell(this, ${i}, ${j})" >
            strHTML += `\t<td class="cell ${className}" 
                            title="${cellTitle}" 
                            onclick="cellClicked(this, ${i}, ${j})"; oncontextmenu="flagCell(this, ${i}, ${j})" >
                            ${value}
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    // console.log(strHTML)

    // the strHTML contains all the table (game-table)
    const elTable = document.querySelector('.game-table')
    elTable.innerHTML = strHTML
}
// set the Difficulty level 
function setDifficulty(difficulty) {
    switch (difficulty) {
        case 1:
            gGame.currDifficulty = difficulty
            gBoardSize = 4
            gMinesNumber = 2
            break;
        case 2:
            gGame.currDifficulty = difficulty
            gBoardSize = 8
            gMinesNumber = 12
            break;
        case 3:
            gGame.currDifficulty = difficulty
            gBoardSize = 12
            gMinesNumber = 30
            break;
        case 4:
            gGame.currDifficulty = difficulty
            gBoardSize = 22
            gMinesNumber = 99
            break;
    }
    gGame.minesLeft = 0
    updateMinesLeft(gMinesNumber)
    init()
}
// disable RightClick
function preventContextMenu(event) {
    // console.log(event)
    event.preventDefault()
}
// End Game
function endGame() {
    clearInterval(gTimerInterval)
    revealAllBoard(gSelectedCell)
    // Update DOM
    renderBoard(gBoard)
    gGame.isOn = false
    if (gGame.isWiner) {
        messageUser(`You Won in ${gGame.time} seconds!`)
    } else {
        messageUser(`You're not Focused, Try again!`)
    }
    gGame.isSet = false
    // console.log('the end')
}
// send message to the DOM
function messageUser(str) {
    var elMsg = document.querySelector('.msguser')
    elMsg.innerText = str;
}
// update hearts of life in  the DOM
function updateLife() {
    var elLife = document.querySelector('.lives')
    var str = ''
    if (gGame.life === 0) str = HEART_BLACK + HEART_BLACK + HEART_BLACK
    if (gGame.life === 1) str = HEART + HEART_BLACK + HEART_BLACK
    if (gGame.life === 2) str = HEART + HEART + HEART_BLACK
    if (gGame.life === 3) str = HEART + HEART + HEART

    elLife.innerText = str;
}

// updates Hints in  the DOM
function updateHints() {
    var elHint = document.querySelector('.hints')
    var str = ''
    if (gGame.hint === 0) str = ''
    if (gGame.hint === 1) str = HINT
    if (gGame.hint === 2) str = HINT + HINT
    if (gGame.hint === 3) str = HINT + HINT + HINT

    elHint.innerText = str;
}

function getHint() {
    if (gGame.hint > 0 && gGame.isOn) {
        gGame.hint--
        gHintMode = true
        // document.getElementsByTagName("body")[0].style.cursor = "url('http://wiki-devel.sugarlabs.org/images/e/e2/Arrow.cur'), auto"; 
        // document.body.style.cursor = "wait"
        document.body.style.cursor = "pointer"
        updateHints()
    }
}

function uncoverNeighbours(cellElm) {
    console.log(cellElm)
}
// show cells for hint
function showHintCells(cells) {
    for (var i = 0; i < cells.length; i++) {
        var posI = cells[i].location.i
        var posJ = cells[i].location.j
        gBoard[posI][posJ].hint = true
    }
}
//clear all table from hints
function clearHintedCells(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].hint = false
        }
    }
    // Update DOM
    renderBoard(board)
    clearTimeout(gTimeOutHint)
}


// open all cells in table
function revealAllBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j].isOpen = true
        }
    }

}
// set flag
function flagCell(cellElm, rowIdx, colIdx) {
    // in Case starting game with right click
    if (!gGame.isOn || !gGame.isSet) return
    var cell = gBoard[rowIdx][colIdx]
    // (!cell.isOpen)? cell.isFlagged = !cell.isFlagged : return
    if (!cell.isOpen) {
        // update the model
        cell.isFlagged = !cell.isFlagged
        gBoard[rowIdx][colIdx] = cell
        // update the DOM (renderCell(cellElm))
        if (gBoard[rowIdx][colIdx].isFlagged) {
            // renderCell(cellElm)
            cellElm.innerHTML = FLAG
            cellElm.classList.add('Flagged')
            updateMinesLeft(-1)
        }
        else {
            cellElm.innerHTML = EMPTY
            cellElm.classList.remove('Flagged')
            updateMinesLeft(1)
        }
    } else {
        return null
    }
}
// mines in the board minus flagged cells (call when flag or unflag a cell)
function updateMinesLeft(diff) {
    gGame.minesLeft += diff
    document.querySelector('.mines').innerText = `Mines left: ${gGame.minesLeft}`
    if (gGame.minesLeft === 0) {
        gGame.isWiner = checkIfWinner(gBoard)
    }
    if (gGame.isWiner) endGame()
}
// last checup before winning
function checkIfWinner(board) {
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isFlagged && !board[i][j].isMine ||
                board[i][j].saved && !board[i][j].isMine) {
                return false
            }
        }
    }
    return true
}
// 
