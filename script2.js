const rotateButton = document.querySelector('#rotate-button');
const shipsContainer = document.querySelector('.ships-container');
const startButton = document.querySelector('#start-button');
const displayInfo = document.querySelector('#info');
const displayTurn = document.querySelector('#turn-display');

//Changing ship orientation
let rotationAngle = 0;
function rotate() {
    let shipOptions = Array.from(shipsContainer.children);
    if (rotationAngle == 0) {
        rotationAngle = 90;
    } else {
        rotationAngle = 0;
    }
    shipOptions.forEach(shipOption => shipOption.style.transform = `rotate(${rotationAngle}deg)`);
}
rotateButton.addEventListener('click', rotate);


//Creating boards
const width = 10;
const gamesBoardContainer = document.querySelector('#gamesboard-container');
function createBoard(color, user) {
    let gameBoardContainer = document.createElement('div');
    gameBoardContainer.classList.add('game-board');
    gameBoardContainer.style.backgroundColor = color;
    gameBoardContainer.id = user;

    for (let i = 0; i < width**2; i++) {
        let block = document.createElement('div');
        block.classList.add('block');
        block.id = i;
        gameBoardContainer.append(block);
    }
    gamesBoardContainer.append(gameBoardContainer);
}
createBoard('#f0e9e9', 'player');
createBoard('#f0e9e9', 'computer');


//Creating ships
class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
    }
}
const destroyer = new Ship('destroyer', 2);
const submarine = new Ship('submarine', 3);
const cruiser = new Ship('cruiser', 3);
const battleship = new Ship('battleship', 4);
const carrier = new Ship('carrier', 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;


//Randomly places ships on computer's board
function addShipPiece(user, ship, startId) {
    let allBoardBlocks = document.querySelectorAll(`#${user} div`);
    let randomBoolean = Math.random() < 0.5;
    let isHorizontal = user === 'player' ? rotationAngle === 0 : randomBoolean;
    let randomStartIndex = Math.floor(Math.random() * width ** 2);
    
    let startIndex = startId ? startId : randomStartIndex;

    let validStart = isHorizontal ? startIndex <= width ** 2 - ship.length ? startIndex :
        width ** 2 - ship.length :
        startIndex <= width ** 2 - 1 - width * ship.length + width ? startIndex :
        startIndex - width * ship.length + width;

    let shipBlocks = [];

    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + (width * i)]);
        }
    }

    let valid;
    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) => 
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id < 90 + (width * index + 1))
    }
    
    let notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'));

    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('taken');
        })
    } else {
        if (user === 'computer') {
            addShipPiece(user, ship);
        }
        if (user === 'player') {
            notDropped = true;
        }
    }
}
ships.forEach(ship => addShipPiece('computer', ship));


//Drag player ships
let draggedShip;
const shipOptions = Array.from(shipsContainer.children);
shipOptions.forEach(shipOption => shipOption.addEventListener('dragstart', beginDrag))

const allPlayerBlocks = document.querySelectorAll('#player div');
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver);
    playerBlock.addEventListener('drop', drop);
})

function beginDrag(event) {
    notDropped = false;
    draggedShip = event.target;
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    const startId = event.target.id;
    const ship = ships[draggedShip.id];
    addShipPiece('player', ship, startId);
    if (!notDropped) {
        draggedShip.remove();
    }
}


let isGameOver = false;
let playerTurn;

//Start game
function startGame() {
    if (playerTurn == undefined) {
        if (shipsContainer.children.length != 0) {
            displayInfo.textContent = 'You must place all your ships first!'
        } else {
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick));
            playerTurn = true;
            displayTurn.textContent = "It's your turn";
            displayInfo.textContent = 'Pick a cell';
        }
    }
}
startButton.addEventListener('click', startGame);

let playerHits = [];
let computerHits = [];
let shipsSunkByPlayer = [];
let shipsSunkByComputer = [];


