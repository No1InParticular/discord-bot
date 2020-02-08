const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

let p1 = null;
let p2 = null;
let places = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
let p1turn = true;
let inProgress = false;
let chat;

client.on("ready", () => {
    client.user.setActivity("You", { type: "WATCHING" });
});

client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();

    chat = message.channel;

    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await chat.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        return;
    }

    if (command === "ttt") {
        if (args.length == 0) {
            chat.send("Please specify an argument: `_ttt join` to join a game or `_ttt play <position>` to make a move");
            return;
        }

        if (args[0] === "join") {
            if (inProgress) {
                chat.send(message.author.toString() + " a game is already in progress, please wait.");
                return;
            }

            if (p1 == null) {
                p1 = message.author;
                chat.send(p1.toString() + " joined the game, one more needed.");
                return;
            }

            if (p2 == null) {
                if (p1 == message.author) {
                    chat.send(p1.toString() + " you are already player 1!");
                    return;
                }

                p2 = message.author;
                chat.send(p2.toString() + " is player 2!");
                startGame();
                return;
            }

            chat.send(message.author.toString() + " sorry there can only be two players!");
            return;
        } else if (args[0] === "play") {
            if (!inProgress) {
                chat.send(message.author.toString() + " a game is not currently in progress.");
                return;
            }

            if ((p1turn && message.author == p2) || (!p1turn && message.author == p1)) {
                chat.send(message.author.toString() + " it is not currently your turn");
                return;
            }

            if (args.length < 2) {
                chat.send(message.author.toString() + " please specify a position to play in");
                return;
            }

            let pos = args[1];
            let index = pos - 1;

            if (places[index] == pos) {
                if (p1turn) {
                    places[index] = "x";
                } else {
                    places[index] = "o";
                }
                printBoard();
                checkWin(index);
            } else {
                chat.send(message.author.toString() + " this position has already been played!");
                return;
            }
        }
    }
});

function printBoard() {
    chat.send(
        "```\n" +
            places[0] +
            " | " +
            places[1] +
            " | " +
            places[2] +
            "\n---------\n" +
            places[3] +
            " | " +
            places[4] +
            " | " +
            places[5] +
            "\n---------\n" +
            places[6] +
            " | " +
            places[7] +
            " | " +
            places[8] +
            "\n```"
    );
}

function startGame() {
    inProgress = true;
    places = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    chat.send(p1.toString() + " and " + p2.toString() + " are playing.");
    chat.send(p1.toString() + " make your move! (`_ttt play <position>`)");
    printBoard();
}

function endGame(draw) {
    if (draw) {
        chat.send("It is a draw!");
    } else if (p1turn) {
        chat.send(p1.toString() + " has won!");
    } else {
        chat.send(p2.toString() + " has won!");
    }

    inProgress = false;
    p1 = null;
    p2 = null;
    p1turn = true;
}

// 0 | 1 | 2
// ---------
// 3 | 4 | 5
// ---------
// 6 | 7 | 8

let winMethods = [
    // Across
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Downwards
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonal
    [0, 4, 8],
    [2, 4, 6]
];

function checkWin(index) {
    draw = true;
    for (let x = 0; x < 9; x++) {
        if (places[x] != "x" && places[x] != "o") {
            draw = false;
            break;
        }
    }

    if (draw) {
        endGame(draw);
        return;
    }

    let symbol = places[index];
    for (let x = 0; x < winMethods.length; x++) {
        let currentWinCheck = winMethods[x];
        let slot1 = places[currentWinCheck[0]];
        let slot2 = places[currentWinCheck[1]];
        let slot3 = places[currentWinCheck[2]];

        if (slot1 == symbol && slot2 == symbol && slot3 == symbol) {
            endGame(false);
            return;
        }
    }

    p1turn = !p1turn;
    let currentPlayer = p1;
    if (!p1turn) {
        currentPlayer = p2;
    }
    chat.send(currentPlayer.toString() + " make your move! (`_ttt play <position>`)");
}

client.login(config.token);
