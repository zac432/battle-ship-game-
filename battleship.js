const rotateButton = document.querySelector('#rotate-button'); // Button to rotate ships
const shipsContainer = document.querySelector('.ships-container'); // Container for ships
const startButton = document.querySelector('#start-button'); // Button to start the game
const displayInfo = document.querySelector('#info'); // Element to display game information
const displayTurn = document.querySelector('#turn-display'); // Element to display whose turn it is
// Adding event listener to restart game button
document.getElementById('restart-game-button').addEventListener('click', restartGame);

// Variables for tracking hits and misses
let playerTotalHits = 0; // Total hits for player
let playerTotalMisses = 0;  //  Total misses for player
let computerTotalHits = 0; // Total hits for computer
let computerTotalMisses = 0; // Total misses for computer


let rotationAngle = 0; // Current rotation angle variable of ships
// Function to rotate ships
function rotate() {
    let shipOptions = Array.from(shipsContainer.children);
    // Toggle rotation angle between 0 and 90 degrees
    if (rotationAngle == 0) {
        rotationAngle = 90;
    } else {
        rotationAngle = 0;
    }
    // Apply rotation to each ship option
    shipOptions.forEach(shipOption => shipOption.style.transform = `rotate(${rotationAngle}deg)`);
}
// Add event listener to rotate button
rotateButton.addEventListener('click', rotate);

//Creating boards
// Define the width of the game board
const width = 10;
// Select the container for game boards from the HTML document
const gamesBoardContainer = document.querySelector('#gamesboard-container');
// Function to create a game board
function createBoard(color, user) {
    // Create a new div element for the game board
    let gameBoardContainer = document.createElement('div');
     // Add the 'game-board' class to the game board div
    gameBoardContainer.classList.add('game-board');
    // Set the background color of the game board
    gameBoardContainer.style.backgroundColor = color;
    // Set the id of the game board to identify the user
    gameBoardContainer.id = user;

    // Loop to create individual blocks within the game board
    for (let i = 0; i < width**2; i++) {
         // Create a new div element for each block
        let block = document.createElement('div');
        // Add the 'block' class to the block div
        block.classList.add('block');
        // Set the id of the block
        block.id = i;
         // Append the block to the game board
        gameBoardContainer.append(block);
    }
    // Append the game board to the game board container in the HTML document
    gamesBoardContainer.append(gameBoardContainer);
}
// Create game boards for player and computer with specified colors
createBoard('#f0e9e9', 'player');
createBoard('#f0e9e9', 'computer');


//Creating ships
// Define a Ship class to create ship objects
class Ship {
    constructor(name, length) {
        this.name = name; //name of the ship
        this.length = length; //length of the ship
    }
}
// Create instances of ships with their respective names and lengths
const destroyer = new Ship('destroyer', 2);
const submarine = new Ship('submarine', 3);
const cruiser = new Ship('cruiser', 3);
const battleship = new Ship('battleship', 4);
const carrier = new Ship('carrier', 5);

// Create an array to store all the ship instances
const ships = [destroyer, submarine, cruiser, battleship, carrier];
// Variable to track if a ship has not been dropped 
let notDropped;


