import { NextResponse } from "next/server";

import { pipeline } from "@xenova/transformers";
import { WaveFile } from "wavefile";
import PipelineSingleton from "../pipeline";

export async function GET(request: Request) {
  let startDownload = performance.now();
  // Load audio data
  let url =
    "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav";
  let buffer = Buffer.from(await fetch(url).then((x) => x.arrayBuffer()));
  console.log("url", url);
  let endDownload = performance.now();
  console.log(
    `File download Execution duration: ${
      (endDownload - startDownload) / 1000
    } seconds`
  );

  // Read .wav file and convert it to required format
  let wav = new WaveFile(buffer);

  let startWav = performance.now();
  wav.toBitDepth("32f"); // Pipeline expects input as a Float32Array
  wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);

      // Merge channels (into first channel to save memory)
      for (let i = 0; i < audioData[0].length; ++i) {
        audioData[0][i] =
          (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
      }
    }

    // Select first channel
    audioData = audioData[0];
  }
  let endWav = performance.now();
  console.log(
    `Wav file Execution duration: ${(endWav - startWav) / 1000} seconds`
  );

  let start = performance.now();
  const transcriber = await PipelineSingleton.getInstance();
  const output = await transcriber(audioData);
  let end = performance.now();
  console.log(`Execution duration: ${(end - start) / 1000} seconds`);
  console.log(output);

  return NextResponse.json({ data: output });
}
