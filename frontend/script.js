document.addEventListener("DOMContentLoaded", () => {
  const downloadForm = document.getElementById("download-form");
  const videoUrlInput = document.getElementById("video-url");
  const resultDiv = document.getElementById("result");

  downloadForm.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    const videoUrl = videoUrlInput.value.trim();
    if (!videoUrl) {
      alert("Please enter a YouTube video URL");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const result = await response.json();
      console.log("Download response:", result);

      const downloadLink = document.createElement("a");
      downloadLink.href = result.downloadUrl;
      downloadLink.textContent = "Download Video";
      downloadLink.setAttribute("download", "");
      downloadLink.style.display = "none"; 
      document.body.appendChild(downloadLink);
      downloadLink.click(); 
      document.body.removeChild(downloadLink); 

      alert("Video download started");
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download video. Please try again.");
    }
  });
});
