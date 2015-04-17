var canvas;
var gl;
var program; 

var NumVertices  = 36;
var NumLinePoints = 17; 
var NumCrosshairPoints = 6;


var points = [];
var linePoints = [];

var colors = [];
var colorIndex; 

var aspectRatio = 960/540;
var delay = 100;

// Initializing matrices: they're updated in multiple functions, so they're global. 
var cameraMatrix = mat4(); 

var mvMatrixLoc;
var mvMatrix = translate(0,0,-50);			// The camera must be translated +50 units to be able to see all the cubes around the origin

var pMatrixLoc;
var pMatrix = mat4(); 

//Constants for the extra credit continuous rotate/scale 
var thetaLoc;
var theta = 0; 

var scaleLoc;
var scale = 1; 
var scaleswitch = 0; 

//Variables edited by user input
var usercolor = 0;		// Incrementing this circularly shifts the colorList array-- see the for loop in the render function. 
var userfovy = 50; 		// This sets the fovy for the N and W commands. 
var toggle = 1; 		// As seen in the switch statement, this must be a true/false value, for toggling the crosshair. 

	var colorList = [
        [ 0.3, 0.0, 0.4, 1.0 ],  // violet
        [ 0.6, 0.4, 0.0, 1.0 ],  // red
        [ 0.9, 0.7, 0.0, 1.0 ],  // goldenrod
        [ 0.0, 0.5, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.5, 0.1, 0.3, 1.0 ],  // burgundy 
        [ 0.0, 0.5, 0.5, 1.0 ]   // cyan
    ];
	   
    var vertices = [					// Vertices for making each cube and its outline
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
	];
	
	var transMatrices = [translate(-10, -10, -10), translate(-10, -10, 10), 	//A translation matrix for the each of the 8 cubes
						translate(-10,10,-10), translate(-10, 10, 10),
						translate(10, -10, -10), translate(10, -10, 10),
						translate(10, 10, -10), translate(10, 10, 10)
						];

	var crosshairPoints = [  vec3( -10.0, 0.0,  0.0 ),			// Points for drawing the lines that make up the crosshair
        vec3( 10.0, 0.0, 0.0),
        vec3( 0.0, -10.0, 0.0),
		vec3( 0.0, 10.0, 0.0),
		vec3( 0.0, 0.0, -10.0),
		vec3( 0.0, 0.0, 10.0)
	];

function faceCube()					//creates the six faces of the cube by passing triangleFace the appropriate vertices for two triangles
{
    triangleFace( 1, 0, 3, 2 );
    triangleFace( 2, 3, 7, 6 );
    triangleFace( 3, 0, 4, 7 );
    triangleFace( 6, 5, 1, 2 );
    triangleFace( 4, 5, 6, 7 );
    triangleFace( 5, 4, 0, 1 );

}

function triangleFace(a, b, c, d) 		// makes your cube out of triangles
{
    // create two triangles from the four indices given us by faceCube	
    var indices = [ a, b, c, a, c, d ];		// for use with triangles, not triangle_strip. 

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
    }
	
}

function outlineCube()
{
	var indices = [0,1,2,3,0,4,7,6,2,1,5,4,7,3,2,6,5];			//Making an outline for each edge of the cube
	for ( var i = 0; i < indices.length; ++i ) {
        linePoints.push( vertices[indices[i]] );
    }
}

	

