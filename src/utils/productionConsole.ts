if (!__DEV__) {
	const noop = () => undefined;

	console.log = noop;
	console.info = noop;
	console.warn = noop;
	console.error = noop;
	console.debug = noop;
}

export {};
