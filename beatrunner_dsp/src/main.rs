use lazy_static::lazy_static;
use rustfft::num_traits::FromPrimitive;
use rustfft::{num_complex::Complex, FftPlanner};
use std::path::PathBuf;

lazy_static! {
    static ref RES_DIR: PathBuf = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("res");
}

fn main() {
    let data = std::fs::read(RES_DIR.join("soundtrack.mp3")).expect("Could not open file");
    let (header, samples) = puremp3::read_mp3(data.as_slice()).expect("Invalid MP3");

    // extract mp3 sample rate from header
    let sample_rate = header.sample_rate.hz() as usize;

    // combine left and right channels
    let mut mono_samples: Vec<Complex<f32>> = samples
        .map(|(left, right)| left / 2.0 + right / 2.0)
        .map(|sample| Complex::from_f32(sample).expect("Couldn't convert to complex"))
        .collect();

    // Perform a forward FFT of size 1234
    let mut planner = FftPlanner::new();
    let fft = planner.plan_fft_forward(sample_rate);

    fft.process(mono_samples.as_mut_slice());

    println!("{:#?}", mono_samples);
}

// Read mp3
// -- Read into array(?)
// -- Array size: sample rate * song length in secs

// Frequency analysis
// -- FFT over whole(?) mp3 to find frequency content

// input: array of samples over time, each spaced by f_s
// result: array of samples corresponding to multiples of f_c [f_s, 2f_s, 3f_s, ... ] (i think)

// -- ALT: Break into amplitude level sections
// -- Analyze each section separately. This will probably give us better "levels" overall

// BeatDetection
// -- LPF array
// -- Bin samples (bin size? TBD)
// -- For each bin, only keep the maximum sample as 1, replace all others with 0
// -- Find distance between peaks in each bin over entire array
// -- Assume most common distance is a factor of the BPM (or the BPM itself)
