const app = require('express')();
const http = require('http').createServer(app);
const short = require('short-uuid');
require('dotenv').config()
const io = require("socket.io")(http, {
    cors: {
        origin: process.env.ORIGIN || 'http://localhost:8081',
        methods: ["GET", "POST"]
    }
});

setInterval(() => {
    io.emit('ping');
    logRooms();
}, 20000);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

http.listen(process.env.PORT || 3000, () => {
    console.log(`listening on *:${process.env.PORT || 3000}`);
});

let players = [];
let tickets = [];
let gameType = [];
let praSession = []; // Track PRA sessions per room: { roomId, phase: 1|2, chanceOfFailure: null|number, impact: null|number }

let gameTypes = [
    { name: 'Fibonacci', values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'] },
    { name: 'T-Shirt', values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '?'] },
    { name: 'Powers of 2', values: [0, 1, 2, 4, 8, 16, 32, 64, '?'] },
    { name: 'Linear (1-5)', values: [1, 2, 3, 4, 5, '?'] },
    { name: 'PRA (Product Risk Analysis)', values: [1, 2, 3, 4, 5], isPRA: true },
]

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    let roomId = socket.handshake.query['roomId'];
    if (!roomId) {
        roomId = short.generate();
        socket.emit('room', roomId);
    }
    socket.emit('gameTypes', gameTypes)
    socket.join(roomId);

    players.push({ id: socket.id, name: '', roomId: roomId });
    gameType.push({ id: socket.id, gameType: gameTypes[0], roomId: roomId });

    // Initialize PRA session if it doesn't exist for this room
    if (!praSession.find(p => p.roomId === roomId)) {
        praSession.push({ roomId: roomId, phase: 1, chanceOfFailure: null, impact: null });
    }

    socket.on('name', (name) => {
        let player = players.find(p => p.id == socket.id);
        console.log(`User entered name ${name}`);
        if (player) {
            console.log(`Changing name from ${player.name} to ${name}`)
            player.name = name;
        }
        updateClientsInRoom(roomId);
    });

    socket.on('vote', (vote) => {
        let player = players.find(p => p.id == socket.id);
        if (player) {
            player.vote = vote;
        }
        console.log(`Player ${player.name} voted ${player.vote}`);

        const playersInRoom = players.filter(p => p.roomId == roomId);
        if (playersInRoom.every(p => p.vote)) {
            showVotes(roomId);
        }
        updateClientsInRoom(roomId);
    });

    socket.on('show', () => {
        showVotes(roomId);
    });

    socket.on('restart', () => {
        restartGame(roomId);
    });

    socket.on('gameTypeChanged', (newGameType) => {
        const roomGameTypeEntry = gameType.find(p => p.roomId == roomId);
        const wasNotPRA = !roomGameTypeEntry.gameType?.isPRA;
        const isNowPRA = newGameType?.isPRA;

        roomGameTypeEntry.gameType = newGameType;

        // Reset PRA session when switching to PRA mode, or reset votes when switching away
        const roomPRA = praSession.find(p => p.roomId === roomId);
        if (roomPRA) {
            if (isNowPRA && wasNotPRA) {
                // Switching to PRA mode - reset PRA session
                roomPRA.phase = 1;
                roomPRA.chanceOfFailure = null;
                roomPRA.impact = null;
            }
        }

        // Reset all player votes when game type changes
        const roomPlayers = players.filter(p => p.roomId == roomId);
        roomPlayers.forEach(p => p.vote = undefined);

        updateClientsInRoom(roomId);
    });

    socket.on('ticket', (updatedTickets) => {
        tickets = tickets.filter(ticket => ticket.roomId !== roomId);
        for (const ticket of updatedTickets) {
            ticket.roomId = roomId;
        }
        if (updatedTickets.length === 1) {
            updatedTickets[0].votingOn = true;
        }

        tickets.push(...updatedTickets)
        updateClientsInRoom(roomId);
    });

    socket.on('praSetFinalResult', (data) => {
        const roomPRA = praSession.find(p => p.roomId === roomId);
        if (!roomPRA) return;

        if (roomPRA.phase === 1) {
            // Set final chance of failure
            roomPRA.chanceOfFailure = data.finalScore;
            console.log(`PRA Phase 1 final result manually set to: ${data.finalScore}`);
            io.to(roomId).emit('praPhase1FinalSet', {
                chanceOfFailure: roomPRA.chanceOfFailure
            });
        } else if (roomPRA.phase === 2) {
            // Set final impact
            roomPRA.impact = data.finalScore;
            const riskScore = roomPRA.chanceOfFailure * roomPRA.impact;
            let riskClass = 'LOW';
            if (riskScore >= 13) {
                riskClass = 'HIGH';
            } else if (riskScore >= 7) {
                riskClass = 'MIDDLE';
            }

            const roomTickets = tickets.filter(p => p.roomId == roomId);
            if (roomTickets.length > 0) {
                const ticket = roomTickets.find(f => f.votingOn);
                if (ticket) {
                    ticket.score = `${riskClass} (${riskScore})`;
                }
            }

            console.log(`PRA Phase 2 final result manually set to: ${data.finalScore}, Risk Score: ${riskScore}, Class: ${riskClass}`);
            io.to(roomId).emit('praFinalResultSet', {
                chanceOfFailure: roomPRA.chanceOfFailure,
                impact: roomPRA.impact,
                riskScore: riskScore,
                riskClass: riskClass
            });
            updateClientsInRoom(roomId);
        }
    });

    socket.on('resetPRASession', () => {
        const roomPRA = praSession.find(p => p.roomId === roomId);
        if (!roomPRA) return;

        // Reset PRA session state
        roomPRA.phase = 1;
        roomPRA.chanceOfFailure = null;
        roomPRA.impact = null;

        // Reset all player votes
        const roomPlayers = players.filter(p => p.roomId == roomId);
        roomPlayers.forEach(p => p.vote = undefined);

        console.log(`PRA Session reset for room ${roomId}`);
        io.to(roomId).emit('praSessionReset');
        io.to(roomId).emit('restart');
        updateClientsInRoom(roomId);
    });

    socket.on('disconnect', () => {
        const player = players.find(player => player.id === socket.id);
        console.log(`Player ${player.name} has disconnected`);
        players = players.filter(player => player.id !== socket.id);
        updateClientsInRoom(roomId);
    });

    socket.on('pong', () => {
        let player = players.find(p => p.id == socket.id);
        // keeping the connection alive
    })
});

