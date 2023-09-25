class TEditor
{
    constructor(canvasID, canvasWidth, canvasHeight, map)
    {
        this.canvas = document.getElementById(canvasID);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.map = map;

        this.tileWidth = 20;
        this.tileHeight = 20;

        this.drawPaddingX = 20;
        this.drawPaddingY = 20;

        this.horizontalScroll = false;
        this.verticalScroll = false;

        this.scrollOffsetX = 0;
        this.scrollOffsetY = 0;

        this.hScrollWidth = 0; // the width of the dragable part of the scrollbar
        this.hScrollLength = this.canvasWidth-52; // the length of the scrollbar
        this.hScrollBuffer = 0; // the empty space in the scrollbar
        this.hScrollOffsetUnit = 0; // is the offset distance that each unit in the scrollbar relates to
        this.hScrollPosition = 0; // position of the scroll grabber in the scrollbar

        this.vScrollHeight = 0; // the height of the dragable part of the scrollbar
        this.vScrollLength = this.canvasHeight-52; // the length of the scrollbar
        this.vScrollBuffer = 0; // the empty space in the scrollbar
        this.vScrollOffsetUnit = 0; // is the offset distance that each unit in the scrollbar relates to
        this.vScrollPosition = 0; // position of the scroll grabber in the scrollbar

        this.hScrollHover = false;
        this.vScrollHover = false;

        this.hScrollGrabbed = false;
        this.vScrollGrabbed = false;

        this.grabbedX = 0;
        this.grabbedY = 0;

        this.screenClicked = false;
        this.clickType = 0; // 1=add wall, 2=remove wall

        this.context = this.canvas.getContext('2d');

        this.canvas.addEventListener("mousedown", this.HandleMouseDown.bind(this), true);
        this.canvas.addEventListener("mouseup", this.HandleMouseUp.bind(this), true);
        this.canvas.addEventListener("mousemove", this.HandleMouseMove.bind(this), true)

        $("#width_spinner").spinner("value", this.map.width);
        $("#height_spinner").spinner("value", this.map.height);

        $("#width_spinner").on("spin", this.UpdateWidth.bind(this));
        $("#height_spinner").on("spin", this.UpdateHeight.bind(this));

        requestAnimationFrame(this.Draw.bind(this));
    }



    Draw()
    {
        // clear the canvas
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // draw the map grid with walls filled in
        for (var i=0; i<this.map.width; i++)
        {
            for (var j=0; j<this.map.height; j++)
            {
                if (this.map.IsWall(i, j))
                {
                    this.context.fillStyle = "#FF0000";
                    this.context.fillRect(this.scrollOffsetX + this.drawPaddingX + (this.tileWidth*i), this.scrollOffsetY + this.drawPaddingY + (this.tileHeight*j), this.tileWidth, this.tileHeight);
                }

                this.context.strokeRect(this.scrollOffsetX + this.drawPaddingX + (this.tileWidth*i), this.scrollOffsetY + this.drawPaddingY + (this.tileHeight*j), this.tileWidth, this.tileHeight);
            }
        }

        // check if the horizontal scrollbar needs to be drawn
        if (this.horizontalScroll == true)
        {
            this.context.fillStyle = "#FFFFFF";
            this.context.fillRect(24, this.canvasHeight-22, this.canvasWidth-48, 16);

            this.context.strokeStyle = "#000000";
            this.context.strokeRect(24, this.canvasHeight-22, this.canvasWidth-48, 16);

            if (this.hScrollHover == true || this.hScrollGrabbed == true)
            {
                this.context.fillStyle = "#0000FF";
            }
            else
            {
                this.context.fillStyle = "#00FF00";
            }
            this.context.fillRect(26 + this.hScrollPosition, this.canvasHeight-20, this.hScrollWidth, 12);
        }

        // check if the vertical scrollbar needs to be drawn
        if (this.verticalScroll == true)
        {
            this.context.fillStyle = "#FFFFFF";
            this.context.fillRect(this.canvasWidth-22, 24, 16, this.canvasHeight-48);

            this.context.strokeStyle = "#000000";
            this.context.strokeRect(this.canvasWidth-22, 24, 16, this.canvasHeight-48);

            if (this.vScrollHover == true || this.vScrollGrabbed == true)
            {
                this.context.fillStyle = "#0000FF";
            }
            else
            {
                this.context.fillStyle = "#00FF00";
            }
            this.context.fillRect(this.canvasWidth-20, 26+this.vScrollPosition, 12, this.vScrollHeight);
        }

        requestAnimationFrame(this.Draw.bind(this));
    }

    UpdateWidth(event, ui)
    {
        // update the map width
        this.map.width = ui.value;

        // check if the map is wider than the canvas
        if (this.drawPaddingX + (this.map.width * this.tileWidth) > this.canvasWidth)
        {
            if (this.horizontalScroll == false)
            {
                this.hScrollPosition = 0;
            }
            this.hScrollWidth = (this.canvasWidth / (this.map.width * this.tileWidth)) * this.hScrollLength;
            this.hScrollBuffer = this.hScrollLength - this.hScrollWidth;
            this.hScrollOffsetUnit = ((this.drawPaddingX + (this.map.width * this.tileWidth)) - this.canvasWidth) / this.hScrollBuffer;

            this.horizontalScroll = true;
        }
        else
        {
            this.horizontalScroll = false;
        }
    }

    UpdateHeight(event, ui)
    {
        // update the map height
        this.map.height = ui.value;

        // check if the map is taller than the map height
        if (this.drawPaddingY + (this.map.height * this.tileHeight) > this.canvasHeight)
        {
            if (this.verticalScroll == false)
            {
                this.vScrollPosition = 0;
            }
            this.vScrollHeight = (this.canvasHeight / (this.map.height * this.tileHeight)) * this.vScrollLength;
            this.vScrollBuffer = this.vScrollLength - this.vScrollHeight;
            this.vScrollOffsetUnit = ((this.drawPaddingY + (this.map.height * this.tileHeight)) - this.canvasHeight) / this.vScrollBuffer;
            
            // turn on the scroll bar
            this.verticalScroll = true;
        }
        else
        {
            this.verticalScroll = false;
        }
    }

    HandleMouseDown(e)
    {
        if (e.button == 0)
        {
            // check if the scrollbara are being clicked
            if (this.hScrollHover == true)
            {
                this.hScrollGrabbed = true;
                this.grabbedX = e.offsetX;
                this.grabbedY = e.offsetY;
            }
            else if (this.vScrollHover == true)
            {
                this.vScrollGrabbed = true;
                this.grabbedX = e.offsetX;
                this.grabbedY = e.offsetY;
            }
            else
            {
                this.screenClicked = true;

                var xPos = (e.offsetX - this.drawPaddingX - this.scrollOffsetX);
                var yPos = (e.offsetY - this.drawPaddingY - this.scrollOffsetY);
                
                var xTile = Math.floor(xPos/this.tileWidth);
                var yTile = Math.floor(yPos/this.tileHeight);

                if (this.map.IsWall(xTile, yTile) == true)
                {
                    this.clickType = 2;
                }
                else
                {
                    this.clickType = 1;
                }
                
                if (xTile < this.map.width && xTile > -1 && yTile < this.map.height && yTile > -1)
                {
                    this.map.ToggleTile(xTile, yTile);
                }
            }
        }
    }

    HandleMouseUp(e)
    {
        if (e.button == 0)
        {
            // check if the scrollbars have been grabbed and if so release them
            if (this.hScrollGrabbed == true)
            {
                this.hScrollGrabbed = false;
            }
            else if (this.vScrollGrabbed == true)
            {
                this.vScrollGrabbed = false;
            }
            else if (this.screenClicked == true)
            {
                this.screenClicked = false;
                this.clickType = 0;
            }
        }
    }

    HandleMouseMove(e)
    {
        if (this.hScrollGrabbed == true)
        {
            var posX = e.offsetX;

            var change = posX - this.grabbedX;
            this.hScrollPosition = this.hScrollPosition + change;

            if (this.hScrollPosition < 0) { this.hScrollPosition = 0; }
            if (this.hScrollPosition > this.hScrollLength - this.hScrollWidth) { this.hScrollPosition = this.hScrollLength - this.hScrollWidth; }

            this.grabbedX = this.grabbedX + change;

            this.scrollOffsetX = this.scrollOffsetX - (change * this.hScrollOffsetUnit);
            if (this.scrollOffsetX > 0) { this.scrollOffsetX = 0; }
            if (this.scrollOffsetX < (((this.map.width * this.tileWidth)+40)-this.canvasWidth)*-1) { this.scrollOffsetX = (((this.map.width * this.tileWidth)+40)-this.canvasWidth)*-1; }    
        }

        if (this.vScrollGrabbed == true)
        {
            var posY = e.offsetY;

            var change = posY - this.grabbedY;
            this.vScrollPosition = this.vScrollPosition + change;

            if (this.vScrollPosition < 0) { this.vScrollPosition = 0; }
            if (this.vScrollPosition > this.vScrollLength - this.vScrollHeight) { this.vScrollPosition = this.vScrollLength - this.vScrollHeight; }

            this.grabbedY = this.grabbedY + change;

            this.scrollOffsetY = this.scrollOffsetY - (change * this.vScrollOffsetUnit);
            if (this.scrollOffsetY > 0) { this.scrollOffsetY = 0; }
            if (this.scrollOffsetY < (((this.map.height * this.tileHeight)+40)-this.canvasHeight)*-1) { this.scrollOffsetY = (((this.map.height * this.tileHeight)+40)-this.canvasHeight)*-1; }    
        }

        // check if we're drawing the horizontal scrollbar
        if (this.horizontalScroll == true)
        {
            // check if the mouse is over the grabby bit
            if (e.offsetX >= 26+this.hScrollPosition && e.offsetX <= 26+this.hScrollPosition+this.hScrollWidth && e.offsetY >= this.canvasHeight-20 && e.offsetY <= this.canvasHeight-8)
            {
                this.hScrollHover = true;
            }
            else
            {
                this.hScrollHover = false;
            }
        }
        
        // check if we're drawing the vertcial scrollbar
        if (this.verticalScroll == true)
        {
            // check if the mouse is over the grabby bit
            if (e.offsetX >= this.canvasWidth-20 && e.offsetX <= this.canvasWidth-8 && e.offsetY >= 26+this.vScrollPosition && e.offsetY <= 26+this.vScrollPosition+this.vScrollHeight)
            {
                this.vScrollHover = true;
            }
            else
            {
                this.vScrollHover = false;
            }
        }

        if (this.screenClicked == true)
        {
            var xPos = (e.offsetX - this.drawPaddingX - this.scrollOffsetX);
            var yPos = (e.offsetY - this.drawPaddingY - this.scrollOffsetY);
            
            var xTile = Math.floor(xPos/this.tileWidth);
            var yTile = Math.floor(yPos/this.tileHeight);
            
            if (xTile < this.map.width && xTile > -1 && yTile < this.map.height && yTile > -1)
            {
                if (this.clickType == 1)
                {
                    this.map.SetTile(xTile, yTile, 1);
                }
                else if (this.clickType == 2)
                {
                    this.map.SetTile(xTile, yTile, 0);
                }
            }
        }
    }

}