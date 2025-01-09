    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const downloadButton = document.getElementById('download');
    const previewVideo = document.getElementById('preview');

    let mediaRecorder;
    let recordedChunks = [];
    let recordingURL = null;

    startButton.addEventListener('click', async () => {
      try {
        // Capture screen with system audio
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });

        // Capture microphone audio
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // Combine screen and microphone audio into a single MediaStream
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(), // Add video tracks from the screen
          ...screenStream.getAudioTracks(), // Add system audio
          ...micStream.getAudioTracks(), // Add microphone audio
        ]);

        // Clear the preview content while recording
        previewVideo.srcObject = null;
        previewVideo.poster = "https://via.placeholder.com/640x360?text=Recording..."; // Placeholder during recording

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(combinedStream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          // Stop video stream tracks
          const tracks = combinedStream.getTracks();
          tracks.forEach((track) => track.stop());

          // Create a blob for the recorded video
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          recordingURL = URL.createObjectURL(blob);

          // Update the preview video with the recorded video
          previewVideo.srcObject = null; // Clear any stream reference
          previewVideo.src = recordingURL;
          previewVideo.poster = ""; // Remove the placeholder
          previewVideo.controls = true;
          previewVideo.play();

          // Enable download button
          downloadButton.href = recordingURL;
          downloadButton.style.pointerEvents = 'auto';
          downloadButton.style.opacity = '1';
          downloadButton.download = 'recording.webm';
        };

        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to start screen recording. Please check your permissions.');
      }
    });

    stopButton.addEventListener('click', () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    });

