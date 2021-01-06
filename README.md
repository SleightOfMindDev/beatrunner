# beatrunner

To start game for dev:

```bash
npm install #this gets your dependencies
npm run dev #this starts up the project in a hot-reloading dev server
#connect to localhost:8080
```

## DSP Stuff
**Read mp3**
- [ ] Read into array(?)
- [ ] Array size: sample rate * song length in secs

**Frequency analysis**
- [ ] FFT over whole(?) mp3 to find frequency content
- input: array of samples over time, each spaced by f_s
- result: array of samples corresponding to multiples of f_c [f_s, 2f_s, 3f_s, ... ] (i think)
- [ ] ALT: Break into amplitude level sections
- [ ] Analyze each section separately. This will probably give us better "levels" overall

**BeatDetection**
- [ ] LPF array
- [ ] Bin samples (bin size? TBD)
- [ ] For each bin, only keep the maximum sample as 1, replace all others with 0
- [ ] Find distance between peaks in each bin over entire array
- [ ] Assume most common distance is a factor of the BPM (or the BPM itself)
