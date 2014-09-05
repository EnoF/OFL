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
		drawForbidden: {
			message: 'There is no draw foosball!', 
			code: 'NO_DRAW_ALLOWED_ERROR'
		}
	},
	logging : {
		newPlayerCreated: 'INFO: New player has been created with ID ',
		newGameCreated: 'INFO: New game has been created with ID '
	}
}