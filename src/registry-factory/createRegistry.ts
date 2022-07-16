import { Registry } from './types'

export default function createRegistry<T>() {
	const registry: Registry<T> = {}

	const add = (key: string, registration: T) => {
		// Always use lower case (from a framework point of view) -- to minimize issues
		key = key.toLowerCase()

		if (registry.hasOwnProperty(key)) {
			// eslint-disable-next-line no-console
			console.warn(`A registration for key ${key} has already been registered.`)
		}
		registry[key] = registration
	}

	const get = (key: string) => {
		// Always use lower case (from a framework point of view) -- to minimize issues
		key = key.toLowerCase()

		return registry[key] || undefined
	}

	const keys = () => Object.keys(registry)

	const all = () => Object.values(registry)

	const clear = () => deleteProperties(registry)

	const remove = (key: string) => {
		// Always use lower case (from a framework point of view) -- to minimize issues
		key = key.toLowerCase()

		delete registry[key]
	}

	return { add, get, all, keys, clear, remove }
}

const deleteProperties = (objectToClean: { [x: string]: any }) => {
	for (const x in objectToClean) {
		if (objectToClean.hasOwnProperty(x)) {
			delete objectToClean[x]
		}
	}
}