//Randomly places ships on computer's board
// Function to add a ship piece to the game board for the specified user
function addShipPiece(user, ship, startId) {
    // Select all blocks on the game board for the specified user
    let allBoardBlocks = document.querySelectorAll(`#${user} div`);
 // Randomly determine whether the ship will be placed horizontally or vertically
    let randomBoolean = Math.random() < 0.5;
    let isHorizontal = user === 'player' ? rotationAngle === 0 : randomBoolean;
    // Generate a random start index if not provided
    let randomStartIndex = Math.floor(Math.random() * width ** 2);
    let startIndex = startId ? startId : randomStartIndex;

    // Ensure the start index is within the boundaries of the game board
    let validStart = isHorizontal ? startIndex <= width ** 2 - ship.length ? startIndex :
        width ** 2 - ship.length :
        startIndex <= width ** 2 - 1 - width * ship.length + width ? startIndex :
        startIndex - width * ship.length + width;
 // Create an array to store the blocks occupied by the ship
    let shipBlocks = [];
// Populate the shipBlocks array with the appropriate blocks based on orientation
    for (let i = 0; i < ship.length; i++) {
        if (isHorizontal) {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i]);
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + (width * i)]);
        }
    }

    let valid;
    // Check if the ship placement is valid based on its orientation
    if (isHorizontal) {
        shipBlocks.every((_shipBlock, index) => 
            valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
    } else {
        shipBlocks.every((_shipBlock, index) =>
            valid = shipBlocks[0].id < 90 + (width * index + 1))
    }
    
    // Check if the blocks are not already taken by another ship
    let notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'));

    // If the placement is valid and the blocks are not taken, add the ship to the board
    if (valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('taken');
        })
    } else {
        // If placement is invalid or blocks are taken, retry placement for computer or flag for player
        if (user === 'computer') {
            addShipPiece(user, ship);
        }
        if (user === 'player') {
            notDropped = true;
        }
    }
    // Check if the placement was both valid and the blocks were not taken
    let validPlacement = valid && notTaken;
    // Return true if placement was successful, false otherwise
    if (validPlacement) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add(ship.name);
            shipBlock.classList.add('taken'); 
        });
        return true; // Successful placement
    } else {
        return false; // Unsuccessful placement
    }
}
// Add ships to the computer's game board
ships.forEach(ship => addShipPiece('computer', ship));


//Drag player ships
// Initialize variable to store the currently dragged ship
let draggedShip;
// Select all ship options from the HTML document
const shipOptions = Array.from(shipsContainer.children);
// Add event listener to each ship option for the dragstart event
shipOptions.forEach(shipOption => shipOption.addEventListener('dragstart', beginDrag))
// Select all blocks on the player's game board
const allPlayerBlocks = document.querySelectorAll('#player div');
// Add event listeners to each player block for dragover and drop events
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver);
    playerBlock.addEventListener('drop', drop);
})

// Function to handle the beginning of a drag operation
function beginDrag(event) {
    // Reset the notDropped flag
    notDropped = false;
    // Store the dragged ship element
    draggedShip = event.target;
}

// Function to handle the dragover event
function dragOver(event) {
    event.preventDefault();
}

// Function to handle the drop event
function drop(event) {
    event.preventDefault();
    // Get the id of the block where the ship is dropped
    const startId = parseInt(event.target.id, 10);
 // Get the ship object corresponding to the dragged ship
    const ship = ships[parseInt(draggedShip.id, 10)];
 // Attempt to add the ship piece to the player's game board at the dropped location
    const shipPlacedSuccessfully = addShipPiece('player', ship, startId);
// If the ship was placed successfully, remove the ship option from the UI
    if (shipPlacedSuccessfully) {
        draggedShip.remove();
        displayInfo.textContent = ''; // Clear the message
    } else {
        // If placement was unsuccessful, display an error message
        displayInfo.textContent = "Invalid placement. Try a different location or orientation.";
    }
    // Clear the error message after a delay
    setTimeout(() => { displayInfo.textContent = ''; }, 2000);
}
   

// Initialize variables to track game state
// Flag indicating if the game is over
let isGameOver = false;
let playerTurn; // Variable to track whose turn it is

//Start game
// Function to start the game when the start button is clicked
function startGame() {
    // Check if it's the first turn
    if (playerTurn == undefined) {
        // Check if all player ships are placed before starting the game
        if (shipsContainer.children.length != 0) {
            displayInfo.textContent = 'You must place all your ships first!'
        } else {
             // Play start sound effect
            document.getElementById('start-sound').play()
            // Add event listeners to all computer board blocks for player's turn
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick));
             // Set player's turn and display relevant messages
            playerTurn = true;
            displayTurn.textContent = "It's your turn";
            displayInfo.textContent = 'Pick a cell';
        }
    }
}
// Add event listener to start button to initiate the game
startButton.addEventListener('click', startGame);

// Arrays to track hits and sunk ships for player and computer
let playerHits = [];
let computerHits = [];
let shipsSunkByPlayer = [];
let shipsSunkByComputer = []; 


