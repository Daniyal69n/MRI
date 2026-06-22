const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://dmn7146:Daniyal@mri.pd9sglm.mongodb.net/brain_analysis?retryWrites=true&w=majority&appName=MRI';
  await mongoose.connect(uri, { bufferCommands: false });
  console.log('Connected to MongoDB');
  const collection = mongoose.connection.collection('patienthistories');

  const historyId = '6a019ee645cb0ebc689025dc';
  const res = await collection.updateOne({ _id: new mongoose.Types.ObjectId(historyId) }, { $set: { gm_percent: 9.99, wm_percent: 8.88, csf_percent: 81.13 } });
  console.log('Update result:', res.result || res);
  const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(historyId) });
  console.log('Document after update:', doc);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
