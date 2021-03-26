const NTAB				= 32;
const IA 				= 16807;
const IM 				= 2147483647;
const IQ 				= 127773;
const IR 				= 2836;
const NDIV 				= 1 + ((IM - 1) / NTAB);
const MAX_RANDOM_RANGE 	= 0x7FFFFFFF;
const AM				= 1.0 / IM;
const EPS				= 1.2e-7;
const RNMX				= 1.0 - EPS;

class SourceRNG {
	constructor() {
		this.seed = null;
	}

	setSeed(seed) {
		this.seed = seed;
	}

	// Store mIdum, mIy, and mIv in class instance
	// As they're reused in the next generateRandomNumber(...) call
	getParameters() {
		if (this.seed === null) {
			throw new Error('Seed is not defined, set by calling setSeed(...)');
		}

		if (
			this.mIdum !== undefined
			&& this.mIy !== undefined
			&& this.mIv !== undefined
		) {
			// Return parameters set by previous call of generateRandomNumber(...)
			return { mIdum: this.mIdum, mIy: this.mIy, mIv: this.mIv };
		}

		// Set default parameters
		const parameters = {};
		parameters.mIdum = this.seed;

		if (this.seed >= 0) {
			parameters.mIdum = -this.seed;
		}

		parameters.mIy = 0;
		parameters.mIv = [];

		return parameters;
	}

	setParameters({ mIdum, mIy, mIv }) {
		this.mIdum = mIdum;
		this.mIy = mIy;
		this.mIv = mIv;
	}

	generateRandomNumber() {
		// Both j and k are integers in Step's UniformRandom module
		// Ensure that these doesn't hold float values
		let j;
		let k;
		const parameters = this.getParameters();
		let { mIdum, mIy } = parameters;
		const { mIv } = parameters;

		if (mIdum <= 0 || mIy === 0) {
			// It's meant to check if the original value is greater than 1
			if (-mIdum < 1) {
				mIdum = 1;
			} else {
				mIdum = -mIdum;
			}

			for (j = (NTAB + 7); j >= 0; j -= 1) {
				// Don't ask me why this works
				// But before wrapping mIdum / IQ with Math.floor(...) I had
				// problems with floating points. For example, the k in the loop's
				// first iteration would become 0.000......12345 instead of 0
				// I guess it also has to do with multiplications with k and IQ and IR
				// Maybe k held too much data about the fractional part of the number
				// which then caused issues when multiplying and storing a bigger integer value
				k = Math.floor(mIdum / IQ);
				mIdum = IA * (mIdum - (k * IQ)) - (IR * k);
				if (mIdum < 0) {
					mIdum += IM;
				}
				if (j < NTAB) {
					mIv[j] = mIdum;
				}
			}

			// Destructing for first element in mIv
			const [firstElement] = mIv;
			mIy = firstElement;
		}

		k = Math.floor(mIdum / IQ);
		mIdum = (IA * (mIdum - k * IQ)) - (IR * k);
		if (mIdum < 0) {
			mIdum += IM;
		}

		j = Math.floor(mIy / NDIV);

		mIy = mIv[j];
		mIv[j] = mIdum;

		// Update parameters for next generateRandomNumber(...) call
		this.setParameters({ mIdum, mIy, mIv });

		return mIy;
	}

	randomFloat(flLow, flHigh) {
		// Math.fround(...) returns the number's 32 bit float representation
		// Which makes the result align closer to Step's module
		let fl = AM * Math.fround(this.generateRandomNumber());
		if (fl > RNMX) {
			fl = RNMX;
		}

		return (fl * (flHigh - flLow)) + flLow;		// float in [low,high)
	}

	randomFloatExp(flMinVal, flMaxVal, flExponent) {
		// float in [0,1)
		// float32(this.generateRandomNumber())
		let fl = AM * Math.fround(this.generateRandomNumber());
		if (fl > RNMX) {
			fl = RNMX;
		}

		if (flExponent !== 1.0) {
			// float32(math.Pow(float64(fl), float64(flExponent)))
			// float64 casts can be ignored as it's how JavaScript stores numbers as default
			fl = Math.fround(Math.Pow(fl, flExponent));
		}

		return (fl * (flMaxVal - flMinVal)) + flMinVal;		// float in [low,high)
	}

	randomInt(iLow, iHigh) {
		const x = (iHigh - iLow) + 1;

		if (x <= 1 || MAX_RANDOM_RANGE < x - 1) {
			return iLow;
		}

		// From Source Engine 2007:
		// The following maps a uniform distribution on the interval [0,MAX_RANDOM_RANGE]
		// to a smaller, client-specified range of [0,x-1] in a way that doesn't bias
		// the uniform distribution unfavorably. Even for a worst case x, the loop is
		// guaranteed to be taken no more than half the time, so for that worst case x,
		// the average number of times through the loop is 2. For cases where x is
		// much smaller than MAX_RANDOM_RANGE, the average number of times through the
		// loop is very close to 1.
		const maxAcceptable = MAX_RANDOM_RANGE - ((MAX_RANDOM_RANGE + 1) % x);

		let n;

		do {
			n = this.generateRandomNumber();
		} while (n > maxAcceptable);

		return iLow + (n % x);
	}
}

module.exports = SourceRNG;
