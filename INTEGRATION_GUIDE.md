# Frontend-Backend Integration Guide

## ✅ What's Been Set Up

### Backend (FastAPI)
- ✅ Running on `http://localhost:8000`
- ✅ Preprocessing pipeline fully implemented
- ✅ API endpoint: `POST /preprocess`

### Frontend (Next.js)
- ✅ API route created: `/api/preprocess` (proxies to FastAPI)
- ✅ Upload page updated to call preprocessing API
- ✅ Results display integrated

## 🚀 How to Use

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
venv\Scripts\activate  # If not already activated
python main.py
```
You should see: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Frontend:**
```powershell
cd my-app
npm run dev
```
You should see: `Ready on http://localhost:3000`

### Step 2: Test the Integration

1. **Open your browser:** `http://localhost:3000`
2. **Login** (or register if needed)
3. **Navigate to:** Dashboard → Upload
4. **Step 1:** Enter patient details and click "Next: Upload Images"
5. **Step 2:** 
   - Drag & drop an MRI image (PNG, JPG, DICOM, or NIfTI)
   - Or click "Select Files"
   - Click "Upload & Process"
6. **Wait for processing** (you'll see "Processing..." status)
7. **View results** - The preprocessing results will display showing:
   - Original image size
   - Processed image size (256×256)
   - All processing steps completed
   - Where the processed image was saved

## 📊 What Happens Behind the Scenes

1. **User uploads image** → Frontend receives file
2. **Frontend calls** → `/api/preprocess` (Next.js API route)
3. **Next.js API route** → Forwards to FastAPI backend at `http://localhost:8000/preprocess`
4. **FastAPI processes image** through pipeline:
   - Resize to 256×256
   - Convert to grayscale
   - Denoise (Gaussian filter)
   - Skull stripping
   - Histogram equalization
   - Normalize to 0-1 range
5. **Results returned** → Frontend displays preprocessing results
6. **Processed image saved** → In `backend/processed/` folder

## 🔧 Configuration

### Backend URL
If your FastAPI backend runs on a different port, update:
- `my-app/app/api/preprocess/route.ts`
- Change: `const FASTAPI_BACKEND_URL = 'http://localhost:8000'`

### Environment Variables (Optional)
You can also set it via environment variable:
```bash
# In my-app/.env.local
FASTAPI_BACKEND_URL=http://localhost:8000
```

## 🧪 Testing Options

### Option 1: Test via Frontend (Recommended)
- Use the upload page as described above

### Option 2: Test Backend Directly
- Visit: `http://localhost:8000/docs`
- Use Swagger UI to test the `/preprocess` endpoint

### Option 3: Test with curl
```bash
curl -X POST "http://localhost:8000/preprocess" \
  -F "file=@path/to/image.png" \
  -F "denoise_method=gaussian"
```

## 📁 File Structure

```
fyp/
├── backend/                    # FastAPI backend
│   ├── main.py                 # FastAPI app
│   ├── preprocessing/           # Preprocessing pipeline
│   └── processed/              # Processed images saved here
│
└── my-app/                      # Next.js frontend
    ├── app/
    │   ├── api/
    │   │   └── preprocess/     # Next.js API route (proxy)
    │   └── dashboard/
    │       └── upload/          # Upload page
    └── ...
```

## 🐛 Troubleshooting

### Backend not responding?
- Check if backend is running: Look for "Uvicorn running on http://0.0.0.0:8000"
- Check port 8000 is not in use by another application

### Frontend can't connect to backend?
- Make sure both servers are running
- Check CORS settings in `backend/main.py`
- Verify `FASTAPI_BACKEND_URL` in `my-app/app/api/preprocess/route.ts`

### Images not processing?
- Check file format is supported (PNG, JPG, DICOM, NIfTI)
- Check backend console for error messages
- Verify image file is not corrupted

### CORS errors?
- Backend already configured for `http://localhost:3000`
- If using different port, update CORS in `backend/main.py`

## ✨ Next Steps

1. **Feature Extraction** - Add feature extraction after preprocessing
2. **Model Training** - Integrate ML models for classification
3. **Results Storage** - Save preprocessing results to database
4. **Batch Processing** - Process multiple images at once
5. **Progress Tracking** - Show real-time progress for large files

## 📝 Notes

- Processed images are saved in `backend/processed/` folder
- Each processed image has a timestamp in filename
- Original images are not stored (only processed versions)
- All preprocessing happens server-side (FastAPI backend)
- Frontend only displays results and handles user interaction
