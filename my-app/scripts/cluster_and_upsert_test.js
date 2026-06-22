const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

async function main() {
  const patientId = '69933b972f32787156279ff5'; // hamza
  // Adjust processed path as found in history
  const processedRel = 'processed\\2005_processed_20260510_132007.png';
  // processed images are saved under backend/processed
  const imgPath = path.join(__dirname, '..', '..', 'backend', 'processed', path.basename(processedRel));
  console.log('Reading image:', imgPath);
  if (!fs.existsSync(imgPath)) {
    console.error('Image not found:', imgPath);
    process.exit(1);
  }
  const buf = fs.readFileSync(imgPath);
  const b64 = buf.toString('base64');
  const dataUrl = `data:image/png;base64,${b64}`;

  // Call cluster API
  console.log('Calling /api/cluster...');
  const clusterRes = await fetch('http://localhost:3001/api/cluster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preprocessed_image_base64: dataUrl, original_image_base64: dataUrl, k: 4, min_region_area_px: 80, morph_kernel: 5, min_anomaly_area_px: 50 }),
  });
  const clusterJson = await clusterRes.json().catch(() => ({}));
  console.log('Cluster response status:', clusterRes.status);
  console.log(JSON.stringify(clusterJson, null, 2));

  if (!clusterRes.ok) {
    console.error('Cluster failed');
    process.exit(1);
  }

  // Upsert history with volumetrics
  console.log('Upserting history...');
  const upsertRes = await fetch(`http://localhost:3001/api/patients/${patientId}/history/upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadedBy: '697105f9a64dd62011a32e2f',
      visitDate: new Date().toISOString().slice(0,10),
      imageCount: 1,
      status: 'completed',
      entries: [{ originalFilename: '2005.png', processedPath: processedRel, processingSteps: [], originalShape: [256,256], processedShape: [256,256], denoiseMethod: 'gaussian' }],
      gm_percent: clusterJson.gm_percent ?? clusterJson.gm_percent,
      wm_percent: clusterJson.wm_percent ?? clusterJson.wm_percent,
      csf_percent: clusterJson.csf_percent ?? clusterJson.csf_percent,
      tumor_detected: clusterJson.tumor_detected,
      tumor_area_px: clusterJson.tumor_area_px,
    }),
  });
  const upsertJson = await upsertRes.json().catch(() => ({}));
  console.log('Upsert status:', upsertRes.status);
  console.log(JSON.stringify(upsertJson, null, 2));

  // Fetch patients
  console.log('Fetching /api/patients...');
  const patientsRes = await fetch('http://localhost:3001/api/patients');
  const patientsJson = await patientsRes.json().catch(() => ({}));
  const patient = (patientsJson.patients||[]).find(p=>p._id===patientId);
  console.log('Patient latest analysis:', patient && patient.analysisHistory && patient.analysisHistory[0]);
}

main().catch(err=>{console.error(err); process.exit(1);});
