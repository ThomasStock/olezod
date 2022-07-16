import { useEffect, useRef, useState } from 'react'
import useSize from './useSize'

// https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
// https://codepen.io/matt-west/pen/naXPjb
// https://www.sitepoint.com/building-3d-engine-javascript/

const map = { width: 800, height: 900 }

type Vertex3D = { x: number; y: number; z: number }
type Face = Vertex3D[]
const createVertex = (x: number, y: number, z = 0) => ({ x, y, z })

const fieldFace: Face = [
	{ x: 0, y: 0, z: 0 },
	{ x: 400, y: 0, z: 0 },
	{ x: 400, y: 500, z: 0 },
	{ x: 0, y: 500, z: 0 },
]

const positionVertex = (startingPoint: Vertex3D, vertex: Vertex3D): Vertex3D => ({
	x: vertex.x + startingPoint.x,
	y: vertex.y + startingPoint.y,
	z: vertex.z + startingPoint.z,
})

const positionFace = (startingPoint: Vertex3D, face: Face): Face =>
	face.map((vertex) => positionVertex(startingPoint, vertex))

const App = () => {
	const boxRef = useRef<HTMLDivElement>(null)
	const box = useSize(boxRef.current)

	const canvasRef = useRef<HTMLCanvasElement>(null)

	const [context, setContext] = useState<CanvasRenderingContext2D>()

	// The canvasScale represents how much % bigger the <canvas> is in px compared to the map
	// (They have the same aspect ratio)
	const [canvasScale, setCanvasScale] = useState<number>(1)

	useEffect(() => {
		const canvasContext = canvasRef.current!.getContext('2d')
		if (canvasContext) {
			setContext(canvasContext)
		}
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas && box) {
			// Aspect ratio of our map (const map = { width: 800, height: 900 })
			const mapAspectRatio = map.width / map.height

			// Aspect ratio of the viewport (box fills viewport via css)
			const boxAspectRatio = box.width / box.height

			// Resize the canvas so that it has the same aspect ratio as our map.
			// Canvas is centered with css so there is some 'leftover' either left/right or bottom.top
			//  while we make it as big as possible.
			if (mapAspectRatio > boxAspectRatio) {
				canvas.width = box.width
				canvas.height = box.width / mapAspectRatio
			} else {
				canvas.height = box.height
				canvas.width = box.height * mapAspectRatio
			}

			// Now we know the <canvas> is for example 2000*1000 and our map could be 100*50 so scale is '20'.
			// Which means when we draw a dot on the center of the map at (50,25),
			//  we should actually draw it at x20 these coordinates so at (1000,500) to draw in the center of the <canvas>
			setCanvasScale(canvas.width / map.width)
		}
	}, [box, context])

	const draw = () => {
		if (context && canvasRef.current) {
			// Clear canvas
			context.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

			// Get the width and height of the field in pixels (coordinate)
			const fieldX = fieldFace.reduce((maxX, vertex) => Math.max(maxX, vertex.x), 0)
			const fieldY = fieldFace.reduce((maxY, vertex) => Math.max(maxY, vertex.y), 0)

			// Calculate the (0,0) starting point for the field to makie sure the field is centered on the map.
			const fieldStartingPoint = { x: (map.width - fieldX) / 2, y: (map.height - fieldY) / 2, z: 0 }

			// Get the map-coords of the field now that we know where to put it.
			const positionedFieldFace = positionFace(fieldStartingPoint, fieldFace)

			drawFace(context, positionedFieldFace, canvasScale)
		}
	}

	draw()

	return (
		<>
			<div ref={boxRef} className="w-screen h-screen bg-yellow-300">
				<canvas ref={canvasRef} className="m-auto absolute inset-0 bg-blue-600"></canvas>
			</div>
			<div className="text-3xl font-bold underline text-red-600">hello world</div>
		</>
	)
}

const drawFace = (context: CanvasRenderingContext2D, unscaledFace: Face, scale = 1) => {
	const scaleSet = <T extends number[]>(...args: T): T => args.map((arg) => arg * scale) as T

	const face = unscaledFace.map((vertex) => createVertex(...scaleSet(vertex.x, vertex.y, vertex.z)))

	let path = new Path2D()
	path.moveTo(face[0].x, face[0].y)

	const faceReversed = [...face].reverse()
	// Draw from first point to last point and then all the way back to the first point
	faceReversed.forEach((vertex) => {
		path.lineTo(vertex.x, vertex.y)
	})

	context.stroke(path)
}

export default App
