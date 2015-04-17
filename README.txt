-----------------------------
CS174A Assignment 1
Gabrielle Robertson
SID: 604194100
-----------------------------

My method was to create a buffer for each of the objects that needed drawing per render() call: for each of the cubes, the outlines, and the crosshair. 
For each of these, I decided which uniforms needed to be edited in the shader. 


			objects: 		cube											outline 							crosshair 
shader uniforms: 

	mvMatrix		Clearly, needed to translate						<< see reasoning for cubes				Needed to be updated to keep the crosshair in front of the camera. 
					each of the 8 cubes(with outlines)					(each outline's mvMatrix, pMatrix, 		The crosshair is constant, no matter what, so the mvMatrix needs to be reset to some
					initially; however, for other 						cameraMatrix should clearly be  		constant value. In my code, it is simply set to identity. 
					transformations, all cubes(with 					the same as those of its cube.)
					outlines) are affected at once,
					so the overall translations happen once for 
					each set of cubes, not within the drawCube
					function, which is called 8 times per 
					render call. 
		
	cameraMatrix	This is updated by the user. cameraMatrix			<<										Needed to be set to identity. The translations to move the world around when the
					really does the same thing as mvMatrix, 													user "moves" the camera should not be applied to the crosshair-- we want to keep it
					because we're just translating the world around												in front of the camera. 
					while the user feels like they're moving the 
					camera; however, by this definition of the
					results of the user inputs, I thought cameraMatrix
					should be separate. This is why cameraMatrix
					is multiplied after mvMatrix and before pMatrix.
					Only needs to be updated once for each set of 
					cubes. 
	
	pMatrix			This is also updated by the user, when they're		<< 
					zooming with W or N keys. Updated once per set 		
					of cubes. 											
	
	thisColor		This is updated per cube, so it must be in the 		Color must be white for each outline! 		drawCrosshair is always called after drawOutline, so the color setting 
					drawCube function.									This property of the outline				doesn't have to change-- the crosshair is also white. 
																		does NOT match that of its cube.
																		Color will be set to white once per 
																		drawOutline call, because the previously 
																		set color is that of each cube. 
	