//Player's turn
// Function to handle player's turn when a cell is clicked
function handleClick(event) {
    if (!isGameOver) {
        // Check if a cell is already clicked
        if (!event.target.classList.contains('hit') && !event.target.classList.contains('miss')) {
            if (event.target.classList.contains('taken')) {
                // Check if the clicked cell contains a ship
                // Increment player's total hits and play hit sound effect
                playerTotalHits++;
                document.getElementById('hit-sound').play();  // Play hit sound
                // Mark the cell as hit and update relevant data
                event.target.classList.add('hit');
                event.target.style.lineHeight = event.target.clientHeight + 'px';
                event.target.textContent = '✓';
                displayInfo.textContent = "You HIT a ship";
                // Extract ship name from the cell's class list
                let classes = Array.from(event.target.classList);
                classes = classes.filter(className => className != 'block');
                classes = classes.filter(className => className != 'hit');
                classes = classes.filter(className => className != 'taken');
                playerHits.push(...classes);
                // Check if any ship has been sunk
                checkScore('player', playerHits, shipsSunkByPlayer);
            } else {
                 // Mark the cell as missed and play miss sound effect
                displayInfo.textContent = "You MISSED!";
                document.getElementById('miss-sound').play();
                playerTotalMisses++;
                event.target.classList.add('miss');
                event.target.style.lineHeight = event.target.clientHeight + 'px';
                event.target.textContent = '✗';
            }
             // Switch to computer's turn after player's move
            playerTurn = false;
            // Reset computer's board display
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
            // Delay computer's turn slightly for better gameplay experience
            setTimeout(computerTurn, 1000);
        } else {
            // Provide feedback that the cell has already been clicked
            displayInfo.textContent = "You've already selected this cell! Pick a different one";
        }
        updateScoreboard(); // Update the scoreboard with the latest counts 
    }
}

// Array to store indices of available cells on the player's board for computer's turn
let indices = Array.from({ length: 100 }, (_, index) => index);


//Computer's Turn
// Function to handle computer's turn
function computerTurn() {
    if (!isGameOver) {
        // Display relevant messages during computer's turn
        displayTurn.textContent = "It's the Computer's Turn";
        displayInfo.textContent = "The Computer is Thinking";
        setTimeout(() => {
            // Randomly select a cell index from available indices
            let randomIndex = Math.floor(Math.random() * indices.length);
            let randomPick = indices[randomIndex];
            indices.splice(randomIndex, 1);  // Remove selected index from available indices
            let allBoardBlocks = document.querySelectorAll('#player div');
             
            // Check if the selected cell contains a ship
            if (allBoardBlocks[randomPick].classList.contains('taken') && !allBoardBlocks[randomPick].classList.contains('hit')) {
                 // Mark the cell as hit, play hit sound, and update relevant data
                allBoardBlocks[randomPick].classList.add('hit');
                document.getElementById('hit-sound').play();
                computerTotalHits++;
                allBoardBlocks[randomPick].style.lineHeight = allPlayerBlocks[randomPick].clientHeight + 'px';
                allBoardBlocks[randomPick].textContent = '✓';
                displayInfo.textContent = 'The computer hit your ship!';
                // Extract ship name from the cell's class list
                let classes = Array.from(allBoardBlocks[randomPick].classList);
                classes = classes.filter(className => className != 'block');
                classes = classes.filter(className => className != 'hit');
                classes = classes.filter(className => className != 'taken');
                computerHits.push(...classes);
                // Check if any ship has been sunk
                checkScore('computer', computerHits, shipsSunkByComputer);
            } else {
                 // Mark the cell as missed and play miss sound effect
                displayInfo.textContent = 'The Computer MISSED';
                document.getElementById('miss-sound').play();
                computerTotalMisses++; // Increment computer's total misses
                allBoardBlocks[randomPick].classList.add('miss');
                allBoardBlocks[randomPick].style.lineHeight = allBoardBlocks[randomPick].clientHeight + 'px';
                allBoardBlocks[randomPick].textContent = '✗';
            }
        }, 2000)
        // Switch to player's turn after computer's move
        setTimeout(() => {
            playerTurn = true;
            displayTurn.textContent = "It's your turn";
            displayInfo.textContent = 'Pick a cell';
            let allBoardBlocks = document.querySelectorAll('#computer div');
            allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
            // Update the scoreboard with the latest counts
            updateScoreboard();
        }, 3000)  
    }
}

