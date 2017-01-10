/* and fimally added a comment to this as well */

/* ******  Global Variables  ****** */
// Global variable for the editor matrix
var editorArray;
var minRow = 1;
var maxRow = 10;
var minCol = 1;
var maxCol = 10;
var pathToImages = "Images/"

// other global variables


// Startup events and scripts on form load
window.addEventListener("load", loadEditor, false);







/* ****** Objects and Methods definition ****** */

// template for a Horizontal link Ladder Logic Element 
function logicElement(rowPos, colPos, type, symbol) 
{
	// horzLogic - object properties.
	this.editor_Row = rowPos;
	this.editor_Col = colPos;
	this.input_Status = false;
	this.output_Status = false;
	this.sensor_Status = false;
	this.logic_Type = type;
	this.symbol = symbol;
	this.image = "None"
	this.prev_Col = colPos - 1;
	this.above_Row = rowPos - 1;
	this.below_Row = rowPos + 1;
	
	// horzLogic - Declare object methods
	this.update_Status = update_Status;
	this.update_Position = update_Position;
	// this.change_Image = change_Image;  TODO method or Global function ????
}

// horzLogic - Define object methods
function update_Status()
{
var lS;  // left Status
var lT; // left Type
var tS; // top status  
var tT; // top Type  
var bS; // bottom status
var bT; // bottom type


	// Fetch or set the status and type of the element to the left
	// test if the element is in the first column
	if (this.editor_Col == minCol)
	{
	console.log("On Left Col");
		lS = true;
		lT = "Horz";
		tS = true;
		tT = "Horz";
		bS = true;
		bT = "Horz";
	}
	// test if this element is in the first row and not the first col
	// this element on Top row of editor
	else if (this.editor_Row == minRow && this.editor_Col > minCol) 
	{
	console.log("On top Row");
		// Fetch the status and type of the element to the left
		lS = editorArray[this.editor_Row][this.prev_Col].output_Status;
		lT = editorArray[this.editor_Row][this.prev_Col].logic_Type;
		tS = false;
		tT = "None";
		// Fetch the status and type of the element to the left and below
		bS = editorArray[this.below_Row][this.prev_Col].output_Status;
		bT = editorArray[this.below_Row][this.prev_Col].output_Status;
	}
	// The element is on the bottom row
	else if (this.editor_Row == maxRow)
	{
	console.log("On the Botton Row");
		// Fetch the status and type of the element to the left 
		lS = editorArray[this.editor_Row][this.prev_Col].output_Status;
		lT = editorArray[this.editor_Row][this.prev_Col].logic_Type;
		// Fetch the status and type of the element to the left and above
		tS =  editorArray[this.above_Row][this.prev_Col].output_Status;
		tT =  editorArray[this.above_Row][this.prev_Col].logic_Type;
		// Fetch the status and type of the element to the left and below
		bS = false;
		bT = "None";

	}
	// this element within the editor bounds
	else 
	{
	console.log("Okay position");
		// Fetch the status and type of the element to the left 
		lS = editorArray[this.editor_Row][this.prev_Col].output_Status;
		lT = editorArray[this.editor_Row][this.prev_Col].logic_Type;
		// Fetch the status and type of the element to the left and above
		tS =  editorArray[this.above_Row][this.prev_Col].output_Status;
		tT =  editorArray[this.above_Row][this.prev_Col].logic_Type;
		// Fetch the status and type of the element to the left and below
		bS = editorArray[this.below_Row][this.prev_Col].output_Status;
		bT = editorArray[this.below_Row][this.prev_Col].logic_Type;
	}
	
	// test what type of element this is
	console.log(" testNeigbours called with : " + lS + "  " + lT + "  " + tS + "  " + tT + "  " + bS + "  "  + bT + "  " + this.logic_Type);
	this.input_Status = testNeighbours(lS, lT, tS, tT, bS, bT, this.logic_Type);
	console.log(" Input_Status now : " + this.input_Status);
	
	// update the output status (dependant on this type)
	this.output_Status = setOutputStatus(this.input_Status, this.sensor_Status, this.logic_Type)
	console.log(" Output_Status now : " + this.output_Status);
	
	// Update the Image reference
	this.image = updateImage(this.input_Status, this.output_Status, this.logic_Type);
	
	// Update the Tile display image in the editor 
	try
	{
		updateLadderTile(this.editor_Row, this.editor_Col, this.image);
	}
	catch(err)
	{
		// there is no image of this type - Clear the tile on the Canvas
		clearCurrentTile(((this.editor_Col * 70) - 70), ((this.editor_Row * 35)-35));
	}
	
}

