const board = document.getElementById('board')
const allSlots = document.getElementsByClassName('piece-container')
const pieces = document.getElementsByClassName('piece')
const rollDiceButton = document.getElementById('roll-dice')
const dice = document.getElementById('dice-container')
const modal = document.getElementById('modal')
const modalBox = document.getElementById('modal-box')
const rollStartButton = document.getElementById('roll-start-dice')
const turnDice = document.getElementsByClassName('turn-dice')

let boardRepresentation
let selectedPiece
let selectedSlot
let move
let movesCount = 0
let diceResult 
let usedDice
let isWhiteTurn = true
let hasDiceRolled = false
let isCapture = false
let isPieceSelceted = false
let isRetrunFromJail = false
let isPieceRemove = false
let allWhitePiecesHome = false  
let allBlackPiecesHome = false  

// Constractors
function PieceContainer(id, contain){
    this.id = id
    this.contain = contain
}
function Piece(isWhite){
    this.isWhite = isWhite
}
PieceContainer.prototype.toString = function() {
    return '[id: '+this.id +' contain: '+this.contain+']'
}
Piece.prototype.toString = function() {
    return this.isWhite ? 'W' : 'B'
}
function Move(from,to){
    this.from = from
    this.to = to
}

//Initialize
function boardRepresentationInit(){
    boardRepresentation = [
        new PieceContainer(0,[]), new PieceContainer(1, [new Piece(false) , new Piece(false)]) , new PieceContainer(2,[]) , new PieceContainer(3,[]) , new PieceContainer(4,[]) , new PieceContainer(5,[]) , new PieceContainer(6,[new Piece(true), new Piece(true), new Piece(true), new Piece(true), new Piece(true)]) ,
        new PieceContainer(7,[]) , new PieceContainer(8,[new Piece(true), new Piece(true), new Piece(true)]) , new PieceContainer(9,[]) , new PieceContainer(10,[]) , new PieceContainer(11,[]) , new PieceContainer(12,[new Piece(false), new Piece(false), new Piece(false), new Piece(false), new Piece(false)]) ,
        new PieceContainer(13,[new Piece(true), new Piece(true), new Piece(true), new Piece(true), new Piece(true)]) , new PieceContainer(14,[]) , new PieceContainer(15,[]) , new PieceContainer(16,[]) , new PieceContainer(17,[new Piece(false),new Piece(false),new Piece(false)]) , new PieceContainer(18,[]) ,
        new PieceContainer(19,[new Piece(false), new Piece(false), new Piece(false), new Piece(false), new Piece(false)]) , new PieceContainer(20,[]) , new PieceContainer(21,[]) , new PieceContainer(22,[]) , new PieceContainer(23,[]) , new PieceContainer(24,[new Piece(true),new Piece(true)]), new PieceContainer(25,[]), 
        new PieceContainer(26,[]), new PieceContainer(27,[])
    ]
    return boardRepresentation
}
function visualBoardInit(boardRepresentation){
    for (let i in boardRepresentation){
        if (boardRepresentation[i] == null || boardRepresentation[i].contain === null){continue}
        for (let j=0; j<boardRepresentation[i].contain.length; j++){
            var piece = document.createElement('div')
            piece.className = 'piece ' + (boardRepresentation[i].toString().includes('W') ? 'white' : 'black')
            document.getElementById(i).appendChild(piece)
            changeSpaceBetweenPieces(i)
        }
    }
}

// Game Functions
function startGame(){
    visualBoardCreation()
    setVisualBoardIds()
    boardRepresentationInit()
    visualBoardInit(boardRepresentation)
    whoStart()
    clickEvents()
}
function executeTurn(){
    move = convertPiecesLocationsIntoMove()
    if (isLegalMove(move)){
        useDice(move)
        addTransparentToDice(usedDice)
        if (isCapture)
            boardRepresentationCapture()
        boardRepresentationMove()
        visualBoardUpdate()
        changeSpaceBetweenPieces(selectedSlot)
        changeSpaceBetweenPieces(selectedPiece)
        if ((isWhiteTurn && !allWhitePiecesHome) || (!isWhiteTurn && !allBlackPiecesHome))
            allPiecesHomeCheck()
        for (pieceSelcetRemove of allSlots)
            if(pieceSelcetRemove.children.length>0 && pieceSelcetRemove.children[pieceSelcetRemove.children.length-1].className.includes('select-ring'))
                pieceSelcetRemove.children[pieceSelcetRemove.children.length-1].classList.remove('select-ring')
        isCapture = false
        isRetrunFromJail = false
        isPieceRemove = false
        isGameOver()
        movesCount--
        if (movesCount !== 0 && !isValidPostMove()){
            movesCount--
            if (movesCount === 0){
                addTransparentToDice((usedDice===0?1:0))
                alert('No available move, Turn finished')
            }  
        }   
        if (movesCount === 0){
            isWhiteTurn = !isWhiteTurn
            dislpayTurn()
        }    
    }
}

