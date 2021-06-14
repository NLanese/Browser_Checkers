const domain = 'http://localhost:3000'

class Player{
    constructor(name, team){
        this.name = name
        this.team = team
        this.pieces = 12
        this.kings = 0
    }

    displayScore(){
        return (`${this.name}'s Stats:\n` +
                `Team: ${this.team}\n` +
                 `${this.pieces} pieces left\n` +
                 `${this.kings} kings`)
    }

    losePiece(){
        this.pieces = this.pieces - 1
    }

}

class Board{
    constructor(){
        this.checkerGrid = [
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ]
        ]
        this.spacesGrid = [
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ],
            [ [null], [null], [null], [null], [null], [null], [null], [null] ]
        ]
        this.red_left = 12
        this.black_left = 12
        this.turns = 0
        let rowLen = 8
        let colLen = 8
        let i = 0
        let j = 0
        while (i < rowLen){
            while(j < colLen){
                this.spacesGrid[i][j] = document.getElementById(`[${i}][${j}]`)
                j = j + 1
            }
            i = i + 1
        }
    }
    render(){
        let i = 0
        let j = 0
        let rowLen = 8
        let colLen = 8
        while (i < rowLen){
            j = 0
            while(j < colLen){
                 if (this.checkerGrid[i][j].id){
                    let selSpace = document.getElementById(`[${i}][${j}]`)
                    let selCheck = document.getElementById(this.checkerGrid[i][j].id)
                   // console.log(selCheck)
                    selCheck.dataset.pos = selSpace.getAttribute('id')
                    if (i == 0 && selCheck.getAttribute('class').includes('black')){
                        fetch(domain + `/pieces/kingMe/${selCheck.getAttribute('id')}`)
                        selCheck.setAttribute('style', "background-color: silver")
                    }
                    else if (i == 7 && selCheck.getAttribute('class').includes('red')){
                        fetch(domain + `/pieces/kingMe/${selCheck.getAttribute('id')}`)
                        selCheck.setAttribute('style', "background-color: pink")
                    }
                    selSpace.appendChild(selCheck)
                 }
                 else{}
                j = j + 1
            }
            i = i + 1
        }
    }
    changeCheckersGrid(spaces){
        let row = 0
        while (row < 8){
            let col = 0
            while (col < 8){
                if(spaces[row][col].id){
                    this.checkerGrid[row][col] = spaces[row][col]
                }
                else{
                    this.checkerGrid[row][col] = [null]
                }
                col = col + 1
            }
            row = row + 1
        }
        this.render()
    }
    completeTurn(){
        this.turns = this.turns + 1
        this.displayPrompt()
    }
    displayPrompt(){
        let scoreBoard = document.getElementById("Whose_Turn")
        let teamUp = ""
        if (this.turns % 2 == 0){
            teamUp = "Red"
        }
        else{
            teamUp = "Black"
        }
        scoreBoard.innerHTML = `<h3>${teamUp}'s Turn</h3>
                                <p>Red pieces left: ${this.red_left}</p>
                                <p>Black pieces left: ${this.black_left}</p>`
    }
}


let state = { 
    current_piece: null,
    possibleDelete: null,
    deleteCombo: null
}
function clearState(){
    state = {
        current_piece: null,
        possibleDelete: null,
        deleteCombo: null
    }
}
let board = new Board()
let prompt = document.createElement('div')
prompt.setAttribute('id', "Whose_Turn")
prompt.textContent = `Red Team's Move`
document.body.appendChild(prompt)


