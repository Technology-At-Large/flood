//╔═════════════════════════════════════════════════════════════════════════════
//║ Web Socket Routes
//╚═════════════════════════════════════════════════════════════════════════════

import { Game } from '../lib/Griddle/Game.js';
import * as uuid from 'uuid';
import express from 'express';
var router = express.Router();

//╔═════════════════════════════════════════════════════════════════════════════
//║ Routes
//╚═════════════════════════════════════════════════════════════════════════════

router.ws('/:seed', (ws, req) => {

    const seed = req.params.seed || uuid.v4();

    const Griddle = new Game(seed);
    let Board = Griddle.startGame();

    ws.on('message', (msg) => {
        if( Object.keys(msg).includes('c') ){
            if( Game.characters.includes(c[0]) ){
                Board = Griddle.useTurn(c[0].toUpperCase());
                ws.send(Board);
            } else {
                ws.send({
                    message: 'Invalid Input Character',
                    validChars: Game.characters.join(),
                    format: {
                        "c": "<validChar>"
                    }
                });				
            }
        } else {
            ws.send({
                message: 'Input Character [c] required: ',
                validChars: Game.characters.join(),
                format: {
                    "c": "<validChar>"
                }
            });
        }
    });
});

export { router };