class TGame
{
    constructor(screenCanvasID, screenWidth, screenHeight, FOV, wallHeight, tileWidth, player, map)
    {
        this._screenWidth = screenWidth;
        this._screenHeight = screenHeight;
        this._FOV = FOV;
        this._projectionPlaneDistance = (this._screenWidth / 2) / Math.tan(this.DegToRad(this._FOV / 2));

        this._wallHeight = wallHeight;
        this._tileWidth = tileWidth;

        this._gameCanvas = new TCanvas(screenCanvasID, screenWidth, screenHeight);
        this._gameCanvas.canvas.addEventListener("keydown", this.Input_KeyDown.bind(this), false);
        this._gameCanvas.canvas.addEventListener("keyup", this.Input_KeyUp.bind(this), false);

        this._player = player;
        this._player._game = this;
        this._player._map = map;
        this._map = map;
        this.first = true;
    }

    Start()
    {
        this._startTime = 0;
        requestAnimationFrame(this.MainLoop.bind(this));
    }

    MainLoop(timestamp)
    {
        var delta = (timestamp - this._startTime)/100;
        this._player.UpdatePlayer(delta);
        this.Draw();
        requestAnimationFrame(this.MainLoop.bind(this));
        this._startTime = timestamp;
    }

    Draw() 
    {
        var castResult;
        var wallDistance, wallPos, sliceHeight;
        var playerAngle = this._player.angle;

        var startTime, endTime;
        //startTime = Date.now()

        this._gameCanvas.ClearCanvas();

        for (var i = 0; i < this._screenWidth; i++) {
            castResult = this.CastRay(this._angleArray[playerAngle][i][0], this._angleArray[playerAngle][i][1]);
            wallDistance = castResult[0];
            wallPos = castResult[1];
            
            if (wallDistance != null)
            {
                wallDistance = wallDistance * this._angleArray[playerAngle][i][2];

                sliceHeight = (this._wallHeight / wallDistance) * this._projectionPlaneDistance;

                this.DrawFloor( ((this._screenHeight/2) + Math.floor(sliceHeight)/2)-1, playerAngle, i);
                var darknessValue = (0.8/wallDistance*70);

                this._gameCanvas.DrawWallSlice(this._wallImg, wallPos, this._wallHeight, i, sliceHeight, darknessValue);
            }            
        }

        //endTime = Date.now()

        //console.log("Draw time: " + (endTime-startTime));
    }

