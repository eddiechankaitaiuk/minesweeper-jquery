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

    var fnFindSurroundingButtons = function($objButton) {
        var iID = $objButton.data("id") * 1
        // console.log("iID ", iID)
        // console.log(gameState.gameOption.column, gameState.gameOption.row)
        var arrSurroundingIndex = [ iID - gameState.gameOption.column - 1, iID - gameState.gameOption.column, iID - gameState.gameOption.column + 1, iID - 1, iID, iID + 1, iID + gameState.gameOption.column - 1, iID + gameState.gameOption.column, iID + gameState.gameOption.column + 1]
        var $result = null;
        var totalButton = gameState.gameOption.column * gameState.gameOption.row
        var iColumn = iID % gameState.gameOption.column
        // console.log(arrSurroundingIndex)
        for (i in arrSurroundingIndex) {
            var iCurrentIndex = arrSurroundingIndex[i]
            if(iCurrentIndex == iID || iCurrentIndex < 0 || iCurrentIndex >= totalButton) {
                //Ignore if top row or bottom row
            } else if((iColumn == 0 && i % 3 == 0) || (iColumn == gameState.gameOption.column - 1 && i % 3 == 2)) {
                //Ignore if leftmost or rightmost column
            } else {
                var strSelectorString = "#gameboard >button:eq(" + iCurrentIndex + ")"
                $result = $result == null ? $(strSelectorString) : $result.add(strSelectorString)
            }
        }
        return $result;
    }

    var fnGameOver = function(winmode) {
        gameState.mode = "GAMEOVER"
        gameState.endTime = new Date()
        if(winmode == "FAIL") {
            console.log("fnGameOver: " + winmode)
            for(i in gameState.bombsLocation) {
                var iIndex = gameState.bombsLocation[i]
                $("#gameboard >button:eq(" + iIndex + ").closed:not(.flag)").removeClass("closed").addClass("open bomb")
            }
            
            console.log(gameState.buttons)
            var arrWrongFlagButtons = gameState.buttons.map(function(obj, index) {
                //console.log(index)
                if (obj.state == "f" && !isNaN(obj.mark)) {
                    console.log(index)
                    $("#gameboard >button:eq(" + index + ")").removeClass("flag").addClass("wrong_flag")
                } 
            })

        }
        //console.log("GAMEOVER: " + gameState.buttons.filter(function(obj) {return obj.state == "c"}).length)
        //$("#gameboard >button").prop("disabled", "disabled")
    }

    var fnTimer = function() {
        if(gameState.mode == "PLAY") {
            var timeNow = new Date()
            //console.log(gameState.startTime)
            //console.log(timeNow)
            var duration = Math.floor((timeNow - gameState.startTime)/1000)
            //console.log(duration)
            $("#txtTimeSpent").text(("00" + duration + "").slice(-3))
            setTimeout(fnTimer, 1000)    
        }
    }


    $("#selLevel").on("change", function() {
        switch($(this).val()) {
            case "INTERMEDIATE" :
                INITIAL_GAMESTATE.gameOption = GAMEOPTION.INTERMEDIATE;
                break;
            case "EXPERT" :
                INITIAL_GAMESTATE.gameOption = GAMEOPTION.EXPERT;
                break;
            default:
                INITIAL_GAMESTATE.gameOption = GAMEOPTION.BEGINNER;
        }
        fnRenderBoard()
    })

    $("#gameboard").on("click", ">button", function(e) {
        //console.log("click: " + $(this).data("id"))
        if (gameState.mode == "GAMEOVER") return;
        if ($(this).hasClass("flag")) return;
        var iID = ($(this).data("id"))
        var iRow = Math.floor(iID / gameState.gameOption.column)
        var iColumn = iID % gameState.gameOption.column

        var $surroundingButtons = fnFindSurroundingButtons($(this))
        var originalState = gameState.buttons[iID].state

        gameState.buttons[iID].state = "o";

        if(gameState.mode == "START") {
            fnSetupBomb();
            gameState.mode = "PLAY"
            gameState.startTime = new Date();
            setTimeout(fnTimer, 1000)
        }

        var surroundingBombs = gameState.buttons[iID].mark;

        var noOfFlags = 0;


        if(surroundingBombs > 0) {
            $surroundingButtons.each(function() {
                if($(this).hasClass("flag") && $(this).hasClass("closed")) noOfFlags++;
            })
        }
        // console.log("surroundingBombs")
        // console.log(surroundingBombs, noOfFlags)



        $(this).removeClass("closed").addClass("open clicked")
        $(this).addClass(isNaN(gameState.buttons[iID].mark) ? "bomb" : "mark" + gameState.buttons[iID].mark)
        
        isNaN(gameState.buttons[iID].mark) && fnGameOver('FAIL')


        gameState.buttons[iID].state = "o"
        console.log("Outside")
        if(surroundingBombs == 0 || surroundingBombs == noOfFlags) {
            console.log("Condition 1")

            $surroundingButtons.each(function() {
                surroundingBombs == 0 && $(this).removeClass("flag")

                if($(this).hasClass("closed") && !$(this).hasClass("flag")) {
                    var surroundingButtonIndex = $(this).data("id")
                    //console.log("inside:", surroundingBombs, gameState.buttons[surroundingButtonIndex].mark)
                    if(surroundingBombs == 0 || gameState.buttons[surroundingButtonIndex].mark == 0) {
/*                         if(surroundingBombs == 0 && $(this).hasClass("flag")) { 
                            $(this).removeClass("flag")
                            //gameState.buttons[surroundingButtonIndex].state = "o"
                        } */
                        if(!$(this).hasClass("flag")) $(this).trigger("click")
                    } else {

                        $(this).removeClass("closed").addClass("open clicked " + (isNaN(gameState.buttons[surroundingButtonIndex].mark) ? "bomb" : ("mark" + gameState.buttons[surroundingButtonIndex].mark)))

                        isNaN(gameState.buttons[surroundingButtonIndex].mark) && fnGameOver('FAIL')

                        console.log(surroundingButtonIndex, gameState.buttons[surroundingButtonIndex].mark)
                        gameState.buttons[surroundingButtonIndex].state = "o"
                                                             
                    }                                    
                }
            })

        } else if (originalState == "o") {
        //} else {
            var $unClickedButtons = $surroundingButtons.filter(".closed:not(.flag)");
            $unClickedButtons.addClass("pressed")
            setTimeout(function() {
                $unClickedButtons.removeClass("pressed")
            }, 200)
            
        }

        //Check if remaining unopened icon are all bombs, if so, set to all flags and the win
        var noOfClosedButtons = gameState.buttons.filter(function(obj) {return obj.state == "c" || obj.state == "f"}).length;
        if(noOfClosedButtons == gameState.gameOption.bombNo) {
            $("#gameboard >button.closed").addClass("flag");
            gameState.buttons.map(function(obj) {
                if(obj.state == "c") {
                    obj.state = "f"
                }
                return obj 
            })
            fnGameOver('WIN');
        }

    }).on("contextmenu", ">button", function(e) {
        e.preventDefault();
        if(!$(this).hasClass("closed")) return;
        var iID = $(this).data("id")
        $(this).toggleClass("flag")
        gameState.buttons[iID].state = $(this).hasClass("flag") ? "f" : "c"

        if(gameState.mode == "START") {
            fnSetupBomb();
            gameState.mode = "PLAY"
            gameState.startTime = new Date()
            setTimeout(fnTimer, 1000)        
        }

        var flagCnt = $("#gameboard >button.flag").length;
        $("#txtBombRemaining").text(gameState.gameOption.bombNo - flagCnt)
    })

    $("#btnReset").on("click", function() {
        fnRenderBoard()
    })
    
    fnRenderBoard();

})
