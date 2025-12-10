import {ref} from "vue";
import Player from "@/view-models/player";
import Game, {PRASession} from "@/view-models/game";
import Ticket from "@/view-models/tickets";
import GameFormat from "@/view-models/gameFormat";

const players = ref<Player[]>([]);
const socket = ref({} as any);
const showVotes = ref(false);
const countdown = ref(0);
const interval: any = ref(null);
const currentVote: any = ref(null);
const gameFormat = ref<GameFormat>();
const closestValue: any = ref(null);
const averageValue: any = ref(null);
const tickets = ref<Ticket[]>([]);
const praSession = ref<PRASession | null>(null);
const praPhase = ref<number>(1);
const praChanceOfFailure = ref<number | null>(null);
const praImpact = ref<number | null>(null);
const praRiskScore = ref<number | null>(null);
const praRiskClass = ref<string | null>(null);

export function useGameEngine() {
    function setSocket(newSocket: any) {
        socket.value = newSocket;
        setupSocketHandlers();
    }

    function setupSocketHandlers() {
        socket.value.on("update", (game: Game) => {
            players.value = game.players;
            tickets.value = game.tickets;

            // Check if game type changed to/from PRA
            const wasPRA = gameFormat.value?.isPRA;
            const isNowPRA = game.gameType?.isPRA;

            gameFormat.value = game.gameType;
            praSession.value = game.praSession || null;

            if (game.praSession) {
                praPhase.value = game.praSession.phase;
                // Sync PRA state from server
                if (game.praSession.chanceOfFailure === null && game.praSession.impact === null) {
                    // Session was reset on server
                    praChanceOfFailure.value = null;
                    praImpact.value = null;
                    praRiskScore.value = null;
                    praRiskClass.value = null;
                }
            }

            // Reset client PRA display state when switching game types
            if (wasPRA !== isNowPRA) {
                showVotes.value = false;
                currentVote.value = null;
                closestValue.value = null;
                averageValue.value = null;
                if (isNowPRA) {
                    // Switched to PRA - reset PRA display values
                    praPhase.value = 1;
                    praChanceOfFailure.value = null;
                    praImpact.value = null;
                    praRiskScore.value = null;
                    praRiskClass.value = null;
                }
            }
        });

        socket.value.on("gameTypes", (gameTypes: []) => {
            // save the game types to the local storage
            localStorage.setItem("gameTypes", JSON.stringify(gameTypes));
        });

        socket.value.on("show", (results: any) => {
            closestValue.value = results.closest;
            averageValue.value = results.average;
            showVotes.value = true;
            clearInterval(interval.value);
            countdown.value = 3;
            interval.value = setInterval(() => {
                countdown.value -= 1;
                if (countdown.value == 0) {
                    clearInterval(interval.value);
                }
            }, 1000);
        });

        socket.value.on("praPhase1Complete", (results: any) => {
            praChanceOfFailure.value = results.chanceOfFailure;
            closestValue.value = results.chanceOfFailure;
            averageValue.value = results.average;
            showVotes.value = true;
            clearInterval(interval.value);
            countdown.value = 3;
            interval.value = setInterval(() => {
                countdown.value -= 1;
                if (countdown.value == 0) {
                    clearInterval(interval.value);
                }
            }, 1000);
        });

        socket.value.on("praPhase1FinalSet", (results: any) => {
            praChanceOfFailure.value = results.chanceOfFailure;
            closestValue.value = results.chanceOfFailure;
        });

        socket.value.on("praPhase2Start", () => {
            showVotes.value = false;
            currentVote.value = null;
            praPhase.value = 2;
            // Clear previous vote results when moving to Phase 2
            closestValue.value = null;
            averageValue.value = null;
        });

        socket.value.on("praComplete", (results: any) => {
            praChanceOfFailure.value = results.chanceOfFailure;
            praImpact.value = results.impact;
            praRiskScore.value = results.riskScore;
            praRiskClass.value = results.riskClass;
            closestValue.value = results.impact;
            averageValue.value = results.averageImpact;
            showVotes.value = true;
            clearInterval(interval.value);
            countdown.value = 3;
            interval.value = setInterval(() => {
                countdown.value -= 1;
                if (countdown.value == 0) {
                    clearInterval(interval.value);
                }
            }, 1000);
        });

        socket.value.on("praFinalResultSet", (results: any) => {
            praChanceOfFailure.value = results.chanceOfFailure;
            praImpact.value = results.impact;
            praRiskScore.value = results.riskScore;
            praRiskClass.value = results.riskClass;
        });

        socket.value.on("restart", () => {
            showVotes.value = false;
            currentVote.value = null;
            // Reset PRA state if in phase 1 (new PRA session)
            if (praPhase.value === 1) {
                praChanceOfFailure.value = null;
                praImpact.value = null;
                praRiskScore.value = null;
                praRiskClass.value = null;
            }
        });

        socket.value.on("praSessionReset", () => {
            showVotes.value = false;
            currentVote.value = null;
            praPhase.value = 1;
            praChanceOfFailure.value = null;
            praImpact.value = null;
            praRiskScore.value = null;
            praRiskClass.value = null;
            closestValue.value = null;
            averageValue.value = null;
        });

        socket.value.on("ping", () => {
            socket.value.emit("pong");
        });
    }

    return {
        socket,
        players,
        setSocket,
        showVotes,
        countdown,
        currentVote,
        interval,
        tickets,
        gameFormat,
        closestValue,
        averageValue,
        praSession,
        praPhase,
        praChanceOfFailure,
        praImpact,
        praRiskScore,
        praRiskClass
    };
}