function updateClientsInRoom(roomId) {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    const roomTickets = tickets.filter(p => p.roomId == roomId);
    const roomGameType = gameType.find(p => p.roomId == roomId).gameType ?? gameTypes[0];
    const roomPRA = praSession.find(p => p.roomId === roomId);
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets,
        gameType: roomGameType,
        praSession: roomPRA
    });
}

function restartGame(roomId) {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    const roomTickets = tickets.filter(p => p.roomId == roomId);
    const roomGameType = gameType.find(p => p.roomId == roomId).gameType ?? gameTypes[0];
    const roomPRA = praSession.find(p => p.roomId === roomId);

    roomPlayers.forEach(p => p.vote = undefined); // reset all the player's votes

    // Handle PRA phase transitions
    if (roomGameType.isPRA && roomPRA) {
        if (roomPRA.phase === 1 && roomPRA.chanceOfFailure !== null) {
            // Move to phase 2
            roomPRA.phase = 2;
            console.log(`PRA Session moving to Phase 2 (Impact voting)`);
            io.to(roomId).emit('praPhase2Start');
        } else if (roomPRA.phase === 2 && roomPRA.impact !== null) {
            // Reset for new PRA session
            roomPRA.phase = 1;
            roomPRA.chanceOfFailure = null;
            roomPRA.impact = null;
            console.log(`PRA Session reset to Phase 1`);

            const ticketVotingOn = roomTickets.find(f => f.votingOn);
            if (!(ticketVotingOn && !ticketVotingOn.score)) {
                roomTickets.forEach(p => p.votingOn = false);
                const ticketToVoteOn = roomTickets.find(t => !t.score);
                if (ticketToVoteOn) {
                    ticketToVoteOn.votingOn = true;
                }
            }
        }
    } else {
        // Normal game restart logic
        const ticketVotingOn = roomTickets.find(f => f.votingOn);
        if (!(ticketVotingOn && !ticketVotingOn.score)) {
            roomTickets.forEach(p => p.votingOn = false);
            const ticketToVoteOn = roomTickets.find(t => !t.score);
            if (ticketToVoteOn) {
                ticketToVoteOn.votingOn = true;
            }
        }
    }

    console.log(`Restarted game with Players: ${roomPlayers.map(p => p.name).join(", ")}`);
    io.to(roomId).emit('restart');
    io.to(roomId).emit('update', {
        players: roomPlayers,
        tickets: roomTickets,
        gameType: roomGameType,
        praSession: roomPRA
    });
}

