import { pipeline } from "@xenova/transformers";

type ProgressCallback = (progress: any) => void;

const P = () =>
  class TranscriberPipelineSingleton {
    static task: string = "automatic-speech-recognition";
    static model: string = "Xenova/whisper-tiny.en";
    static instance: any = null;

    static async getInstance(progress_callback?: ProgressCallback) {
      if (this.instance === null) {
        this.instance = pipeline(this.task, this.model, { progress_callback });
      }
      return this.instance;
    }
  };

// Type augmentation for the global object to include the PipelineSingleton property
declare global {
  var TranscriberPipelineSingleton: any;
}

let TranscriberPipelineSingleton: any;

if (process.env.NODE_ENV !== "production") {
  // Use the augmented type
  const g: typeof globalThis & typeof global = global;

  if (!g.TranscriberPipelineSingleton) {
    g.TranscriberPipelineSingleton = P();
  }
  TranscriberPipelineSingleton = g.TranscriberPipelineSingleton;
} else {
  TranscriberPipelineSingleton = P();
}

export default TranscriberPipelineSingleton;
