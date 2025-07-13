import { uploadToIPFS } from './ipfs.js';
import { sendToSui } from './sui.js';

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];
  const title = document.getElementById('title').value;

  if (!file || !title) {
    alert("Please select a file and enter a title.");
    return;
  }

  document.getElementById('status').innerText = "Uploading to IPFS...";

  const cid = await uploadToIPFS(file);

  document.getElementById('status').innerText = `Stored on IPFS: ${cid}`;

  document.getElementById('status').innerText += "\nSending metadata to Sui...";

  const txResult = await sendToSui(title, cid);

  document.getElementById('status').innerText += `\nTransaction sent! ${txResult}`;
});
