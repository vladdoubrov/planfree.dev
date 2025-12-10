import GameFormat from "./gameFormat";
import Ticket from "@/view-models/tickets";
import Player from "./player";

export interface PRASession {
    roomId: string;
    phase: number;
    chanceOfFailure: number | null;
    impact: number | null;
}

export default interface Game {
    players: Player[];
    tickets: Ticket[];
    gameType: GameFormat;
    praSession?: PRASession;
}