    CastRay(castAngle, castAngleTan) 
    {
        var playerTileX, playerTileY;
        var horiX, horiY, vertX, vertY, tileX, tileY;
        var horiDist, vertDist;
        var wallPosH, wallPosV;
        var playerX = this._player.x;
        var playerY = this._player.y;
        
        // Fist we check if we are in a wall - shouldn't be but ti will prevent errors if we are
        playerTileX = Math.ceil(playerX / this._tileWidth) - 1;
        playerTileY = Math.ceil(playerY / this._tileWidth) - 1;

        if (this._map.IsWall(playerTileX, playerTileY)) {
            // player is in a wall - shouldn't happen so return null
            return null;
        }

        // ****
        // Checking the horizontal walls
        // ****
        if (castAngle >= 0 && castAngle < 180) {
            horiY = playerTileY * this._tileWidth;
            horiX = playerX + (Math.abs(playerY - horiY) / castAngleTan);

            tileX = Math.floor(horiX / this._tileWidth);
            tileY = Math.floor(horiY / this._tileWidth) - 1;
            
            while (true) {
                if (horiX < 0 || horiX >= this._map.width * this._tileWidth || horiY < 0 || horiY >= this._map.height * this._tileWidth) {
                    horiDist = null;
                    break;
                }
                
                if (this._map.IsWall(tileX, tileY)) {
                    // hit a wall
                    horiDist = Math.sqrt(((Math.abs(playerX - horiX)) ** 2) + ((Math.abs(playerY - horiY)) ** 2));
                    wallPosH = horiX % this._tileWidth;
                    break;
                }

                horiY = horiY - this._tileWidth;
                horiX = horiX + (this._tileWidth / castAngleTan);

                tileX = Math.floor(((horiX) / this._tileWidth));
                tileY = Math.floor(((horiY) / this._tileWidth)) - 1;
            }
        }
        else // angle >= 180 && < 360
        {
            horiY = (playerTileY + 1) * this._tileWidth;
            horiX = playerX - (Math.abs(playerY - horiY) / castAngleTan);

            tileX = Math.floor(horiX / this._tileWidth);
            tileY = Math.floor(horiY / this._tileWidth);
            
            while (true) {
                if (horiX < 0 || horiX >= this._map.width * this._tileWidth || horiY < 0 || horiY >= this._map.height * this._tileWidth) {
                    horiDist = null;
                    break;
                }

                if (this._map.IsWall(tileX, tileY)) {
                    // hit a wall
                    horiDist = Math.sqrt(((Math.abs(playerX - horiX)) ** 2) + ((Math.abs(playerY - horiY)) ** 2));
                    wallPosH = horiX % this._tileWidth;
                    break;
                }

                horiY = horiY + this._tileWidth;
                horiX = horiX - (this._tileWidth / castAngleTan);

                tileX = Math.floor(horiX / this._tileWidth);
                tileY = Math.ceil(horiY / this._tileWidth);
            }
        }

        // ****
        // Checking the vertical walls
        // ****
        if (castAngle > 90 && castAngle < 270) {
            vertX = playerTileX * this._tileWidth;
            vertY = playerY + (Math.abs(playerX - vertX) * castAngleTan);

            tileX = Math.floor(vertX / this._tileWidth) - 1;
            tileY = Math.floor(vertY / this._tileWidth);

            while (true)
            {
                if (vertX < 0 || vertX >= this._map.width * this._tileWidth || vertY < 0 || vertY >= this._map.height * this._tileWidth) {
                    vertDist = null;
                    break;
                }

                if (this._map.IsWall(tileX, tileY)) {
                    // hit a wall
                    vertDist = Math.sqrt(((Math.abs(playerX - vertX)) ** 2) + ((Math.abs(playerY - vertY)) ** 2));
                    wallPosV = vertY % this._tileWidth;
                    break;
                }

                vertX = vertX - this._tileWidth;
                vertY = vertY + (this._tileWidth * castAngleTan);

                tileX = Math.floor(vertX / this._tileWidth) - 1;
                tileY = Math.floor(vertY / this._tileWidth);
            }
        }
        else
        {
            vertX = (playerTileX + 1) * this._tileWidth;
            vertY = playerY - (Math.abs(playerX - vertX) * castAngleTan);

            tileX = Math.floor(vertX / this._tileWidth);
            tileY = Math.floor(vertY / this._tileWidth);

            while (true) {
                if (vertX < 0 || vertX >= this._map.width * this._tileWidth || vertY < 0 || vertY >= this._map.height * this._tileWidth) {
                    vertDist = null;
                    break;
                }

                if (this._map.IsWall(tileX, tileY)) {
                    // hit a wall
                    vertDist = Math.sqrt(((Math.abs(playerX - vertX)) ** 2) + ((Math.abs(playerY - vertY)) ** 2));
                    wallPosV = vertY % this._tileWidth;
                    break;
                }

                vertX = vertX + this._tileWidth;
                vertY = vertY - (this._tileWidth * castAngleTan);

                tileX = Math.floor(vertX / this._tileWidth);
                tileY = Math.floor(vertY / this._tileWidth);
            }
        }

        if (horiDist != null && vertDist != null) {
            if (horiDist < vertDist) {
                return [horiDist, Math.floor(wallPosH)];
            }

            else {
                return [vertDist, Math.floor(wallPosV)];
            }
        }
        else if (horiDist == null && vertDist != null) {
            return [vertDist, Math.floor(wallPosV)];
        }
        else if (vertDist == null && horiDist != null) {
            return [horiDist, Math.floor(wallPosH)];
        }
        else
        {
            return [null, 0];
        }
    }