//Player's turn
function handleClick(event) {
    if (!isGameOver) {
        // Check if a cell is already clicked
        if (!event.target.classList.contains('hit') && !event.target.classList.contains('miss')) {
            if (event.target.classList.contains('taken')) {
                event.target.classList.add('hit');
                event.target.style.lineHeight = event.target.clientHeight + 'px';
                event.target.textContent = 'X';
                displayInfo.textContent = "Wow! You HIT a ship";
                let classes = Array.from(event.target.classList);
                classes = classes.filter(className => className != 'block');
                classes = classes.filter(className => className != 'hit');
                classes = classes.filter(className => className != 'taken');
                playerHits.push(...classes);
                checkScore('player', playerHits, shipsSunkByPlayer);
            } else {
                displayInfo.textContent = "You MISSED!";
                event.target.classList.add('miss');
                event.target.style.lineHeight = event.target.clientHeight + 'px';
                event.target.textContent = 'miss';
            }
            playerTurn = false;
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
            setTimeout(computerTurn, 1000);
        } else {
            // Provide feedback that the cell has already been clicked
            displayInfo.textContent = "You've already selected this cell! Pick a different one";
        }
    }
}


let indices = Array.from({ length: 100 }, (_, index) => index);


//Computer's Turn
function computerTurn() {
    if (!isGameOver) {
        displayTurn.textContent = "It's the Computer's Turn";
        displayInfo.textContent = "The Computer is Thinking";
        setTimeout(() => {
            let randomIndex = Math.floor(Math.random() * indices.length);
            let randomPick = indices[randomIndex];
            indices.splice(randomIndex, 1);
            let allBoardBlocks = document.querySelectorAll('#player div');
                
            if (allBoardBlocks[randomPick].classList.contains('taken') && !allBoardBlocks[randomPick].classList.contains('hit')) {
                allBoardBlocks[randomPick].classList.add('hit');
                allBoardBlocks[randomPick].style.lineHeight = allPlayerBlocks[randomPick].clientHeight + 'px';
                allBoardBlocks[randomPick].textContent = 'X';
                displayInfo.textContent = 'The computer hit your ship!';
                let classes = Array.from(allBoardBlocks[randomPick].classList);
                classes = classes.filter(className => className != 'block');
                classes = classes.filter(className => className != 'hit');
                classes = classes.filter(className => className != 'taken');
                computerHits.push(...classes);
                checkScore('computer', computerHits, shipsSunkByComputer);
            } else {
                displayInfo.textContent = 'The Computer MISSED';
                allBoardBlocks[randomPick].classList.add('miss');
                allBoardBlocks[randomPick].style.lineHeight = allBoardBlocks[randomPick].clientHeight + 'px';
                allBoardBlocks[randomPick].textContent = 'miss';
            }
        }, 2000)
        setTimeout(() => {
            playerTurn = true;
            displayTurn.textContent = "It's your turn";
            displayInfo.textContent = 'Pick a cell';
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
        }, 3000)
    }
}


//Check score
function checkScore(user, userHits, shipsSunkByUser) {
    function checkShip(shipName, shipLength) {
        if (userHits.filter(storedShipName => storedShipName == shipName).length === shipLength) {
            if (user == 'player') {
                displayInfo.textContent = `HIT! You SUNK the computer's ${shipName}!`;
                playerHits = userHits.filter(storedShipName => storedShipName != shipName);
            }
            if (user == 'computer') {
                displayInfo.textContent = `The computer SUNK your ${shipName}!`;
                computerHits = userHits.filter(storedShipName => storedShipName != shipName);
            }
            let userBoard;
            if (user == 'computer') {
                userBoard = 'player';
            } else {
                userBoard = 'computer';
            }
            shipsSunkByUser.push(shipName);
            let computerShipCells = document.querySelectorAll(`#${userBoard} .${shipName}`);
            computerShipCells.forEach(cell => {
                cell.classList.add('sunk-ship');
            });
        }

    }
    checkShip('destroyer', 2);
    checkShip('submarine', 3);
    checkShip('cruiser', 3);
    checkShip('battleship', 4);
    checkShip('carrier', 5);

    if (shipsSunkByPlayer.length == 5) {
        displayInfo.textContent = "YOU WIN! You sunk ALL of the computer's ships";
        isGameOver = true;
    }
    if (shipsSunkByComputer.length == 5) {
        displayInfo.textContent = "YOU LOSE. The computer sunk ALL of your ships";
        isGameOver = true;
    }
}