function logRooms() {
    const rooms = players.map(e => e.roomId);
    if (rooms) {
        for (const room of rooms.filter((val, i, arr) => arr.indexOf(val) == i)) {
            const playersInRoom = players.filter(p => p.roomId == room).map(p => p.name);
            console.log(`Room: ${room} - Players: ${playersInRoom.join(", ")}`);
        }
    }
}

function showVotes(roomId) {
    const roomGameType = gameType.find(p => p.roomId == roomId).gameType;
    const isPRA = roomGameType.isPRA;

    if (isPRA) {
        showPRAVotes(roomId);
        return;
    }

    const roomTickets = tickets.filter(p => p.roomId == roomId);
    // find the text in the gametype where the index is the closest
    let closest = 0;
    const average = getAverage(roomId);
    const fib = roomGameType.values
    let upwards = Math.abs(fib.find(p => p >= average)- average);
    let downWards = Math.abs(fib.findLast(p => p <= average) - average);
    // the game type is not numeric use indexes instead
    if(isNaN(upwards)){
        upwards = fib.find((v, k) => k >= average);
        downWards = fib.findLast((v, k) => k <= average);
        if(upwards < downWards){
            closest = fib.find((v,k) => k >= average);
        }
        else{
            closest = fib.findLast((v,k) => k <= average);
        }
        avg = fib[Math.floor(average)];
    }
    else
    {
        if(upwards < downWards){
            closest = fib.find(p => p >= average);
        }
        else{
            closest = fib.findLast(p => p <= average);
        }
        avg = average;
    }

    if (roomTickets.length>0) {
        const ticket = roomTickets.find(f => f.votingOn);
        if (ticket) {
            ticket.score = closest;
        }
    }

    io.to(roomId).emit('show', { average: avg, closest: closest });
}

function showPRAVotes(roomId) {
    const roomPRA = praSession.find(p => p.roomId === roomId);
    const average = getAverage(roomId);
    const closest = Math.round(average);

    if (roomPRA.phase === 1) {
        // First vote: Chance of Failure
        roomPRA.chanceOfFailure = closest;
        console.log(`PRA Phase 1 complete - Chance of Failure: ${closest}`);
        io.to(roomId).emit('praPhase1Complete', {
            chanceOfFailure: closest,
            average: average
        });
    } else if (roomPRA.phase === 2) {
        // Second vote: Impact
        roomPRA.impact = closest;
        const riskScore = roomPRA.chanceOfFailure * roomPRA.impact;
        let riskClass = 'LOW';
        if (riskScore >= 13) {
            riskClass = 'HIGH';
        } else if (riskScore >= 7) {
            riskClass = 'MIDDLE';
        }

        console.log(`PRA Phase 2 complete - Impact: ${closest}, Risk Score: ${riskScore}, Class: ${riskClass}`);

        const roomTickets = tickets.filter(p => p.roomId == roomId);
        if (roomTickets.length > 0) {
            const ticket = roomTickets.find(f => f.votingOn);
            if (ticket) {
                ticket.score = `${riskClass} (${riskScore})`;
            }
        }

        io.to(roomId).emit('praComplete', {
            chanceOfFailure: roomPRA.chanceOfFailure,
            impact: roomPRA.impact,
            riskScore: riskScore,
            riskClass: riskClass,
            averageImpact: average
        });
    }
}

function getAverage(roomId) {
    const roomPlayers = players.filter(p => p.roomId == roomId);
    const roomGameType = gameType.find(p => p.roomId == roomId).gameType
    let count = 0;
    let total = 0;
    for (const player of roomPlayers) {
        if (player.vote && player.vote !== "?") {
            // get the current index of the vote
            const index = roomGameType.values.indexOf(player.vote);
            let numberValue = Number(player.vote);
            if (isNaN(numberValue)) {
                numberValue = index;
            }

            total += parseInt(numberValue);
            count++;
        }
    }
    return total / count;
}