function update_Position(row, col)
{
	try
	{
		if ((this.editor_Row < minRow) || (this.editor_Row > maxRow) || (this.editor_Col < minCol) || (this.editor_Col < maxCol))
		{
			throw("Out Of Bounds")
		}
		this.editor_Row = row;
		this.editor_Col = col;
		this.update_Status();
	}
	catch(err)
	{
		window.alert(err);
	}
}



/* ****** Miscellaneous Global functions  ****** */

// determine input status based on status of neighbours
function testNeighbours(lS, lT, tS, tT, bS, bT, sender_Type)
{
var Status;

	switch(sender_Type)
	{
		case "Horz": // element type is horizontal - check previous 
			Status = ((lS && ((lT == "Horz") || (lT == "NO") || (lT == "NC")))) || (tS && tT == "Vert") || (bS && bT == "Vert");
			break;
		case "NO": // element type is horizontal - check previous 
			Status = ((lS && ((lT == "Horz") || (lT == "NO") || (lT == "NC")))) || (tS && tT == "Vert") || (bS && bT == "Vert");
			break;	
		case "Coil": // element type is Coil - check previous 
			Status = ((lS && ((lT == "Horz") || (lT == "NO") || (lT == "NC")))) || (tS && tT == "Vert") || (bS && bT == "Vert");
			break;
		default: // the type doesn't match anything
			Status = false;
	}		
return Status;	
}

function setOutputStatus(Input_Status, Sensor_Status, sender_Type)
{
var Status;

	switch(sender_Type)
	{
		case "Horz": // element type is horizontal - check previous 
			Status = Input_Status;
			break;
		case "Vert": // element type is vertical - check previous 
			Status = Input_Status;
			break;
		case "NO": // element type is vertical - check previous 
			Status = (Input_Status && Sensor_Status);
			break;
		case "NC": // element type is vertical - check previous 
			Status = (Input_Status && !Sensor_Status);
			break;
		case "Coil": // element type is Coil - check previous 
			Status = Input_Status;
			break;
		default: // the type doesn't match anything
			Status = false;
	}		
return Status;	
}


// function to select the update image
function updateImage(input_Status, output_Status, type)
{
var imageRef; 
	
	switch(type)
	{
		case "Horz":  // a horizontal link
			imageRef = selectImageFile(input_Status, output_Status, "Horz_");
			break;
		case "Vert":  // a vertical link
			imageRef = selectImageFile(input_Status, output_Status, "Vert_" );
			break;
		case "NO": // a NO contact
			imageRef = selectImageFile(input_Status, output_Status, "NO_");
			break;
		case "NC": // a NC contact
			imageRef = selectImageFile(input_Status, output_Status, "NC_");
			break;
		case "Coil": // a Coil contact
			imageRef = selectImageFile(input_Status, output_Status, "Coil_");
			break;
		default:
			imageRef = pathToImages + "None.png";	
	}
console.log("Image selected by FB = " + imageRef);	
return imageRef;
	
}

// Function to the image reference for a given element
function selectImageFile(inputStatus, outputStatus, prefix)
{
var selection;
	if (outputStatus)
	{
		selection = pathToImages + prefix + "Gr.png";
	}
	else if ((inputStatus) && (!outputStatus))
	// TODO change "Bl.png" to "Gr_Bl.png" when icons made
	{
		selection = pathToImages + prefix + "Bl.png";
	}
	else
	{
		selection = pathToImages + prefix + "Bl.png";
	}
return selection	
}


// function to create a matrix fro the editing area
// arr[1][5] = new horzLogic(1, 2, "Horz", "R1C5");
function matrix(rows, cols, defaultVal)
{
var arr = [];

  // Creates all lines:
  for(var i=0; i <= (rows); i++)
  {

      // Creates an empty line
      arr.push([]);

      // Adds cols to the empty line:
      arr[i].push( new Array(cols));

      for(var j=0; j <= (cols); j++)
      {
        // Initializes:
        arr[i][j] = defaultVal;
      }
  
  }
	// set the global variables of the Matrix

return arr;
}


// Function to set the type of tile when an element is
// dragged unto it.
function set_Editor_Tile(row, col, newType)
{
var rowPos = row;   // The row number to update
var colPos = col; // The column number to update

	editorArray[rowPos][colPos].logic_Type = newType;
	updateALL();
}
/* ****** Functions for Graphics manipulation ****** */


// function to add a ladder logic tile to the canvas
function addLadderTile(img, column, row) 
{
    var c = document.getElementById("LLCanvas");
    var ctx = c.getContext("2d");
    var imageObj = new Image();
    
    imageObj.onload = function() 
    {
		ctx.drawImage(imageObj ,column , row);
    };
    imageObj.src = img;
}

function clearCurrentTile(canvasCol, canvasRow)
{
var canvas = document.getElementById("LLCanvas");
var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(canvasCol,canvasRow,70,35);
}