    DrawFloor(firstRow, playerAngle, screenSlice)
    {
        
        var currentRow = firstRow;

        while (currentRow <= this._screenHeight)
        {
            var straightDistance = (this._player.height / (currentRow - (this._screenHeight / 2))) * this._projectionPlaneDistance;
            var actualDistance = straightDistance / (this._angIncArr[screenSlice][1]);
            
            var xDistance = Math.floor(this._angleArray[playerAngle][screenSlice][3] * actualDistance);
            var yDistance = Math.floor(this._angleArray[playerAngle][screenSlice][4] * actualDistance);
            
            var xCoord = Math.floor((this._player.x + xDistance) % 32);
            var yCoord = Math.floor((this._player.y - yDistance) % 32);
            
            var darknessValue = (0.8/actualDistance*70);

            this._gameCanvas.DrawFloorPoint(this._floorImg, screenSlice, currentRow, xCoord, yCoord, darknessValue);

            currentRow = currentRow + 1;
        }
    }

    LoadImages(imageIDWall,imageIDFloor)
    {
        this._wallImg = document.getElementById(imageIDWall);
        this._floorImg = document.getElementById(imageIDFloor);
        this._gameCanvas.LoadImageData(this._floorImg, 32, 32, 'floor');
    }

    // This function precalculates angles so it doesn't have to be done each draw frame
    RunPrecalculations() 
    {
        this._angIncArr = [];
        this._angleArray = [];
        //this._angleCastArray = [];
        var tmpAngle;
        // Work out the angle increments for each screen column 
        for (var i = 0; i < this._screenWidth; i++) {
            // dividing FOV by screenWidth isn't that accurate due to stretching, so this makes it slightly more accurate
            this._angIncArr[i] = [];
            this._angIncArr[i][0] = this.RadToDeg(Math.atan((i - (this._screenWidth / 2)) / this._projectionPlaneDistance));
            this._angIncArr[i][1] = Math.cos(this.DegToRad(this._angIncArr[i][0]));
        }

        // this precalculates the tan value for each screen slice at each angle between 0-359
        // i is the angle of the player and j is the screen slice
        for (var i = 0; i < 360; i++) {
            this._angleArray[i] = [];
            //this._angleCastArray[i] = [];
            for (var j = 0; j < this._screenWidth; j++) {
                tmpAngle = i - this._angIncArr[j][0];
                if (tmpAngle < 0) {
                    tmpAngle = tmpAngle + 360;
                }
                else if (tmpAngle >= 360) {
                    tmpAngle = tmpAngle - 360;
                }
                this._angleArray[i][j] = [];
                this._angleArray[i][j][0] = tmpAngle;
                this._angleArray[i][j][1] = Math.tan(this.DegToRad(tmpAngle));
                this._angleArray[i][j][2] = Math.cos(this.DegToRad(tmpAngle-i));
                this._angleArray[i][j][3] = Math.cos(this.DegToRad(tmpAngle));
                this._angleArray[i][j][4] = Math.sin(this.DegToRad(tmpAngle));
                this._angleArray[i]['cosPlayerAngle'] = Math.cos(this.DegToRad(i));
                this._angleArray[i]['sinPlayerAngle'] = Math.sin(this.DegToRad(i));
            }
        }
    }

    Input_KeyDown(event)
    {
        if (event.keyCode == 68) // D
        {
            this._player.turnDirection = -1;
        }
        else if (event.keyCode == 65) // A
        {
            this._player.turnDirection = 1;
        }
        else if (event.keyCode == 87) // W
        {
            this._player.moveDirection = 1;
        }
        else if (event.keyCode == 83) // S
        {
            this._player.moveDirection = -1;
        }
    }

    Input_KeyUp(event)
    {
        if (event.keyCode == 68 || event.keyCode == 65) // D or A
        {
            this._player.turnDirection = 0
        }

        if (event.keyCode == 87 || event.keyCode == 83) // W or S
        {
            this._player.moveDirection = 0;
        }
    }

    LoadMap(mapObject)
    {
        this._map.LoadMap(mapObject);
    }

    DegToRad(angle) 
    {
        return (angle * Math.PI) / 180;
    }

    RadToDeg(angle) 
    {
        return (angle * 180) / Math.PI;
    }
}
