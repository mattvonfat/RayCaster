class TPlayer
{
    constructor(playerX,playerY,playerAngle,playerHeight,moveSpeed)
    {
        this._playerX = playerX;
        this._playerY = playerY;
        this._playerAngle = playerAngle;
        this._playerHeight = playerHeight;
        this._moveSpeed = moveSpeed;
        this._turnSpeed = 5;
        this._turnDirection = 0; // 0, 1, or -1
        this._moveDirection = 0;
        this._game = null;
        this._map = null;
    }

    UpdatePlayer(delta)
    {
        // if player is moving then update the player position
        if (this._moveDirection !=0 )
        {
            var xChange = (this._game._angleArray[Math.floor(this._playerAngle)]['cosPlayerAngle'] * this._moveSpeed);
            var yChange = (this._game._angleArray[Math.floor(this._playerAngle)]['sinPlayerAngle'] * this._moveSpeed);

            var tmpPlayerX = this._playerX + (this._moveDirection * xChange * delta);
            var tmpPlayerY = this._playerY - (this._moveDirection * yChange * delta);

            if (this._map.IsWall(Math.floor(tmpPlayerX/32),Math.floor(tmpPlayerY/32)) == false)
            {
                this._playerX = tmpPlayerX;
                this._playerY = tmpPlayerY;
            }
        }

        // if player is turning then update the player angle
        if (this._turnDirection != 0)
        {
            this._playerAngle = this._playerAngle + (this._turnDirection * this._turnSpeed * delta);

            if (this._playerAngle >= 360)
            {
                this._playerAngle = this._playerAngle - 360;
            }
            else if (this._playerAngle < 0)
            {
                this._playerAngle = this._playerAngle + 360;
            }
        }
    }

    set turnDirection(direction)
    {
        this._turnDirection = direction;
    }

    set moveDirection(direction)
    {
        this._moveDirection = direction;
    }

    get x()
    {
        return this._playerX;
    }

    set x(val)
    {
        this._playerX = val;
    }

    get y()
    {
        return this._playerY;
    }

    set y(val)
    {
        this._playerY = val;
    }

    get angle()
    {
        return Math.floor(this._playerAngle);
    }

    get speed()
    {
        return this._moveSpeed;
    }

    get height()
    {
        return this._playerHeight
    }
}