function updateLadderTile(Row, Col, imageSrc)
{
var canvasRow = ((Row * 35) - 35);
var canvasCol = ((Col * 70) - 70);

	clearCurrentTile(canvasCol, canvasRow);
	addLadderTile(imageSrc, canvasCol, canvasRow);
	console.log("Tile updated at " + canvasRow + " , " + canvasCol);
}


/* ****** Drag and Drop handlers  * *******/

// called at the beginning of any drag operation 
function dragStartHandler(evt) 
{
var img = document.createElement("img");  // variable to hold th source for the gohst Image
var element_Type = evt.target.dataset.lltype;  // set elementType to the type of element we are dragging
var dragSource = evt.target.className;

	img.src = pathToImages + element_Type + "_Bl.png"; // build the image source for this element
	console.log("loaded" + img.src + " on start drag")
	evt.dataTransfer.setDragImage(img, 0, 13);


	if (dragSource == "newElement")
	{

		evt.effectAllowed = "copy";	// our drag only allows copy operations
		evt.dataTransfer.setData("text/plain", evt.target.dataset.lltype);
    	// evt.dataTransfer.setData("text/html", "copy");  -- may not need this
    	
		
		

	}
	else
	{
		evt.effectAllowed = "move";	// our drag only allows moving operations
		evt.dataTransfer.setData("text/plain", evt.target.dataset.lltype);
    	// evt.dataTransfer.setData("text/html", "move");  - may not need this	
	}
    
    
    return true;
}

// stop propagation and prevent default drag behavior
// to show that our target lists are valid drop targets
function dragEnterHandler(evt) 
{
    evt.stopPropagation();
    evt.preventDefault();

    return false;
}

// if the user drags over our editor, show
// that it allows copy and highlight for better feedback
function dragOverEditorHandler(evt) {
	console.log(" Set dropeffect to -COPY- ")
    evt.dataTransfer.dropEffect = "copy";
    evt.stopPropagation();
    evt.preventDefault();

 
    return false;
}




function loadEditor() 
{
// each member of the LLCanvas gets an on drag enter handler 
var editormembers = document.querySelectorAll("#LLCanvas td");
	[].forEach.call(editormembers, function(editormember) {
	       editormember.addEventListener("dragenter", dragEnterHandler, false);
	       editormember.addEventListener("dragover", dragOverEditorHandler, false);
	       // editormember.addEventListener("dragleave", dragLeaveHandler, false);
	       // editormember.addEventListener("drop", DropHandler, false);
	   });


// each member of the element Icons gets an on drag handler
var Iconmembers = document.querySelectorAll("#Icons li");
       [].forEach.call(Iconmembers, function(Iconmember) {
           Iconmember.addEventListener("dragstart", dragStartHandler, false);
           // member.addEventListener("dragend", dragEndHandler, false); -- Still to be created
       });
}




/* ****** Functions for testing only ****** */

// Function to test script functionality triggered by Build Button - modify to suite
function test_Script1()
{
	// create an Array to represent the editor grid 
	editorArray = matrix(maxRow, maxCol, false);
	
	// Poplulate it with basic empty ladder logic element objects
	for(var x = minRow; x <= maxRow; x++)
	{
		for(var y = minCol; y <= maxCol; y++)
		{
			editorArray[x][y] = new logicElement(x, y, "None", " ");
		}
	}
	
	// // update a single row of the array	
	// setRow(2);
	// updateRow(2);
	// // 
	set_Editor_Tile(2,3,"Horz");
}

// Function to test script functionality triggered by Update - modify to suite
function test_Script2()
{
	
	// editorArray[2][1].sensor_Status = !editorArray[2][1].sensor_Status
	// updateRow(2)
	// editorArray[1][2] = new logicElement(1, 2, "Horz", "Start Button");
	// updateRow(1)
	set_Editor_Tile(2,3,"NC");

}

// update elements as required
function setRow(rowNumber)
{
 
	for(var i=1; i <= maxCol; i++)
	{
		editorArray[rowNumber][i].input_Status = true;
		editorArray[rowNumber][i].logic_Type = "Horz";
	}
	
	// update first column as None
	editorArray[rowNumber][1].input_Status = false;
	editorArray[rowNumber][1].logic_Type = "NO";
	
	
	// update last column as  coil
	editorArray[rowNumber][10].input_Status = false;
	editorArray[rowNumber][10].logic_Type = "Coil";
	
}

// update elements as required
function updateALL()
{
 	for(var r = minRow; r <= maxRow; r++)
 	{
		for(var c = minCol; c <= maxCol; c++)
		{
			editorArray[r][c].update_Status();
		}
	}
}
