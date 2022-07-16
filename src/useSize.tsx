import useResizeObserver from '@react-hook/resize-observer'
import { useLayoutEffect, useState } from 'react'

const useSize = (target: HTMLElement | null) => {
	const [size, setSize] = useState<DOMRectReadOnly>()

	useLayoutEffect(() => {
		target && setSize(target.getBoundingClientRect())
	}, [target])

	// Where the magic happens
	useResizeObserver(target, (entry) => setSize(entry.contentRect))
	return size
}

export default useSize