function drawOutline()		// draws white outline
{
	var thisColorLoc = gl.getUniformLocation( program, "thisColor" );		// Set the outline color to white-- this setting will be left on for drawCrosshair too. 
	thisColor = [1.0, 1.0, 1.0, 1.0];
	gl.uniform4fv(thisColorLoc, thisColor);
	
	// need a different buffer from cube and crosshair
	var linePointsBuffer = gl.createBuffer();										
    gl.bindBuffer(gl.ARRAY_BUFFER, linePointsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(linePoints), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	gl.drawArrays(gl.LINE_STRIP, 0, NumLinePoints);
}


function drawCube(indexColorF, mvMatrixF)			// mvMatrixF is actually one of the 8 transMatrices defined globally above. 
{
	mvMatrixLoc = gl.getUniformLocation(program, "mvMatrix"); // set translation from input
	gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mult(mvMatrix,mvMatrixF)));			// multiplying the mvMatrix with the translation for each cube, but NOT editing mvMatrix globally. 
	
	var thisColorLoc = gl.getUniformLocation( program, "thisColor" ); 			//setting the fragment shader's current setting to an index of colorList
	thisColor = colorList[indexColorF];												
	gl.uniform4fv(thisColorLoc, thisColor);
	
	// need a different buffer from the outline and crosshair 
	var vBuffer = gl.createBuffer();			
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW ); 

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
	drawOutline();									// lastly, draw the white outline for each cube with the current mvMatrix setting!
}
	
	
function drawCrosshair() 
{
	mvMatrixLoc = gl.getUniformLocation(program, "mvMatrix"); 							// set translation from input
	gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mat4())); 
	
	cameraMatrixLoc = gl.getUniformLocation(program, "cameraMatrix");
	gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(mat4()));
	
	// It's necessary to make the crosshair orthogonal-- must take off the perspective settings.
	pMatrixLoc = gl.getUniformLocation(program, "pMatrix");				 
	gl.uniformMatrix4fv(pMatrixLoc, false, flatten(mat4()));
	
	// need a new buffer separate from cube
	var crosshairPointsBuffer = gl.createBuffer();				
    gl.bindBuffer(gl.ARRAY_BUFFER, crosshairPointsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(crosshairPoints), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	gl.drawArrays(gl.LINES, 0, NumCrosshairPoints);
};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
		
	// Setting up the vertices for the cube and its outline
    faceCube();				 
	outlineCube();
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders 
    program = initShaders( gl, "vShader", "fShader" );
    gl.useProgram( program ); 

		
	window.onkeydown = function(event) {
        var key = event.keyCode;
	
        switch(key) {
			case 67:
				++usercolor;										// Incrementing this circularly shifts the colorList array-- see the for loop in the render function. 
				break;
			case  82:
				cameraMatrix = mat4(); 
				userfovy = 50; 
				break; 
			case 73:
				cameraMatrix = mult(translate(0,0,.25), cameraMatrix); 			// cameraMatrix must be multiplied before translate because we want to move the camera back
				break; 															// this amount, AFTER any rotation. 
			case 77:
				cameraMatrix = mult(translate(0,0,-.25), cameraMatrix); 
				break; 
			case 75:
				cameraMatrix = mult(translate(-.25,0,0), cameraMatrix); 
				break; 
			case 74:
				cameraMatrix = mult(translate(.25,0,0), cameraMatrix); 
				break; 	
			 case 40: 
				cameraMatrix = mult(cameraMatrix, translate(0,.25,0)); 			// For translating on the y-axis, the order doesn't matter because any rotations are about y. 
				break;
			case 38: 
				cameraMatrix = mult(cameraMatrix, translate(0,-.25,0)); 
				break;  				
			case 78:
				userfovy = --userfovy; 
				break; 
			case 87:
				userfovy = ++userfovy; 
				break; 
			case 37: 
				cameraMatrix = mult(cameraMatrix, rotate(-1, [0,1,0]));			// rotation must be multiplied first, because of any translations in cameraMatrix. 
				break; 
			case 39: 
				cameraMatrix = mult(cameraMatrix, rotate(1, [0,1,0]));
				break; 
			case 187: 
				toggle = !toggle; 
				break; 
        }
		
    };
	
	thetaLoc = gl.getUniformLocation(program, "theta"); 
	scaleLoc = gl.getUniformLocation(program, "scale");
	
    render();
		
}

function render()
{

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//Updating theta for smooth rotation
	theta += .2;
    gl.uniform1f(thetaLoc, theta);
	
	//Scrolling through scale between 4 and .5
	if (scale > 4 || scale < .5) {
	scaleswitch = !scaleswitch; };
	if ( scaleswitch == 1) {
		scale += .1; }	else {
		scale -= .1; 
		}
	gl.uniform1f(scaleLoc, scale); 
	
	cameraMatrixLoc = gl.getUniformLocation(program, "cameraMatrix");			// Camera and Perspective don't have to be updated per-cube/outline, but for all 
	gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix));			// 8 of the cubes at once (but they do have to be updated within the drawCrosshair function)
	
	pMatrixLoc = gl.getUniformLocation(program, "pMatrix");
	pMatrix = perspective(userfovy, aspectRatio, .2, 100); 
	gl.uniformMatrix4fv(pMatrixLoc, false, flatten(pMatrix));

 
	for ( var i = 0; i < 8; ++i ) {
		drawCube((i+usercolor)%8, transMatrices[i]);				// circularly shifting colorList
	}	
	if (toggle){
		drawCrosshair(); }
		
	setTimeout(
        function (){requestAnimFrame(render);}, delay 				// sets delay of recalling the render function
	);

}
