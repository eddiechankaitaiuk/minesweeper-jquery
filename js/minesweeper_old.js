var GAMEOPTION = {
    BEGINNER: {column: 9, row: 9, bombNo: 10},
    INTERMEDIATE: {column: 16, row: 16, bombNo: 40},
    EXPERT: {column: 30, row: 16, bombNo: 99}
}

var INITIAL_GAMESTATE = {
    gameOption: GAMEOPTION.BEGINNER,
    mode: 'START', //'START', 'PLAY', 'GAMEOVER'   
    bombsLocation: [],
    //buttons is an array of object in format of {mark:[012345678*], status:[cofi] which "o:open, c:close, f:flag, i:button that trigger ignition" }
    buttons: [],
    startTime: null,
    endTime: null
}

var gameState = {}

$("body").ready(function() {

    var fnRenderBoard = function() {

        gameState = JSON.parse(JSON.stringify(INITIAL_GAMESTATE))

        var totalButton = gameState.gameOption.column * gameState.gameOption.row;
        //gameState.buttons = Array(totalButton).fill({"mark": 0, "state":"c"});
        gameState.mode = 'START';
        gameState.buttons = Array(totalButton).fill().map(function(n) {return {"mark": 0, "state":"c"}});
        var bombIndex = 0;
    
        //Set Bomb No
        $("#txtBombRemaining").text(gameState.gameOption.bombNo)
            
        $("#gameboard *").remove();
        $("#gameboard").css({"grid-template-columns":"repeat(" + gameState.gameOption.column + ", 1fr)", "grid-template-rows":"repeat("+ gameState.gameOption.row  + ", 1fr)" });

       for(i in gameState.buttons ) {
            //var strMarkCSS = isNaN(gameState.buttons[i].mark) ? "bomb" : ("mark"+gameState.buttons[i].mark);
            $("<button />").addClass("closed ").data("id", i).appendTo("#gameboard")
        }
    
    
    }

    var fnSetupBomb = function() {
        var totalButton = gameState.gameOption.column * gameState.gameOption.row;
        var bombIndex = 0;
    
        //Setting Bomb
        var bRedundantBomb = false;
        for(i=0; i<gameState.gameOption.bombNo; i++) {
            do {
                bombIndex = Math.floor(Math.random() * totalButton)
                bRedundantBomb = gameState.buttons[bombIndex].mark == "*" || gameState.buttons[bombIndex].state == "o"
                if(!bRedundantBomb) {
                    gameState.buttons[bombIndex].mark = "*";
                    gameState.bombsLocation.push(bombIndex)
                }
            } while (bRedundantBomb)       
        }
        console.log("Bomb No.: ", gameState.bombsLocation.length)

    
        //Setting Number
         for(i in gameState.bombsLocation) {
            var bombRow = Math.floor(gameState.bombsLocation[i] / gameState.gameOption.column);
            var bombColumn = gameState.bombsLocation[i] % gameState.gameOption.column;
            //Find 8 buttons surrounding the bomb and add 1 to the non-bomb buttons
            for(var k = -1; k<=1; k++) {
                for(var j=-1; j<=1; j++) {
                    if(k==0 && j == 0) {
                        //Do Nothing for self-button
                    } else {
                        //console.log(i, gameState.bombsLocation[i], j, k)
                        var surroundingBombRow = bombRow + k;
                        var surroundingBombColumn = bombColumn + j;
                        var surroundingButtonIndex = surroundingBombRow * gameState.gameOption.column + surroundingBombColumn;
                        if(surroundingBombRow >= 0  && surroundingBombRow < gameState.gameOption.row && surroundingBombColumn >= 0 && surroundingBombColumn < gameState.gameOption.column && gameState.buttons[surroundingButtonIndex].mark != "*") {
                            if(!isNaN(gameState.buttons[surroundingButtonIndex].mark)) {
                                gameState.buttons[surroundingButtonIndex].mark++;
                            }
                        }    
                    }
                } 
            }
        }

        console.log(gameState.buttons)

        //Set Bomb No
        $("#txtBombRemaining").text(gameState.gameOption.bombNo)
            
    
    }



    $("#gameboard").on("click", ">button", function(e) {
        console.log("click: " + $(this).data("id"))
        var iID = ($(this).data("id"))
        var iRow = Math.floor(iID / gameState.gameOption.column)
        var iColumn = iID % gameState.gameOption.column

        gameState.buttons[iID].state = "o";

        if(gameState.mode == "START") {
            fnSetupBomb();
            gameState.mode = "PLAY"
            gameState.startTime = new Date()            
        }

        var surroundingBombs = gameState.buttons[iID].mark;

        var noOfFlags = 0;


        if(surroundingBombs > 0) {
            for(var k = -1; k<=1; k++) {
                for(var j=-1; j<=1; j++) {
                    if(k==0 && j == 0) {
                        //Do Nothing for self-button
                    } else {
                        var surroundingClickRow = iRow + k;
                        var surroundingClickColumn = iColumn + j;
                        var surroundingButtonIndex = surroundingClickRow * gameState.gameOption.column + surroundingClickColumn;
                        console.log("Here", k, j, surroundingClickRow, surroundingClickColumn, surroundingButtonIndex);

                        if(surroundingClickRow >= 0  && surroundingClickRow < gameState.gameOption.row && surroundingClickColumn >= 0 && surroundingClickColumn < gameState.gameOption.column) {
                            var $gameBoard = $(this).closest("#gameboard");
                            var $targetButton = $(">button:eq(" + surroundingButtonIndex + ")", $gameBoard)
                            if($targetButton.hasClass("flag") && $targetButton.hasClass("closed")) noOfFlags++;
                            //console.log($targetButton[0].outerHtml)
                        }    
                    }
                } 
            }
        }
        console.log("surroundingBombs")
        console.log(surroundingBombs, noOfFlags)



        if(surroundingBombs == 0 || surroundingBombs == noOfFlags) {
            $(this).removeClass("closed").addClass("open clicked")
            $(this).addClass(isNaN(gameState.buttons[iID].mark) ? "bomb" : "mark" + gameState.buttons[iID].mark)
            for(var k = -1; k<=1; k++) {
                for(var j=-1; j<=1; j++) {
                    if(k==0 && j == 0) {
                        //Do Nothing for self-button
                    } else {
                        console.log("Before Click", iID, j, k)
                        var surroundingClickRow = iRow + k;
                        var surroundingClickColumn = iColumn + j;
                        var surroundingButtonIndex = surroundingClickRow * gameState.gameOption.column + surroundingClickColumn;
                        if(surroundingClickRow >= 0  && surroundingClickRow < gameState.gameOption.row && surroundingClickColumn >= 0 && surroundingClickColumn < gameState.gameOption.column) {
                            var $gameBoard = $(this).closest("#gameboard");
                            var $targetButton = $(">button:eq(" + surroundingButtonIndex + ").closed:not(.flag)", $gameBoard)
                            
                            console.log(surroundingButtonIndex, "no. of $targetButton: " + $targetButton.length)
                            if($targetButton.length == 1) {
                                console.log("inside:", surroundingBombs, gameState.buttons[surroundingButtonIndex].mark)
                                if(surroundingBombs == 0 || gameState.buttons[surroundingButtonIndex].mark == 0) {
                                    if(surroundingBombs == 0 && $targetButton.hasClass("flag")) { 
                                        $targetButton.removeClass("flag")
                                        //gameState.buttons[surroundingButtonIndex].state = "o"
                                    }
                                    if(!$targetButton.hasClass("flag")) $targetButton.trigger("click")
                                } else {
                                    if(!$targetButton.hasClass("flag")) {
                                        $targetButton.removeClass("closed").addClass("open clicked " + (isNaN(gameState.buttons[surroundingButtonIndex].mark) ? "bomb" : ("mark" + gameState.buttons[surroundingButtonIndex].mark)))
                                        console.log(surroundingButtonIndex, gameState.buttons[surroundingButtonIndex].mark)
                                        gameState.buttons[surroundingButtonIndex].state = "o"
                                                                         
                                    }
                                }                                    
                            }

                        }    
                        console.log("After Click", iID, j, k)
                    }
                } 
            }
        } else {
            
        }

    }).on("contextmenu", ">button.closed", function(e) {
        e.preventDefault();
        var iID = $(this).data("id")
        $(this).toggleClass("flag")
        gameState.buttons[iID].state = $(this).hasClass("flag") ? "f" : "c"

        if(gameState.mode == "START") {
            fnSetupBomb();
            gameState.mode = "PLAY"
            gameState.startTime = new Date()            
        }

        var flagCnt = $("#gameboard >button.flag").length;
        $("#txtBombRemaining").text(gameState.gameOption.bombNo - flagCnt)
    })

    $("#btnReset").on("click", function() {
        fnRenderBoard()
    })
    


    fnRenderBoard();



})

