# OpenCV Facial Recognition Models (YuNet + SFace)

The `/api/facial/verify` endpoint uses **OpenCV** with:

- **YuNet** face detector (`face_detection_yunet_2022mar.onnx`)
- **SFace** face recognizer (`face_recognition_sface_2021dec.onnx`)

## Where to put the files

Place these two files in:

- `backend/models/face_detection_yunet_2022mar.onnx`
- `backend/models/face_recognition_sface_2021dec.onnx`

## Environment variables (optional)

- `FACE_DETECTOR_MODEL_PATH`: path to YuNet ONNX
- `FACE_RECOGNIZER_MODEL_PATH`: path to SFace ONNX
- `FACE_MATCH_METRIC`: `cosine` (default) or `l2`
- `FACE_MATCH_THRESHOLD`:
  - cosine default: `0.363`
  - l2 default: `1.128`
- `FACE_DETECTOR_SCORE_THRESHOLD` (default `0.9`)
- `FACE_DETECTOR_NMS_THRESHOLD` (default `0.3`)
- `FACE_DETECTOR_TOPK` (default `5000`)

## Notes

- This is **offline verification** (image-to-image similarity). It is **not** UIDAI/eKYC.
- If the model files are missing, the API returns **503** with a message describing what’s missing.

---

# OpenCV Vehicle Detection (YOLO ONNX)

The `/api/vehicle/detect` endpoint uses **OpenCV DNN** with a YOLO **ONNX** model to detect and classify vehicles.

## Where to put the file

Default expected path:

- `backend/models/vehicle_yolov8n.onnx`

## Environment variables (optional)

- `VEHICLE_DETECTOR_MODEL_PATH`: path to YOLO ONNX (default above)
- `VEHICLE_DETECTOR_INPUT_SIZE`: default `640`
- `VEHICLE_DETECTOR_CONF_THRESHOLD`: default `0.35`
- `VEHICLE_DETECTOR_NMS_IOU_THRESHOLD`: default `0.45`
- `OPENCV_DNN_BACKEND`: `default` or `opencv`
- `OPENCV_DNN_TARGET`: `cpu`

## Model expectation

- The model should be trained on **COCO-80** (so it includes `car`, `motorcycle`, `bus`, `truck` classes).
- The API maps COCO classes to these UI categories:
  - `motorcycle` / `bicycle` → `Two Wheeler`
  - `car` → `Four Wheeler - LMV`
  - `bus` → `Bus`
  - `truck` → `Heavy Goods Vehicle`

If the model file is missing, the API returns **503** with a setup message.

