import { NextResponse } from "next/server";
import { WaveFile } from "wavefile";

import PipelineSingleton from "./pipeline";

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Read .wav file and convert it to required format
  let wav = new WaveFile(buffer);
  wav.toBitDepth("32f"); // Pipeline expects input as a Float32Array
  const audioData = wav.getSamples();

  let start = performance.now();
  const transcriber = await PipelineSingleton.getInstance();
  const output = await transcriber(audioData[0]);
  let end = performance.now();
  console.log(`Execution duration: ${(end - start) / 1000} seconds`);
  console.log(output);

  return NextResponse.json({ success: true, data: output });
}