function populate(spaces){
    let row = 0
    spaces.forEach( (iRow) => {
        let col = 0
        iRow.forEach( (iCol) => {
            if (iCol.id){
                let checker = document.createElement('div')
                let color = iCol.team
                let c_id = iCol.id
                let loc = `[${row}][${col}]`
                checker.setAttribute('class', `${color} checker`)
                checker.setAttribute('id', c_id)
                checker.setAttribute('data-pos', loc)
                board.checkerGrid[row][col] = checker
                checker.addEventListener('click', (e) => {
                    let selected = document.getElementById(e.toElement.attributes.id.value)
                    if (selected == state.current_piece){
                        return
                    }
                    state.current_piece = selected.getAttribute('id')
                    if (board.turns % 2 == 0 && checker.getAttribute('class').includes('red')){
                        resetBoardColors()
                        handleMove(selected.getAttribute('id'))
                        // turns = turns + 1
                        // prompt.textContent = `Black Team's Move`
                    }
                    else if (board.turns % 2 == 1 && checker.getAttribute('class').includes('black')){
                        resetBoardColors()
                        handleMove(selected.getAttribute('id'))
                        // turns = turns + 1
                        // prompt.textContent = `Red Team's Move`
                    }
                    else{
                        console.log("Wrong Team")
                    }
                })
                spaceOccupying = document.getElementById(loc)
                spaceOccupying.appendChild(checker)
            }
            col = col + 1
        })
        row = row + 1
    })
}


function revealMoves(json){
    let allSpaces = document.querySelectorAll(".square")
    json.forEach((target) => {
        console.log(target)
        potentialElim = target.split(": ")[1]
        target = target.split("-")[0]
        if (potentialElim){
            state.possibleDelete = potentialElim
            state.deleteCombo = target
        }
        allSpaces.forEach((square) => {
            if (target == square.getAttribute('id')){
                square.setAttribute("style", "background-color: green")
            //  THIS IS RESPONSIBLE FOR CONFIRMING A PLAYERS MOVE. ONLY GREEN SQUARES CAN BE MOVED TO
                square.addEventListener("click", function confirmMove(e){
                    if (e.toElement.getAttribute('style').includes('green')){
                        let fetchTarget = (domain + `/pieces/${state.current_piece}/move/${e.toElement.getAttribute('id')}`)
                        fetch(fetchTarget)
                            .then(resp => resp.json())
                            .then(json => {
                                board.changeCheckersGrid(json.spaces)
                        //  THE HUGE CHUNK OF CODE BELOW IS RESPONSIBLE FOR DETERMINING WHETHER OR NOT A JUMP HAS OCCUERED
                                if (state.possibleDelete){
                                    let recentlyMoved = document.getElementById(state.current_piece)
                                    if (recentlyMoved.dataset.pos == state.deleteCombo){
                                        console.log("Delete Time!")
                                        let deleteMe = document.getElementById(state.possibleDelete)
                                        let deleteCoords = deleteMe.dataset.pos
                                        let deleteX = deleteCoords.split("[")[1].split("]")[0]
                                        let deleteY = deleteCoords.split("[")[2].split("]")[0]
                                        board.checkerGrid[deleteX][deleteY] = [null]
                                        board.checkerGrid[deleteX][deleteY].innerHTML = ""
                                        fetch(domain+ `/pieces/remove/${deleteMe.getAttribute('id')}`)
                                        console.log( deleteX + " " + deleteY)
                                        let colorOfDel = deleteMe.getAttribute('class')
                                        deleteMe.remove()
                                        if (colorOfDel.includes('black')){
                                            board.black_left = board.black_left - 1
                                        }
                                        else{
                                            board.red_left = board.red_left - 1
                                        }
                                    }
                                }
                        //  ------------------------------------------------------------   
                            })
                            .then( () => {
                                resetBoardColors()
                                console.log("Colors reset")
                                board.completeTurn()
                                console.log("Turns reset")
                                clearState()
                            })
                    }
                })
            }
            //-------------------------------------------------------------------------------------------------------------------
        })
    })
}

function handleMove(id){
    fetch(domain + `/pieces/${id}/possible_moves`)
        .then(resp => resp.json())
        .then(json => revealMoves(json))
}

function resetBoardColors(){
    let lightSquares = document.querySelectorAll('.light')
    let darkSquares = document.querySelectorAll(".dark")
    lightSquares.forEach( (square) => {
        square.setAttribute("style", "background-color: rgba(255,255,255,0.25)")
    })
    darkSquares.forEach( (square) => {
        square.setAttribute("style", "background-color: rgba(0,0,0,0.25)")
    })
}



document.addEventListener("DOMContentLoaded", () => {
    fetch(domain + "/boards/new")
        .then(resp => resp.json())
        .then(json => json.spaces)
        .then(spaces => populate(spaces))
})