// Function to update the scoreboard with the latest hit and miss counts for both players
function updateScoreboard() {
     // Update player's hit and miss counts
    document.getElementById('player-hits').textContent = playerTotalHits;
    document.getElementById('player-misses').textContent = playerTotalMisses;
    // Update computer's hit and miss counts
    document.getElementById('computer-hits').textContent = computerTotalHits;
    document.getElementById('computer-misses').textContent = computerTotalMisses;
}



// Function to check the score and handle ship sinking
function checkScore(user, userHits, shipsSunkByUser) {
    // Function to check if a ship is sunk based on its name and length
    function checkShip(shipName, shipLength) {
        // Check if the number of hits matches the length of the ship
        if (userHits.filter(storedShipName => storedShipName == shipName).length === shipLength) {
            if (user == 'player') {
                // Display relevant messages for the player or computer
                displayInfo.textContent = `HIT! You SUNK the computer's ${shipName}!`;
                playerHits = userHits.filter(storedShipName => storedShipName != shipName);
            }
            if (user == 'computer') {
                displayInfo.textContent = `The computer SUNK your ${shipName}!`;
                computerHits = userHits.filter(storedShipName => storedShipName != shipName);
            }
            // Change the appearance of the sunk ship on the opponent's board
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
    // Check each ship to determine if it's sunk
    checkShip('destroyer', 2);
    checkShip('submarine', 3);
    checkShip('cruiser', 3);
    checkShip('battleship', 4);
    checkShip('carrier', 5);

    // Check if all of the opponent's ships are sunk
    if (shipsSunkByPlayer.length == 5) {
        displayInfo.textContent = "YOU WIN! You sunk ALL of the computer's ships";
        isGameOver = true;
    }
    if (shipsSunkByComputer.length == 5) {
        displayInfo.textContent = "YOU LOSE. The computer sunk ALL of your ships";
        isGameOver = true;
    }
}

// Function to recreate ships for dragging
function recreateShips() {
    // Clear existing ships
    shipsContainer.innerHTML = '';

    // Add back ships for dragging
    ships.forEach((ship, index) => {
        const shipDiv = document.createElement('div');
        shipDiv.className = `display-${ship.name} ${ship.name}`;
        shipDiv.setAttribute('draggable', true);
        shipDiv.setAttribute('id', index); 

        // Add back the drag event listener
        shipDiv.addEventListener('dragstart', beginDrag);

        shipsContainer.appendChild(shipDiv);
    });
}

// Function to reapply event listeners to all blocks on the game board
function reapplyBlockEventListeners() {
    const allBlocks = document.querySelectorAll('.game-board .block');

    allBlocks.forEach(block => {
        block.addEventListener('dragover', dragOver);
        block.addEventListener('drop', drop);
        // If you use dragenter and dragleave for visual effects, add them here similarly
    });
}

function clearBoard() {
    const allBlocks = document.querySelectorAll('.block');
    allBlocks.forEach(block => {
      block.className = 'block'; // Reset the class to just 'block'
      block.textContent = ''; // Clear any text inside the block
      block.style = ''; 
    });
  }
  


function restartGame() {
    clearBoard();

    isGameOver = false;
    playerTurn = undefined; 
    playerHits = [];
    computerHits = [];
    shipsSunkByPlayer = [];
    shipsSunkByComputer = [];
    playerTotalHits = 0;
    playerTotalMisses = 0;
    computerTotalHits = 0;
    computerTotalMisses = 0;
    // Update the scoreboard
    updateScoreboard();
    // Clear board and display initial messages
    clearBoard();
    
    displayInfo.textContent = 'Place your ships to start!';
    displayTurn.textContent = '';
    // Recreate ships for dragging and reapply event listeners
    recreateShips(); 
    
    reapplyBlockEventListeners(); 
}





