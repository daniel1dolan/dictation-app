"use client";
import WavAudioRecorder from "./components/WavAudioRecorder";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        Wav Dictation App
        <WavAudioRecorder />
      </div>
    </main>
  );
}
