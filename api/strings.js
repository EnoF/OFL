module.exports = {
    errors: {
        errorType: {
            connection:  'CONNECTION error:',
            application: 'APPLICATION error:'
        },
        playerExists: {
            message: 'Palyer already exists!',
            code: 'PLAYER_EXISTS_ERROR'
        },
        gameFinished: {
            message: 'Game is already in finished state!',
            code: 'FINISHED_GAME_ERROR'
        },
        gameUnfinished: {
            message: 'Last game is not finished yet!', 
            code: 'LAST_GAME_UNFINISHED_ERROR'
        },
        gameNotFound: {
            message: 'Game could not be found on server!',
            code: 'GAME_NOT_FOUND_ERROR'
        },
        drawForbidden: {
            message: 'There is no draw foosball!', 
            code: 'NO_DRAW_ALLOWED_ERROR'
        },
        updateBuilderFailed: {
            message: 'Failed to build update query to update player stats!',
            code: 'CREATE_UPDATE_QUERY_ERROR'
        }
    },
    logging: {
        newPlayerCreated: 'INFO: New player has been created with ID ',
        newGameCreated: 'INFO: New game has been created with ID ',
        playerDeleted: 'INFO: Player has been deleted. Affected ID was '
    },
    query: {
        updatePlayerSetPoints: 'UPDATE player SET points=points+',
        setVictoriesPlusOneWhereId: ', victories=victories+1 WHERE id=',
        setDefeatesPlusOneWhereId: ', defeats=defeats+1 WHERE id=',
        orWhereId: ' OR id='
    },
    dbTables: {
        games: 'game',
        players: 'player'
    }
};