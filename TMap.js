class TMap
{
    constructor(mapWidth,mapHeight)
    {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;

        // create the maps and fill them with 0s
        this.wallArray = [];
        this.textureArray = [];

        for (var i=0; i<this.mapWidth; i++)
        {
            this.wallArray[i] = [];
            this.textureArray[i] = [];
            for (var j=0; j<this.mapHeight; j++)
            {
                this.wallArray[i][j] = 0;
                this.textureArray[i][j] = 2; // 2 is the texture for a floor
            }
        }
    }

    // creates a map with walls around the edges
    CreateSimpleMap()
    {
        for (var i=0; i<this.mapWidth; i++)
        {
            for (var j=0; j<this.mapHeight; j++)
            {
                if (i==0 || j==0 || i==(this.mapWidth-1) || j==(this.mapHeight-1))
                {
                    // edge of map
                    this.wallArray[i][j] = 1;
                    this.textureArray[i][j] = 1;
                }                     
            }
        }
    }

    SetTile( tileX, tileY, type)
    {
        this.wallArray[tileX][tileY] = type;
    }

    GetTileType(tileX, tileY)
    {
        if (tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight)
        {
            if (this.wallArray[tileX][tileY] == 1)
        {
            return TileType.wall;
        }
        else
        {
            return TileType.empty;
        }
        }
        else
        {
            return TileType.oob;
        }
    }

    IsWall(tileX,tileY)
    {
        if (tileX >= 0 && tileX < this.mapWidth && tileY >= 0 && tileY < this.mapHeight)
        {
            if (this.wallArray[tileX][tileY] == 1)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

    // used with map editor - toggles whether a tile is a wall
    ToggleTile(tileX, tileY)
    {
        if (this.wallArray[tileX][tileY] == 0)
        {
            this.wallArray[tileX][tileY] = 1;
        }
        else
        {
            this.wallArray[tileX][tileY] = 0;
        }
    }

    GetTileTexture(tileX, tileY)
    {
        return this.textureArray[tileX][tileY]
    }

    get width()
    {
        return this.mapWidth;
    }

    set width(new_width)
    {
        // make sure the new width is at least 1
        if (new_width > 0)
        {
            if (new_width > this.mapWidth)
            {
                // increasing the width of the map - create new columns in mapArray
                for (var i=0; i<new_width-this.mapWidth; i++)
                {
                    var tempCol = [];
                    // add blank rows
                    for (var j=0; j<this.mapHeight; j++)
                    {
                        tempCol.push(0);
                    }
                    this.wallArray.push(tempCol);
                }
            }
            else if (new_width < this.mapWidth)
            {
                // decreasing the width of the map - remove columns from mapArray
                for (var i=0; i<this.mapWidth-new_width; i++)
                {
                    this.wallArray.pop();
                }
            }
            else
            {
                // the width hasn't changed - should never happen
            }
            
            // update the stored width value
            this.mapWidth = new_width;
        }
    }

    get height()
    {
        return this.mapHeight;
    }

    set height(new_height)
    {
        // make sure the new height is at least 1
        if (new_height > 0)
        {
            if (new_height > this.mapHeight)
            {
                // increasing the height of the map - go through each column and add new rows
                for (var i=0; i<this.mapWidth; i++)
                {
                    for (j=0; j<new_height-this.mapHeight; j++)
                    {
                        this.wallArray[i].push(0);
                    }
                }
            }
            else if (new_height < this.mapWidth)
            {
                // decreasing the height of the map - go through each colum and remove rows
                for (var i=0; i<this.mapWidth; i++)
                {
                    for (var j=0; j<this.mapHeight-new_height; j++)
                    {
                        this.wallArray[i].pop();
                    }
                }
            }
            else
            {
                // the height hasn't changed - should never happen
            }
            
            // update the stored height value
            this.mapHeight = new_height;
        }
    }

    GenerateMapObject()
    {
        var mapObject = {};

        mapObject.mapWidth = this.mapWidth;
        mapObject.mapHeight = this.mapHeight;
        mapObject.mapArray = this.wallArray;

        return mapObject;
    }

    LoadMap(mapObject)
    {
        this.mapWidth = mapObject.mapWidth;
        this.mapHeight = mapObject.mapHeight;
        this.wallArray = mapObject.mapArray;
    }
}