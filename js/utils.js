'use strict'

// getRandomInt(min, max) {
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// returns Array of neighbors cells of board
function getArrayOfNeighbours(board, cellI, cellJ) {
    var neighbours = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[0].length) continue
            board[i][j].i = i
            board[i][j].j = j
            neighbours.push(board[i][j])
        }
    }
    return neighbours
}