// Display Functions
function visualBoardCreation(){
    for (let i=0, j=0, k=0; i<24; i++, k++){     
        var triangle = document.createElement('div')
        triangle.className = 'triangle'
        triangle.classList.add(i<6 || i>11 && i<18? 'triangle-up-'+(k%2===0?'dark':'light') : 'triangle-down-'+(k%2===0?'dark':'light'))
        board.children[j].appendChild(triangle)
        j = i===11 ? 2 : j 
        if (i===5 || i===11 || i===17) k++
    }
    for(let i=0, j=0, first=true; i<12; i++){
        var pieceContainer = document.createElement('div')
        pieceContainer.className = 'piece-container ' + (i<6 || i>11 && i<18 ? 'up' : 'down')
        board.children[j].children[i].appendChild(pieceContainer)
        if (i === 11 && first){ j=2; i=-1; first = false }
    }
}
function setVisualBoardIds() {
    for (let i=0, j=0, k=0, l=13; i<12; i++, k++, l++){
        board.children[j].children[k].children[0].id = l
        if (i===5){ k=-1; j=2 }
    }
    for (let i=0, j=2, k=11, l=1; i<12; i++, k--, l++){
        board.children[j].children[k].children[0].id = l
        if (i===5){ k=12; j=0 }
    }
}
function whoStart(){
    const startDice = document.getElementsByClassName('dice-start')
    let startMessage = document.getElementById('start-message')
    let diceStartResult = []
    let message = ' Player Roll a Dice'
    let i=0
    rollDiceButton.disabled = true
    rollStartButton.addEventListener('click', ()=>{
        diceStartResult[i] = Math.floor(Math.random()*6 + 1)
        startDice[i].classList.add('_' + diceStartResult[i])
        i++
        startMessage.style = i===0 ? 'color: white' : 'color: black'
        startMessage.innerHTML = (i===0 ? 'White' : 'Black') + message
        isWhiteTurn = diceStartResult[0] > diceStartResult[1] ? true : false
        if (diceStartResult[0] !== diceStartResult[1] && diceStartResult.length === 2){
            startMessage.style = isWhiteTurn ? 'color: white' : 'color: black'
            startMessage.innerHTML = (isWhiteTurn ? 'White' : 'Black') + ' Player You Go First!!'
            setTimeout(() => {
                modal.remove()
                rollDiceButton.disabled = false
            }, 2000)
            turnDice[isWhiteTurn ? 1 : 0].classList.remove('none')
        }
        else if (diceStartResult[0] == diceStartResult[1] && diceStartResult.length === 2){
            i=0
            setTimeout(() => {
                startDice[0].classList.remove('_' + diceStartResult[0])
                startDice[1].classList.remove('_' + diceStartResult[1])
                diceStartResult = []
            }, 1000)
            startMessage.style = i===0 ? 'color: white' : 'color: black'
            startMessage.innerHTML = (i===0 ? 'White' : 'Black') + message
        }
    })
}
function dislpayTurn(){
    if (isWhiteTurn){
        turnDice[0].classList.add('none')
        turnDice[1].classList.remove('none')
    }
    else {
        turnDice[1].classList.add('none')
        turnDice[0].classList.remove('none')
    }
}
function visualBoardUpdate(){
    document.getElementById(move.to).appendChild(document.getElementById(move.from).children[0])
    if (isCapture){
        document.getElementById(isWhiteTurn ? 25 : 0).appendChild(document.getElementById(move.to).children[0])
    }     
}
function changeSpaceBetweenPieces(slot){
    for (let i=0; i<document.getElementById(slot).children.length; i++){
        switch(document.getElementById(slot).children.length){
            case 1: case 2: case 3: case 4:
            case 5: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-20px'; break
            case 6: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-28px'; break
            case 7: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-33px'; break
            case 8: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-37px'; break
            case 9: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-40px'; break
            case 10: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-42px'; break
            case 11: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-44px'; break
            case 12: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-45px'; break
            case 13: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-46px'; break
            case 14: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-47px'; break
            case 15: document.getElementById(slot).children[i].style = 'margin-'+(slot<13 || slot==27?'top':'bottom')+':-48px'; break
        }  
    }
}
function displayDice(){
    for (let i=0; i<2; i++){
        dice.children[i].className = ''
        switch (diceResult[i]){
            case 1: dice.children[i].classList.add('_1'); break
            case 2: dice.children[i].classList.add('_2'); break
            case 3: dice.children[i].classList.add('_3'); break
            case 4: dice.children[i].classList.add('_4'); break
            case 5: dice.children[i].classList.add('_5'); break
            case 6: dice.children[i].classList.add('_6'); break
        }
    }
}
function addTransparentToDice(usedDice){
    dice.children[usedDice].classList.add('dice-transperent')  
}

