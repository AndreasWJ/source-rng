# Uniform RNG based on Valve's Source Engine SDK
JavaScript version of [@Step7750](https://github.com/Step7750)'s UniformRandom module. All credit goes to [@Step7750](https://github.com/Step7750) and [his original module](https://github.com/Step7750/UniformRandom).

## Installation
```
npm install source-rng --save
```

## Using
```
const SourceRNG = require('source-rng');
const rng = new SourceRNG();

rng.setSeed(72);

rng.randomFloat(0, 1);    // 0.5430998
rng.randomFloat(0, 1);    // 0.40631828
rng.randomFloat(0, 100);  // 62.147213
rng.randomFloat(0, 1);    // 0.058990162
```
