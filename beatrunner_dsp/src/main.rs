use lazy_static::lazy_static;
use rustfft::num_traits::FromPrimitive;
use rustfft::{num_complex::Complex, FftPlanner};
use simplemad::Decoder;
use std::{fs::File, path::PathBuf, time::Duration};

lazy_static! {
    static ref RES_DIR: PathBuf = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("res");
}

fn main() {
    let data = std::fs::read(RES_DIR.join("Kalimba.mp3")).expect("Could not open file");
    //let data = std::fs::read(RES_DIR.join("soundtrack.mp3")).expect("Could not open file");
    //println!("{:#?}", RES_DIR.join("soundtrack.mp3"));
    //let (header, samples) = puremp3::read_mp3(data.as_slice()).expect("Invalid MP3");

    //simplemad
    let file = File::open(RES_DIR.join("Kalimba.mp3")).unwrap();
    let file2 = File::open(RES_DIR.join("Kalimba.mp3")).unwrap();
    let decoder = Decoder::decode(file).unwrap();
    let headers = Decoder::decode_headers(file2).unwrap();

    let mut samples: Vec<i32> = vec![];

    let duration = headers
        .filter_map(|r| match r {
            Ok(f) => Some(f.duration),
            Err(_) => None,
        })
        .fold(Duration::new(0, 0), |acc, dtn| acc + dtn);

    println!("Song duration: {:#?}", duration);

    for decoding_result in decoder {
        match decoding_result {
            Err(e) => println!("Error: {:?}", e),
            Ok(frame) => {
                samples.push(frame.samples[0][0].to_raw() / 2 + frame.samples[1][0].to_raw() / 2);
                // println!("Frame sample rate: {}", frame.sample_rate);
                // println!(
                //     "First audio sample (left channel): {:?}",
                //     frame.samples[0][0]
                // );
                // println!(
                //     "First audio sample (right channel): {:?}",
                //     frame.samples[1][0]
                // );
            }
        }
    }

    let min_val = samples.iter().min();
    let max_val = samples.iter().max();

    println!(
        "Read {:#?} samples from mp3, with range [{:#?},{:#?}]",
        samples.len(),
        min_val,
        max_val,
    );

    /*
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
     */
}

// Read mp3
// -- Read into array(?)
// -- Array size: sample rate * song length in secs
// -- Naivest approach: read entire song during preprocessing (but apply hard limit to time ~5mins?)
// --                   This may take too long / too much memory, but we can worry about that later.

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