// Logic Functions
function rollDice(){ 
    let dice1 = Math.floor(Math.random()*6 + 1)
    let dice2 = Math.floor(Math.random()*6 + 1)
    movesCount = dice1===dice2 ? 4 : 2 
    if (dice1===dice2)
        return[dice1, dice1, dice1, dice1]
    return [dice1,dice2]
}
function useDice(move){
    if (isPieceRemove){
        var prevFrom = move.from
        if (isWhiteTurn)
            move.from = diceResult.length===1 ? diceResult[0] : (diceResult[0]>diceResult[1] ? diceResult[0] : prevFrom)
        else 
            move.from = diceResult.length===1 ? 25-diceResult[0] : (diceResult[0]>diceResult[1] ? 25-diceResult[0] : prevFrom)    
    }
    if ((isRetrunFromJail ? (isWhiteTurn ? move.to===25-diceResult[0] : move.to===diceResult[0]) : (isWhiteTurn ? move.from-diceResult[0]===move.to : move.from+diceResult[0]===move.to)) ||
    (isPieceRemove && (isWhiteTurn ? move.from===diceResult[0] : move.from===25-diceResult[0]))){
        usedDice = diceResult.length === 1 && usedDice === 0 ? 1 : 0 
        diceResult.shift()
    } else {
        usedDice = 1
        diceResult.pop()
    }
    if (isPieceRemove)
        move.from = prevFrom
}
function isLegalSelect(selectedPiece){
    if (selectedPiece === 26 || selectedPiece === 27) { return false }
    // Remove Piece
    if (isLegalRemovePiece(selectedPiece))
        return true
    // Return From Jail   
    if (isLegalReturnFromJail(selectedPiece))
        return true
    if (isWhiteTurn && selectedPiece !== 0 && (diceResult.length >= 2 ? (selectedPiece-diceResult[0]<=0 || (boardRepresentation[(selectedPiece-diceResult[0])].toString().includes('B') && boardRepresentation[selectedPiece-diceResult[0]].contain.length>=2)) && 
        (selectedPiece-diceResult[1]<=0 || (boardRepresentation[(selectedPiece-diceResult[1])].toString().includes('B') && boardRepresentation[selectedPiece-diceResult[1]].contain.length>=2)) :
        (selectedPiece-diceResult[0]<=0 || (boardRepresentation[(selectedPiece-diceResult[0])].toString().includes('B') && boardRepresentation[selectedPiece-diceResult[0]].contain.length>=2)))) 
            return false
    else if (!isWhiteTurn && selectedPiece !== 25 && (diceResult.length >= 2 ? (selectedPiece+diceResult[0]>=25 || (boardRepresentation[(selectedPiece+diceResult[0])].toString().includes('W') && boardRepresentation[selectedPiece+diceResult[0]].contain.length>=2)) && 
            (selectedPiece+diceResult[1]>=25 || (boardRepresentation[(selectedPiece+diceResult[1])].toString().includes('W') && boardRepresentation[selectedPiece+diceResult[1]].contain.length>=2)) :
            (selectedPiece+diceResult[0]>=25 || (boardRepresentation[(selectedPiece+diceResult[0])].toString().includes('W') && boardRepresentation[selectedPiece+diceResult[0]].contain.length>=2)))) 
        return false
    //Move Piece
    return isLegalMovePiece(selectedPiece)
}
function isLegalRemovePiece(selectedPiece){
    if (isWhiteTurn && allWhitePiecesHome && boardRepresentation[selectedPiece].toString().includes('W')){
        if (diceResult.length >=2 ? (selectedPiece<diceResult[0] && selectedPiece<diceResult[1]) : selectedPiece<diceResult[0]) 
            return isNoPiecesBehindSelctedPiece(selectedPiece)
        else if (diceResult.length>=2 ? (diceResult[0] === selectedPiece || diceResult[1] === selectedPiece) : diceResult[0] === selectedPiece)
            return true    
    } else if (!isWhiteTurn && allBlackPiecesHome && boardRepresentation[selectedPiece].toString().includes('B')){
        if (diceResult.length >=2 ? (selectedPiece>25-diceResult[0] && selectedPiece>25-diceResult[1]) : selectedPiece>25-diceResult[0]) 
            return isNoPiecesBehindSelctedPiece(selectedPiece)
        else if (diceResult.length>=2 ? (25-diceResult[0] === selectedPiece || 25-diceResult[1] === selectedPiece) : 25-diceResult[0] === selectedPiece)
            return true    
    }
    return false
}
function isLegalReturnFromJail(selectedPiece){
        if (isWhiteTurn && boardRepresentation[0].contain.length>=1 && (diceResult.length>=2 ? (25-diceResult[0] === selectedPiece || 25-diceResult[1] === selectedPiece) : 25-diceResult[0] === selectedPiece)) 
            return true
        else if (!isWhiteTurn && boardRepresentation[25].contain.length>=1 && (diceResult.length>=2 ? (diceResult[0] === selectedPiece || diceResult[1] === selectedPiece) : diceResult[0] === selectedPiece))
            return true
     return false
}
function isLegalMovePiece(selectedPiece){
    if (isWhiteTurn && boardRepresentation[selectedPiece].toString().includes('W') && (boardRepresentation[0].contain.length === 0 || (boardRepresentation[0].contain.length>0 && selectedPiece === 0)))
        return true
    else if (!isWhiteTurn && boardRepresentation[selectedPiece].toString().includes('B') && (boardRepresentation[25].contain.length === 0 || (boardRepresentation[25].contain.length>0 && selectedPiece === 25)))
        return true
    return false
}
function convertPiecesLocationsIntoMove(){
    var from = Number(selectedPiece)
    var to = Number(selectedSlot)
    return new Move(from,to)
}
function isLegalMove(move){
    if (move.to === 0 || move.to === 25) { return false }
    //Return from jail
    if (boardRepresentation[isWhiteTurn ? 0 : 25].contain.length>0 && (isWhiteTurn ? (move.to===25-diceResult[0] || move.to===25-diceResult[1]) : (move.to===diceResult[0] || move.to===diceResult[1])))
        isRetrunFromJail = true
    //Remove pieces from the board  
    if (isWhiteTurn ? allWhitePiecesHome && (move.to===27 && (diceResult.length===1 ? move.from<=diceResult[0] : (move.from<=diceResult[0] || move.from<=diceResult[1]))) : 
        allBlackPiecesHome && (move.to===26 && (diceResult.length===1 ? move.from>=25-diceResult[0] : (move.from>=25-diceResult[0] || move.from>=25-diceResult[1]))))
            isPieceRemove = true
    //Move
    if (((boardRepresentation[move.to].contain.length===0 || boardRepresentation[move.to].contain.toString().includes(isWhiteTurn ? 'W' : 'B') || (boardRepresentation[move.to].contain.toString().includes(isWhiteTurn ? 'B' : 'W') && boardRepresentation[move.to].contain.length===1)) && 
        (isRetrunFromJail || isPieceRemove || (isWhiteTurn ? (move.from-diceResult[0]===move.to || move.from-diceResult[1]===move.to) : move.from+diceResult[0]===move.to || move.from+diceResult[1]===move.to)))){
            //Capture 
            if (boardRepresentation[move.to].contain.toString().includes(isWhiteTurn ? 'B' : 'W') && boardRepresentation[move.to].contain.length===1)
                isCapture = true
        return true
    }
    return false
}
function isValidPostMove(){
    if (boardRepresentation[(isWhiteTurn ? 0 : 25)].contain.length !== 0){
        for (let i=isWhiteTurn?19:0; isWhiteTurn?i<=25:i<=6; i++)
            if (boardRepresentation[i].contain.length === 0 || (boardRepresentation[i].contain.length === 1 && boardRepresentation[i].toString().includes(isWhiteTurn ? 'B' : 'W')) || boardRepresentation[i].toString().includes(isWhiteTurn ? 'W' : 'B')){
                if (isLegalSelect(i))
                    return true 
            }
    }
    else {
        for (let i=0; i<=25; i++){
            if (boardRepresentation[i].contain.length === 0) { continue }
            if (boardRepresentation[i].contain.toString().includes(isWhiteTurn ? 'W' : 'B'))
                if (isLegalSelect(i) || (isWhiteTurn ? (allWhitePiecesHome && isNoPiecesBehindSelctedPiece(i)) : (allBlackPiecesHome && isNoPiecesBehindSelctedPiece(i)))) { return true }
        }
    }
    return false
}
function isNoPiecesBehindSelctedPiece(selectedPiece){
        for (let i=isWhiteTurn?6:19; isWhiteTurn?i>selectedPiece:i<selectedPiece; isWhiteTurn?i--:i++){
            if (boardRepresentation[i].contain.length !== 0 && boardRepresentation[i].contain.toString().includes(isWhiteTurn ? 'W' : 'B'))
                return false
        }
    return true
}
function boardRepresentationMove(){
    boardRepresentation[move.to].contain.push(boardRepresentation[move.from].contain[0])
    boardRepresentation[move.from].contain.shift()
}
function boardRepresentationCapture(){
    boardRepresentation[isWhiteTurn ? 25 : 0].contain.push(boardRepresentation[move.to].contain[0])
    boardRepresentation[move.to].contain.shift()
}
function allPiecesHomeCheck(){
    let whitePiecesHome = 0, blackPiecesHome = 0
    for (let i=1; i<=6; i++)
        if (boardRepresentation[i].toString().includes('W'))
            whitePiecesHome += boardRepresentation[i].contain.length
    for (let i=18; i<=24; i++)
        if (boardRepresentation[i].toString().includes('B'))
            blackPiecesHome += boardRepresentation[i].contain.length
    if (whitePiecesHome === 15) { allWhitePiecesHome = true}
    if (blackPiecesHome === 15) { allBlackPiecesHome = true}
}
function isGameOver(){
    let winMessage = '', mars = false, turkishMars = false
    if (boardRepresentation[isWhiteTurn ? 27 : 26].contain.length === 15){
        winMessage = (isWhiteTurn ? 'WHITE' : 'BLACK') + ' PLAYER WIN'
        if (boardRepresentation[isWhiteTurn? 26 : 27].contain.length === 0)
            for (let i=isWhiteTurn?1:19; isWhiteTurn?i<=6:i<=24; i++)
                if (boardRepresentation[i].toString().includes(isWhiteTurn ? 'B' : 'W'))
                    turkishMars = true
                else
                    mars = true 
        if (turkishMars) { winMessage += '\n TURKISH MARS'}
        else if (mars) { winMessage += '\n MARS'}
        alert (winMessage)      
    }
}

