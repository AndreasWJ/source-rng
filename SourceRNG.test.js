const SourceRNG = require('./SourceRNG');

const prettyPrintArray = (array, indices) => {
	return indices
		.map((arrayIndex) => {
			return array[arrayIndex];
		})
		.join('\n');
};

const numbersAsString = (array, decimals) => {
	return array.map((n) => n.toFixed(decimals));
};

// Write an array version of expect(...).toBeCloseTo(...)
expect.extend({
	/**
	 * @param {number[]} received
	 * @param {number[]} expected
	 * @param {number} decimals
	 * @returns true if all numbers in received and expected iterating from an index >= 0
	 * is close to one another depending on the decimal parameter.
	 */
	toBeCloseToArray(received, expected, decimals) {
		const checks = received.map((r, i) => {
			const e = expected[i];
			// Returns true if the difference between the received and expected value
			// is smaller than 1 / (10^decimals)
			// For example:
			// decimal = 1; 1 / 10^1 = 0.1
			// decimal = 2; 1 / 10^2 = 0.01
			// Move the decimal point (decimal) steps forward
			return Math.abs(r - e) <= (10 ** -decimals);
		});
		const failedChecks = checks.reduce((acc, curr, i) => {
			if (curr === false) {
				return [...acc, i];
			}

			return acc;
		}, []);

		const pass = (failedChecks.length === 0);

		if (pass) {
			return {
				message: () => `the arrays are equal, their numbers are close: ${received} & ${expected}`,
				pass: true,
			};
		}
		return {
			message: () => 'expected\n'
			+ ` ${prettyPrintArray(numbersAsString(received, decimals), failedChecks)}\n`
			+ ' to be closer to \n'
			+ ` ${prettyPrintArray(expected, failedChecks)}`,
			pass: false,
		};
	},
});

test('generates floats correctly given rng seed', () => {
	const rng = new SourceRNG();
	const expected = [
		0.5430998,
		0.40631828,
		62.147213,
		0.058990162,
	];

	rng.setSeed(72);
	const results = [
		rng.randomFloat(0, 1),
		rng.randomFloat(0, 1),
		rng.randomFloat(0, 100),
		rng.randomFloat(0, 1),
	];

	expect(results).toBeCloseToArray(expected, 6);
});

test('generates integers correctly given rng seed', () => {
	const rng = new SourceRNG();
	const expected = [
		6,
		9,
		95,
		8,
	];

	rng.setSeed(555);
	const results = [
		rng.randomInt(0, 10),
		rng.randomInt(0, 10),
		rng.randomInt(0, 100),
		rng.randomInt(0, 10),
	];

	expect(results).toEqual(expected);
});
