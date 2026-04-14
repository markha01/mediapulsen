const Minio = require('minio');

const BUCKET = 'mediapulsen';

let minioClient = null;

function getMinioClient() {
  if (!minioClient) {
    const endpoint = process.env.MINIO_ENDPOINT;
    if (!endpoint) return null;

    minioClient = new Minio.Client({
      endPoint:  endpoint,
      port:      443,
      useSSL:    true,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }
  return minioClient;
}

async function ensureBucket() {
  const mc = getMinioClient();
  if (!mc) return;
  const exists = await mc.bucketExists(BUCKET);
  if (!exists) await mc.makeBucket(BUCKET);
}

async function uploadCsv(datasetId, filename, buffer) {
  const mc = getMinioClient();
  if (!mc) return null;
  await ensureBucket();
  const key = `uploads/${datasetId}/${Date.now()}-${filename}`;
  await mc.putObject(BUCKET, key, buffer, buffer.length, { 'Content-Type': 'text/csv' });
  return key;
}

async function storeReport(datasetId, insightId, reportJson) {
  const mc = getMinioClient();
  if (!mc) return null;
  await ensureBucket();
  const key = `reports/${datasetId}/${insightId}.json`;
  const body = Buffer.from(JSON.stringify(reportJson, null, 2));
  await mc.putObject(BUCKET, key, body, body.length, { 'Content-Type': 'application/json' });
  return key;
}

module.exports = { uploadCsv, storeReport };