// Click Events
function clickEvents(){
    rollDiceEvent()
    selectPieceEvent()
    selectSlotEvent()
}
function rollDiceEvent(){
    rollDiceButton.addEventListener('click', ()=>{
        if (movesCount !== 0) { 
            alert('Turn is not finished')
        } else {
            diceResult = rollDice()
            displayDice()
            while (movesCount !== 0 && !isValidPostMove()){
                movesCount--
                if (movesCount === 0){
                    if (diceResult.length === 2 || 4){
                        addTransparentToDice(0)
                        addTransparentToDice(1)
                    }
                    else {
                        addTransparentToDice((usedDice===0?1:0))
                    }
                    alert('No available move, Turn finished')
                    isWhiteTurn = !isWhiteTurn
                }
            }
        }
    })
}
function selectPieceEvent(){
    for (let piece of pieces){
        piece.addEventListener('click',()=>{
            if (isLegalSelect(Number(piece.parentElement.id)) && movesCount !== 0){
                selectedPiece = Number(piece.parentElement.id)
                for (pieceSelcetRemove of pieces)
                    pieceSelcetRemove.classList.remove('select-ring')
                piece.parentElement.lastChild.classList.add('select-ring')
                isPieceSelceted = true
            }
        })
    }
}
function selectSlotEvent(){
    for (let slot of allSlots){
        slot.addEventListener('click', ()=>{
            if (isPieceSelceted){
                isPieceSelceted = false
            } else {
                if (document.getElementsByClassName('select-ring').length === 1){
                    selectedSlot = Number(slot.id)
                    executeTurn()
                }
            }
        })
    } 
}

startGame()