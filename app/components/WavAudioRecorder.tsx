import { useEffect, useRef, useState } from "react";
import MediaStreamRecorder from "msr";

const mediaConstraints = {
  audio: true,
};

type AudioBlobData = {
  blob: Blob;
  blobURL: string;
};

type RecordingStatus = "recording" | "inactive";

const WavAudioRecorder = () => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>("inactive");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Array<AudioBlobData> | null>(
    []
  );
  const [result, setResult] = useState<string | null>(null);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };
  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const handleTranscribe = async (audioBlobData: AudioBlobData) => {
    if (!audioBlobData?.blob) {
      console.error("No audio chunks found.");
      return;
    }

    const audioToSend = audioBlobData.blob;

    const data = new FormData();
    data.set("file", audioToSend);

    const res = await fetch("/api/audio", {
      method: "POST",
      body: data,
    });

    if (!res.ok) throw new Error(await res.text());
    const {
      data: { text },
    } = await res.json();

    setResult((currentText) => (currentText ? `${currentText} ${text}` : text));
  };

  const clearText = () => {
    setResult(null);
    setAudioChunks(null);
  };

  const startRecording = async () => {
    clearText();
    setRecordingStatus("recording");
    // MSR Code
    const media = new MediaStreamRecorder(stream);
    media.mimeType = "audio/wav";
    mediaRecorder.current = media;
    mediaRecorder.current.ondataavailable = function (blob: Blob) {
      const blobURL = URL.createObjectURL(blob);
      const audioBlobData = {
        blob,
        blobURL,
      };
      setAudioChunks((curr) => [...(curr || []), audioBlobData]);

      handleTranscribe(audioBlobData);
    };
    mediaRecorder.current.start(5000);
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main className="flex flex-col">
        <div className="audio-controls">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
        </div>
        {audioChunks ? (
          <div className="audio-container">
            {audioChunks.map((audioBlobData, index) => {
              return (
                <audio
                  key={`audioURL-${index}`}
                  src={audioBlobData.blobURL}
                  controls
                ></audio>
              );
            })}
          </div>
        ) : null}
        <button onClick={handleTranscribe}>Send for transcribing...</button>
        {result !== null && (
          <p className="bg-gray-100 p-2 rounded text-black">{result}</p>
        )}
      </main>
    </div>
  );
};

export default WavAudioRecorder;
