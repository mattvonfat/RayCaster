class TCanvas
{
    constructor(canvasID,canvasWidth,canvasHeight)
    {
        this._canvas = document.getElementById(canvasID);
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._canvas.width = canvasWidth;
        this._canvas.height = canvasHeight;

        this._imageData = new Array();

        this._context = this._canvas.getContext("2d");
    }

    ClearCanvas()
    {
        this._context.fillStyle = "#000000";
        this._context.fillRect(0, 0, this._canvasWidth, this._canvasHeight);
    }

    DrawWallSlice(wallImg,wallPos,wallHeight,xPos,sliceHeight,darknessValue)
    {
        this._context.globalAlpha = darknessValue;
        this._context.drawImage(wallImg, wallPos, 0, 1, wallHeight, xPos, (this._canvasHeight/2)-(sliceHeight/2), 1, sliceHeight);
        this._context.globalAlpha = 1.0;
        
    }

    DrawFloorPoint(floorImg, column, row, xPoint, yPoint, darknessValue)
    {
        var val = darknessValue * 255.0;
        this._imageData[xPoint][yPoint].data[3] = val;
        this._context.putImageData(this._imageData[xPoint][yPoint], column, row);
        //this._context.putImageData(this._imaged, column, row, xPoint, yPoint, 1, 1);
    }

    Input_KeyDown(event,t)
    {
        
    }

    get canvas()
    {
        return this._canvas;
    }

    LoadImageData(image,width,height,name)
    {
        this.ClearCanvas();
        this._context.drawImage(image, 0, 0);

        this._imaged = this._context.getImageData(0, 0, 32, 32);

        for (var i=0; i<32; i++)
        {
            this._imageData[i] = new Array();
            for (var j=0; j<32; j++)
            {
                //console.log(typeof(this._context.getImageData(i, j, 1, 1)));
                this._imageData[i][j] = this._context.getImageData(i, j, 1, 1);
            }
        }
        
        this.ClearCanvas();
    }
}