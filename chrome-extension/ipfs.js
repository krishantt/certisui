const API_KEY = 'your_web3_storage_api_key';

export async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`
    },
    body: file
  });

  const data = await res.json();
  return data.cid;
}
