import type {
  CodeAssistantMode,
  CodeAssistantResult,
  DifficultyLevel,
  EngineeringDomain,
  EngineeringProject,
  ProjectDocumentation,
  ProjectPlan,
  SystemArchitecture,
  TrackerTask,
} from '../types';

export const INITIAL_SAMPLE_PROJECTS: EngineeringProject[] = [
  {
    id: 'proj-attendance-ai',
    title: 'AI-Powered Attendance Management System',
    domain: 'AI/ML',
    difficulty: 'Intermediate',
    language: 'Python',
    duration: '8 Weeks',
    createdAt: '2026-11-10T09:15:00.000Z',
    updatedAt: '2026-11-16T14:20:00.000Z',
    sourceMode: 'sample',
    plan: {
      abstract:
        'Manual roll-call and RFID card swipes in university lecture halls consume instructional time and remain vulnerable to proxy attendance. This project implements a real-time computer-vision attendance system using InsightFace embeddings, RetinaFace detection, and anti-spoofing liveness checks connected to a FastAPI backend and React analytics console. Verified attendance events are logged with sub-second latency and exported directly to institutional CSV/ERP sheets.',
      problemStatement:
        'Traditional classroom attendance tracking wastes 5–10 minutes per session, suffers from human transcription errors, and fails to prevent proxy check-ins. Biometric fingerprint scanners introduce hardware bottlenecks at classroom entrances and hygiene concerns during peak transition periods.',
      objectives: [
        'Achieve >= 98.5% facial recognition accuracy across varied classroom lighting conditions.',
        'Process multi-face classroom camera frames at >= 15 FPS with under 250ms per-frame inference latency.',
        'Integrate blink/depth-based anti-spoofing liveness verification to reject photo or screen replay attacks.',
        'Provide a role-based web dashboard for faculty to audit attendance logs, resolve flagged frames, and export CSV reports.',
      ],
      proposedSolution:
        'A three-tier pipeline ingests RTSP/webcam classroom video, detects and aligns faces using RetinaFace, extracts 512-dimensional ArcFace embeddings, and performs cosine-similarity matching against an indexed FAISS vector store of enrolled students. Verified check-ins are deduplicated per lecture slot and persisted in SQLite/PostgreSQL with timestamped audit trails.',
      technologyStack: [
        { category: 'Computer Vision & AI', tools: ['Python 3.11', 'OpenCV', 'InsightFace (ArcFace)', 'FAISS', 'ONNX Runtime'] },
        { category: 'Backend API', tools: ['FastAPI', 'Uvicorn', 'SQLAlchemy', 'Pydantic'] },
        { category: 'Frontend Dashboard', tools: ['React', 'TypeScript', 'Tailwind CSS'] },
        { category: 'Database & Storage', tools: ['PostgreSQL', 'Local Encrypted Face Embeddings'] },
      ],
      softwareRequirements: [
        'Python 3.11+ with virtual environment (venv / conda)',
        'FastAPI, OpenCV-Python, ONNXRuntime, InsightFace, FAISS-CPU',
        'Node.js 20+ for React faculty dashboard',
        'PostgreSQL 15+ or SQLite for development',
      ],
      hardwareRequirements: [
        '1080p USB or IP RTSP classroom camera (30 FPS)',
        'Workstation or Edge GPU (NVIDIA GTX 1650 / Jetson Orin Nano or 8-core CPU)',
        'Minimum 8 GB RAM and 20 GB SSD storage',
      ],
      systemModules: [
        {
          name: 'Student Enrollment & Embedding Engine',
          description: 'Captures 5 multi-angle student photos, verifies quality, and stores normalized 512-D embeddings.',
          responsibilities: [
            'Validate face pose, sharpness, and illumination before enrollment',
            'Compute mean L2-normalized ArcFace embedding vector',
            'Index student ID and vector inside FAISS index',
          ],
        },
        {
          name: 'Real-Time Detection & Liveness Pipeline',
          description: 'Reads live camera streams, detects faces, and filters out spoofed images.',
          responsibilities: [
            'Run RetinaFace bounding box and 5-point landmark alignment',
            'Perform eye-aspect-ratio and texture liveness validation',
            'Match live embeddings against enrolled FAISS centroids',
          ],
        },
        {
          name: 'Session Deduplication & Attendance API',
          description: 'Records unique student presence per scheduled course session without duplicate rows.',
          responsibilities: [
            'Enforce one attendance record per student per lecture window',
            'Flag low-confidence matches (0.45–0.58 cosine score) for manual faculty review',
            'Expose REST endpoints for live session rosters and exports',
          ],
        },
        {
          name: 'Faculty Analytics & Export Console',
          description: 'Web interface for starting lecture capture, reviewing flagged detections, and downloading reports.',
          responsibilities: [
            'Display live recognized student feed and session attendance rate',
            'Enable one-click override for edge cases and CSV/PDF export',
          ],
        },
      ],
      roadmap: [
        {
          phase: 'Phase 1',
          title: 'Dataset Setup & Enrollment Pipeline',
          duration: 'Weeks 1–2',
          tasks: [
            'Set up Python FastAPI skeleton and PostgreSQL schema',
            'Build student registration script with 512-D ArcFace embedding extraction',
          ],
        },
        {
          phase: 'Phase 2',
          title: 'Real-Time Recognition & Liveness Core',
          duration: 'Weeks 3–5',
          tasks: [
            'Integrate FAISS similarity search and threshold calibration',
            'Implement anti-spoofing liveness check and multi-face tracking',
          ],
        },
        {
          phase: 'Phase 3',
          title: 'Faculty Web Dashboard & Reporting',
          duration: 'Weeks 6–7',
          tasks: [
            'Build React faculty portal with live roster status and manual override',
            'Add automated CSV/Excel attendance sheet export',
          ],
        },
        {
          phase: 'Phase 4',
          title: 'Classroom Benchmarking & Documentation',
          duration: 'Week 8',
          tasks: [
            'Benchmark accuracy across low-light and occluded test scenarios',
            'Finalize project report and demonstration presentation',
          ],
        },
      ],
      testingProcedures: [
        'Unit-test embedding normalization and cosine similarity threshold boundaries.',
        'Evaluate False Acceptance Rate (FAR) and False Rejection Rate (FRR) across 50 test subjects.',
        'Run spoof attack tests using printed photos and mobile phone video playback.',
        'Stress-test concurrent WebSocket/REST updates with 60 simulated students in a single frame.',
      ],
      expectedResults: [
        'Automated marking of a 60-student classroom in under 12 seconds.',
        'Zero proxy attendance via liveness verification and timestamped confidence logs.',
        'Exportable semester attendance reports aligned with university credit rules.',
      ],
      sampleCodeSnippet: {
        language: 'python',
        filename: 'attendance_matcher.py',
        code: `import numpy as np
from dataclasses import dataclass

@dataclass
class MatchResult:
    student_id: str | None
    confidence: float
    status: str

def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    norm_a = vec_a / (np.linalg.norm(vec_a) + 1e-10)
    norm_b = vec_b / (np.linalg.norm(vec_b) + 1e-10)
    return float(np.dot(norm_a, norm_b))

def identify_student(
    probe_embedding: np.ndarray,
    enrolled_db: dict[str, np.ndarray],
    accept_threshold: float = 0.58,
    review_threshold: float = 0.45,
) -> MatchResult:
    best_id, best_score = None, -1.0
    for student_id, ref_embedding in enrolled_db.items():
        score = cosine_similarity(probe_embedding, ref_embedding)
        if score > best_score:
            best_score = score
            best_id = student_id

    if best_score >= accept_threshold:
        return MatchResult(best_id, round(best_score, 4), "PRESENT_VERIFIED")
    if best_score >= review_threshold:
        return MatchResult(best_id, round(best_score, 4), "NEEDS_REVIEW")
    return MatchResult(None, round(best_score, 4), "UNKNOWN")`,
      },
    },
    architecture: {
      overview:
        'The AI-Powered Attendance Management System follows an event-driven Edge-to-API pipeline architecture. Classroom camera streams are processed locally by an ONNX/InsightFace inference worker to avoid streaming raw video over campus WANs. Only anonymized face match events and low-confidence review thumbnails are transmitted to the FastAPI backend, which deduplicates entries per course timetable slot and persists attendance records in PostgreSQL.',
      architecturePattern: 'Decoupled Vision Pipeline + REST/WebSocket Backend',
      mainComponents: [
        {
          name: 'Classroom Camera & Frame Grabber',
          role: 'Captures 1080p frames at 15–30 FPS and queues keyframes for inference.',
          technology: 'OpenCV / RTSP Client',
          interfaces: 'In-memory bounded frame ring buffer',
        },
        {
          name: 'Vision Inference & Liveness Engine',
          role: 'Detects faces, runs liveness checks, and produces 512-D embeddings.',
          technology: 'RetinaFace + ArcFace (ONNX Runtime)',
          interfaces: 'Python gRPC / Local Worker Queue',
        },
        {
          name: 'FAISS Vector Index',
          role: 'Performs sub-millisecond nearest-neighbor cosine search over enrolled students.',
          technology: 'FAISS IndexFlatIP',
          interfaces: 'Synced on enrollment updates',
        },
        {
          name: 'FastAPI Attendance Service',
          role: 'Validates timetable slots, deduplicates records, and serves faculty APIs.',
          technology: 'FastAPI + SQLAlchemy',
          interfaces: 'REST JSON + WebSocket live feed',
        },
        {
          name: 'Faculty Web Console',
          role: 'Displays live attendance status, flagged reviews, and CSV export controls.',
          technology: 'React + TypeScript + Tailwind CSS',
          interfaces: 'HTTPS / WSS to FastAPI',
        },
      ],
      dataFlow: [
        '1. RTSP classroom camera streams video frames into the Frame Grabber buffer.',
        '2. RetinaFace localizes face bounding boxes and 5 facial landmarks per frame.',
        '3. Liveness detector verifies natural blink/texture cues to reject spoofed images.',
        '4. ArcFace extracts a normalized 512-D vector and queries the FAISS Vector Index.',
        '5. Matched student IDs and confidence scores are sent to the FastAPI Attendance Service.',
        '6. FastAPI checks the active course timetable, deduplicates entries, and writes to PostgreSQL.',
        '7. Live session updates stream to the Faculty Web Console for real-time monitoring and CSV export.',
      ],
      moduleRelationships: [
        { source: 'Camera Frame Grabber', target: 'Vision Inference Engine', interaction: 'Keyframes (15 FPS RGB tensors)' },
        { source: 'Vision Inference Engine', target: 'FAISS Vector Index', interaction: '512-D embedding cosine query' },
        { source: 'Vision Inference Engine', target: 'FastAPI Attendance Service', interaction: 'Verified student ID + confidence JSON' },
        { source: 'FastAPI Attendance Service', target: 'PostgreSQL Database', interaction: 'SQLAlchemy transactional insert' },
        { source: 'FastAPI Attendance Service', target: 'Faculty Web Console', interaction: 'WebSocket live roster & REST export' },
      ],
      mermaidDiagram: `flowchart LR
  CAM["Classroom RTSP Camera"] --> GRAB["Frame Grabber Buffer"]
  GRAB --> DET["RetinaFace + Liveness Check"]
  DET --> EMB["ArcFace 512-D Embedder"]
  EMB --> FAISS[("FAISS Vector Index")]
  FAISS --> API["FastAPI Attendance Service"]
  API --> DB[("PostgreSQL Roster DB")]
  API --> UI["Faculty Web Console (React)"]`,
    },
    documentation: {
      titlePage: {
        title: 'AI-Powered Attendance Management System',
        subtitle: 'Real-Time Facial Recognition & Anti-Spoofing Classroom Roster Automation',
        domain: 'AI/ML',
        difficulty: 'Intermediate',
        language: 'Python',
        duration: '8 Weeks',
        preparedBy: 'Alex Rivera',
        institution: 'Department of Computer & Systems Engineering',
        guideName: 'Dr. S. Kulkarni',
        date: 'November 2026',
      },
      abstract:
        'Accurate student attendance tracking is essential for academic compliance, yet conventional manual roll-calls and smart-card readers introduce significant latency and proxy vulnerabilities. This report presents the design and implementation of an AI-Powered Attendance Management System built on RetinaFace face detection, ArcFace 512-dimensional embeddings, FAISS similarity search, and liveness anti-spoofing. Deployed through a FastAPI backend and React faculty dashboard, the system automates multi-student classroom attendance in real time while maintaining strict auditability.',
      introduction:
        'Higher education institutions routinely track attendance across hundreds of concurrent classes each week. Manual methods consume valuable instructional minutes, while physical biometric terminals create queues at lecture hall doors. Recent advances in lightweight convolutional neural networks and ONNX hardware acceleration make contactless, camera-based multi-face attendance feasible on standard campus hardware.',
      problemStatement:
        'Existing attendance mechanisms fail along three dimensions: instructional time loss during manual roll-call, susceptibility to proxy attendance via shared ID cards, and delayed digitization of paper sheets into institutional ERP portals.',
      objectives: [
        'Achieve >= 98.5% recognition precision on enrolled classroom cohorts.',
        'Maintain real-time inference (>= 15 FPS) on mid-range CPU/GPU hardware.',
        'Prevent photo and video replay spoofing through automated liveness detection.',
        'Deliver a responsive faculty console with manual review and CSV export.',
      ],
      existingSystem:
        'Current campus workflows rely on paper sign-in sheets or single-point RFID badge readers. Paper logs require manual spreadsheet entry by instructors, while RFID readers cannot verify whether the cardholder is physically present.',
      proposedSystem:
        'The proposed system captures live classroom frames, isolates faces via RetinaFace, validates liveness cues, and matches 512-D ArcFace embeddings against a FAISS vector index. Recognized entries are deduplicated per lecture session in PostgreSQL and surfaced live to instructors.',
      systemArchitecture:
        'A modular five-component architecture separates local vision inference from backend persistence and the web interface. Running detection and embedding extraction at the classroom edge ensures raw video never saturates campus networks, transmitting only lightweight match payloads over TLS.',
      implementation:
        'The vision worker is implemented in Python 3.11 using OpenCV, InsightFace, and ONNX Runtime. Cosine similarity matching runs against FAISS IndexFlatIP. The FastAPI backend manages course timetables, student enrollment endpoints, and WebSocket roster broadcasts to the React + TypeScript frontend.',
      results:
        'Benchmark evaluations on a 50-student test cohort demonstrated 98.8% verification accuracy under standard indoor lighting, an average per-frame processing latency of 42ms, and 100% rejection of printed-photo spoof attempts.',
      conclusion:
        'The AI-Powered Attendance Management System eliminates manual roll-call overhead while providing reliable, tamper-resistant attendance logs ready for departmental integration.',
      futureScope:
        'Future iterations will incorporate automated edge-model quantization (INT8 TensorRT), direct LTI/LMS gradebook webhooks, and privacy-preserving federated embedding updates.',
    },
    tasks: [
      { id: 't-1', title: 'Initialize FastAPI project & PostgreSQL schema', phase: 'Phase 1', priority: 'High', completed: true, createdAt: '2026-11-10T10:00:00.000Z' },
      { id: 't-2', title: 'Implement 5-photo student enrollment & ArcFace embedding storage', phase: 'Phase 1', priority: 'High', completed: true, createdAt: '2026-11-11T11:30:00.000Z' },
      { id: 't-3', title: 'Integrate FAISS cosine similarity search & threshold tuning', phase: 'Phase 2', priority: 'High', completed: true, createdAt: '2026-11-13T09:00:00.000Z' },
      { id: 't-4', title: 'Add eye-blink & texture liveness anti-spoofing check', phase: 'Phase 2', priority: 'Medium', completed: false, createdAt: '2026-11-14T15:00:00.000Z' },
      { id: 't-5', title: 'Build React faculty dashboard & CSV export endpoint', phase: 'Phase 3', priority: 'Medium', completed: false, createdAt: '2026-11-15T12:00:00.000Z' },
      { id: 't-6', title: 'Run 50-subject FAR/FRR accuracy benchmark', phase: 'Phase 4', priority: 'Low', completed: false, createdAt: '2026-11-16T16:00:00.000Z' },
    ],
    notes: [
      {
        id: 'n-1',
        content: 'Calibrated cosine accept threshold to 0.58; frames between 0.45 and 0.58 route to faculty review queue to avoid false rejections under fluorescent flicker.',
        updatedAt: '2026-11-15T14:10:00.000Z',
      },
    ],
  },
  {
    id: 'proj-iot-energy',
    title: 'IoT Smart Campus Energy & HVAC Monitor',
    domain: 'IoT',
    difficulty: 'Intermediate',
    language: 'C++',
    duration: '10 Weeks',
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-12T18:45:00.000Z',
    sourceMode: 'sample',
    plan: {
      abstract:
        'University buildings waste substantial electrical energy when HVAC units and lab lighting remain active in unoccupied rooms. This project designs an ESP32-based sensor node network using non-invasive CT current clamps, DHT22 climate sensors, and PIR occupancy detectors communicating over MQTT to a time-series analytics portal.',
      problemStatement:
        'Campus facility managers lack granular room-level visibility into real-time power draw and occupancy correlation, resulting in reactive maintenance and inflated peak-demand utility penalties.',
      objectives: [
        'Measure AC branch current with +/- 2% calibration accuracy using SCT-013 CT sensors.',
        'Stream telemetry packets every 5 seconds via MQTT over TLS with offline ring-buffer fallback.',
        'Detect unoccupied high-load anomalies and trigger automated relay scheduling alerts.',
        'Visualize daily kWh consumption and power factor trends in a live web dashboard.',
      ],
      proposedSolution:
        'ESP32 microcontrollers sample voltage/current waveforms at 2 kHz to compute RMS current and apparent power, publishing JSON payloads to an Eclipse Mosquitto MQTT broker. A Node.js ingestion service writes metrics into TimescaleDB/InfluxDB and evaluates rule-based occupancy-load anomalies.',
      technologyStack: [
        { category: 'Embedded Firmware', tools: ['ESP32', 'C++ (PlatformIO)', 'PubSubClient MQTT', 'EmonLib'] },
        { category: 'Messaging & Ingestion', tools: ['Eclipse Mosquitto', 'Node.js', 'TypeScript'] },
        { category: 'Time-Series & Dashboard', tools: ['InfluxDB', 'React', 'Tailwind CSS'] },
      ],
      softwareRequirements: [
        'PlatformIO IDE / VS Code for ESP32 firmware flashing',
        'Eclipse Mosquitto MQTT Broker 2.0+',
        'Node.js 20+ and InfluxDB 2.x',
      ],
      hardwareRequirements: [
        'ESP32-WROOM-32 DevKit nodes',
        'SCT-013-030 non-invasive AC current sensor + burden resistor circuit',
        'DHT22 temperature/humidity sensor & HC-SR501 PIR occupancy sensor',
      ],
      systemModules: [
        {
          name: 'ESP32 Edge Telemetry Node',
          description: 'Samples analog CT sensor signals, reads PIR/DHT22, and formats MQTT packets.',
          responsibilities: ['Compute RMS current & kW load', 'Maintain Wi-Fi reconnect & local buffer'],
        },
        {
          name: 'MQTT Telemetry Broker & Anomaly Engine',
          description: 'Routes room topics and flags wasted energy when occupancy is zero for >15 minutes.',
          responsibilities: ['Verify topic ACLs', 'Trigger threshold alerts and relay commands'],
        },
        {
          name: 'Facilities Energy Console',
          description: 'Displays real-time kW curves, room status, and weekly cost projections.',
          responsibilities: ['Render room-by-room load breakdown', 'Export monthly audit CSV'],
        },
      ],
      roadmap: [
        { phase: 'Phase 1', title: 'Sensor Conditioning & Calibration', duration: 'Weeks 1–3', tasks: ['Build CT voltage-divider bias circuit', 'Calibrate RMS readings against clamp multimeter'] },
        { phase: 'Phase 2', title: 'MQTT Firmware & Broker Setup', duration: 'Weeks 4–6', tasks: ['Implement ESP32 MQTT publisher with watchdog', 'Configure Mosquitto broker and InfluxDB writer'] },
        { phase: 'Phase 3', title: 'Dashboard & Anomaly Alerts', duration: 'Weeks 7–10', tasks: ['Create live energy chart view', 'Validate idle-room HVAC shutoff alerts'] },
      ],
      testingProcedures: [
        'Compare ESP32 RMS current readings against a Fluke clamp meter across 100W–2000W resistive loads.',
        'Simulate Wi-Fi drop for 10 minutes and confirm buffered telemetry recovery.',
      ],
      expectedResults: [
        '15–22% reduction in after-hours HVAC & lighting energy waste across monitored labs.',
        'Sub-second telemetry latency from sensor node to facilities dashboard.',
      ],
      sampleCodeSnippet: {
        language: 'cpp',
        filename: 'energy_node.ino',
        code: `#include <WiFi.h>
#include <PubSubClient.h>

const int CT_PIN = 34;
const float CALIBRATION = 30.0;

float readRmsCurrent(int samples = 400) {
  double sumSq = 0;
  for (int i = 0; i < samples; i++) {
    int raw = analogRead(CT_PIN) - 2048;
    float volts = (raw / 4095.0f) * 3.3f;
    float amps = volts * CALIBRATION;
    sumSq += amps * amps;
    delayMicroseconds(250);
  }
  return sqrt(sumSq / samples);
}`,
      },
    },
    architecture: {
      overview:
        'An edge-to-cloud IoT telemetry pipeline connecting ESP32 sensor nodes over MQTT to a centralized ingestion service, time-series database, and facilities web console.',
      architecturePattern: 'Pub/Sub IoT Telemetry Pipeline',
      mainComponents: [
        { name: 'ESP32 Sensor Nodes', role: 'Sample CT clamp, PIR, and DHT22 sensors.', technology: 'ESP32 + C++', interfaces: 'MQTT Publish (QoS 1)' },
        { name: 'Mosquitto MQTT Broker', role: 'Handles room topic routing and keepalive.', technology: 'Eclipse Mosquitto', interfaces: 'TLS Port 8883' },
        { name: 'Ingestion & Rule Worker', role: 'Parses telemetry and detects idle-room waste.', technology: 'Node.js / TypeScript', interfaces: 'MQTT Sub + InfluxDB Write' },
        { name: 'Time-Series Store', role: 'Stores 5-second power and climate metrics.', technology: 'InfluxDB', interfaces: 'Flux Query API' },
      ],
      dataFlow: [
        '1. CT clamp and PIR sensor feed analog/digital signals to ESP32.',
        '2. ESP32 computes RMS power and publishes JSON to campus/lab1/telemetry.',
        '3. Ingestion worker stores readings in InfluxDB and evaluates occupancy thresholds.',
        '4. Facilities console queries historical kWh and renders live alerts.',
      ],
      moduleRelationships: [
        { source: 'ESP32 Sensor Nodes', target: 'Mosquitto Broker', interaction: 'MQTT JSON telemetry every 5s' },
        { source: 'Mosquitto Broker', target: 'Ingestion Worker', interaction: 'Subscribed topic stream' },
        { source: 'Ingestion Worker', target: 'InfluxDB', interaction: 'Batched time-series writes' },
      ],
      mermaidDiagram: `flowchart TD
  SENS["CT Clamp + PIR + DHT22"] --> ESP["ESP32 Edge Node"]
  ESP --> MQTT["Mosquitto MQTT Broker"]
  MQTT --> ING["Node.js Ingestion & Rule Engine"]
  ING --> TSDB[("InfluxDB Time-Series")]
  ING --> ALERT["Idle HVAC Alert Service"]
  TSDB --> DASH["Facilities Energy Dashboard"]`,
    },
    tasks: [
      { id: 't-e1', title: 'Assemble CT bias circuit on breadboard & verify ADC midpoint', phase: 'Phase 1', priority: 'High', completed: true, createdAt: '2026-11-05T09:00:00.000Z' },
      { id: 't-e2', title: 'Flash ESP32 MQTT publisher firmware', phase: 'Phase 2', priority: 'High', completed: true, createdAt: '2026-11-07T14:00:00.000Z' },
      { id: 't-e3', title: 'Configure InfluxDB retention policy & bucket', phase: 'Phase 2', priority: 'Medium', completed: false, createdAt: '2026-11-09T11:00:00.000Z' },
      { id: 't-e4', title: 'Implement idle-room 15-min shutoff alert rule', phase: 'Phase 3', priority: 'Medium', completed: false, createdAt: '2026-11-11T16:00:00.000Z' },
    ],
    notes: [],
  },
  {
    id: 'proj-robotics-rover',
    title: 'Autonomous Line-Following Warehouse Rover',
    domain: 'Robotics',
    difficulty: 'Beginner',
    language: 'C++',
    duration: '6 Weeks',
    createdAt: '2026-11-01T10:30:00.000Z',
    updatedAt: '2026-11-08T17:15:00.000Z',
    sourceMode: 'sample',
    plan: {
      abstract:
        'Small-scale warehouse fulfillment labs require low-cost autonomous payload carriers capable of navigating taped floor lanes and halting safely when obstacles appear. This project builds a PID-controlled differential-drive rover using an 8-channel IR sensor array, ultrasonic obstacle avoidance, and Arduino/STM32 motor control.',
      problemStatement:
        'Basic bang-bang line-following robots oscillate violently at higher speeds and collide with unexpected aisle obstructions, making them unsuitable for transporting fragile lab payloads.',
      objectives: [
        'Implement closed-loop PID steering control for smooth high-speed cornering.',
        'Integrate ultrasonic distance sensing to halt smoothly within 20cm of obstacles.',
        'Maintain battery voltage telemetry and status LEDs for safe operation.',
      ],
      proposedSolution:
        'An 8-IR reflectance bar computes a weighted line-position error signal fed into a tuned PID controller at 100 Hz. Differential PWM signals drive an L298N/TB6612FNG dual H-bridge, while an HC-SR04 interrupt loop overrides motor output when obstacles enter the safety zone.',
      technologyStack: [
        { category: 'Control & Firmware', tools: ['Arduino / STM32', 'Embedded C++', 'PID Control Loop'] },
        { category: 'Hardware & Actuation', tools: ['TB6612FNG Motor Driver', 'QTR-8RC IR Array', 'HC-SR04 Ultrasonic'] },
      ],
      softwareRequirements: ['Arduino IDE 2.x or PlatformIO', 'Serial Plotter for PID gain tuning'],
      hardwareRequirements: ['2WD Differential Chassis + Caster', '2x 12V DC Geared Motors', 'QTR-8RC IR Array', '7.4V LiPo Battery'],
      systemModules: [
        { name: 'IR Line Error Estimator', description: 'Reads 8 reflectance channels and outputs normalized lateral error.', responsibilities: ['Auto-calibrate white/black thresholds', 'Compute weighted centroid error'] },
        { name: 'PID Steering & Safety Override', description: 'Computes differential motor PWM and checks ultrasonic clearance.', responsibilities: ['Run 100 Hz PID loop', 'Trigger smooth deceleration on obstacle'] },
      ],
      roadmap: [
        { phase: 'Phase 1', title: 'Chassis Assembly & Motor Testing', duration: 'Weeks 1–2', tasks: ['Wire TB6612FNG and verify wheel polarity', 'Test IR array calibration'] },
        { phase: 'Phase 2', title: 'PID Tuning & Obstacle Halt', duration: 'Weeks 3–6', tasks: ['Tune Kp, Ki, Kd gains via serial telemetry', 'Validate 20cm obstacle stop reliability'] },
      ],
      testingProcedures: ['Measure lateral deviation across 90-degree and S-curve track segments.', 'Test emergency stop repeatability across 20 obstacle trials.'],
      expectedResults: ['Smooth line tracking up to 0.8 m/s without oscillation.', 'Zero collisions across 20 consecutive obstacle tests.'],
      sampleCodeSnippet: {
        language: 'cpp',
        filename: 'pid_controller.ino',
        code: `float kp = 0.08f, ki = 0.001f, kd = 0.45f;
float lastError = 0, integral = 0;

int computePidCorrection(int linePosition, int targetPosition = 3500) {
  float error = static_cast<float>(linePosition - targetPosition);
  integral = constrain(integral + error, -5000.0f, 5000.0f);
  float derivative = error - lastError;
  lastError = error;
  return static_cast<int>(kp * error + ki * integral + kd * derivative);
}`,
      },
    },
    tasks: [
      { id: 't-r1', title: 'Assemble chassis & wire motor driver', phase: 'Phase 1', priority: 'High', completed: true, createdAt: '2026-11-01T11:00:00.000Z' },
      { id: 't-r2', title: 'Tune PID gains on test track', phase: 'Phase 2', priority: 'High', completed: false, createdAt: '2026-11-04T15:00:00.000Z' },
    ],
    notes: [],
  },
];

export function createTasksFromPlan(plan: ProjectPlan): TrackerTask[] {
  const tasks: TrackerTask[] = [];
  const now = new Date().toISOString();
  plan.roadmap.forEach((phase) => {
    phase.tasks.forEach((taskTitle, index) => {
      tasks.push({
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${index}`,
        title: taskTitle,
        phase: phase.phase,
        priority: index === 0 ? 'High' : 'Medium',
        completed: false,
        createdAt: now,
      });
    });
  });
  return tasks;
}

export function buildDemoProjectPlan(input: {
  title: string;
  domain: EngineeringDomain;
  difficulty: DifficultyLevel;
  language: string;
  duration: string;
}): ProjectPlan {
  const cleanTitle = input.title.trim() || 'Smart Engineering Prototype';
  return {
    abstract: `[Demo Mode Sample] ${cleanTitle} is a ${input.difficulty.toLowerCase()}-level ${input.domain} engineering system implemented primarily in ${input.language} over a ${input.duration} development cycle. It transforms manual workflows into an automated, modular pipeline with verifiable telemetry, clean separation of concerns, and reproducible test benchmarks.`,
    problemStatement: `Current solutions for ${cleanTitle} often rely on fragmented manual steps, lack real-time observability, and struggle to scale reliably for student and campus-level deployments.`,
    objectives: [
      `Design a modular ${input.domain} architecture tailored for ${cleanTitle}.`,
      `Implement core processing logic in ${input.language} with deterministic error handling.`,
      `Validate end-to-end system performance through structured unit and integration tests.`,
      `Deliver clean engineering documentation and a reproducible setup guide within ${input.duration}.`,
    ],
    proposedSolution: `The proposed system divides ${cleanTitle} into an ingestion/input layer, a core ${input.language} processing engine, persistent storage, and an interactive user interface. Each module communicates via well-defined schemas so components can be tested independently.`,
    technologyStack: [
      { category: 'Core Language & Runtime', tools: [input.language, 'Standard Library', 'Structured Logging'] },
      { category: 'Domain Layer', tools: [input.domain === 'IoT' ? 'MQTT / Embedded Drivers' : `${input.domain} Processing Pipeline`, 'REST / JSON Interfaces'] },
      { category: 'Testing & Tooling', tools: ['Automated Unit Tests', 'Git Version Control', 'Markdown Docs'] },
    ],
    softwareRequirements: [
      `${input.language} toolchain and package manager`,
      'Git CLI and VS Code / IDE',
      'Local test runner and HTTP client',
    ],
    hardwareRequirements: [
      input.domain === 'IoT' || input.domain === 'Robotics' || input.domain === 'Embedded Systems'
        ? 'Microcontroller dev board, sensors, breadboard, and USB programmer'
        : 'Standard development laptop (8+ GB RAM, dual-core+ CPU)',
    ],
    systemModules: [
      {
        name: 'Input & Validation Module',
        description: `Captures and sanitizes incoming signals or user requests for ${cleanTitle}.`,
        responsibilities: ['Validate payload schemas', 'Normalize input formats before processing'],
      },
      {
        name: 'Core Processing Engine',
        description: `Executes primary ${input.domain} algorithms and business rules in ${input.language}.`,
        responsibilities: ['Run deterministic domain logic', 'Emit structured result records'],
      },
      {
        name: 'Reporting & Export Layer',
        description: 'Persists outputs and exposes clear status summaries for demonstration.',
        responsibilities: ['Store execution logs', 'Generate summary metrics'],
      },
    ],
    roadmap: [
      {
        phase: 'Phase 1',
        title: 'Environment & Core Prototype',
        duration: '25% of timeline',
        tasks: [`Initialize ${input.language} project repository`, 'Implement input validation and baseline data model'],
      },
      {
        phase: 'Phase 2',
        title: 'Core Engine Integration',
        duration: '45% of timeline',
        tasks: [`Build main ${input.domain} processing pipeline`, 'Connect persistence and error recovery'],
      },
      {
        phase: 'Phase 3',
        title: 'Verification & Final Report',
        duration: '30% of timeline',
        tasks: ['Execute end-to-end test suite', 'Prepare live demo and academic documentation'],
      },
    ],
    testingProcedures: [
      'Run unit tests covering boundary inputs and malformed payloads.',
      'Benchmark latency and throughput under typical classroom demo conditions.',
    ],
    expectedResults: [
      `Working ${input.language} prototype demonstrating core ${cleanTitle} workflows.`,
      'Clean pass across all validation test cases with measurable latency metrics.',
    ],
    sampleCodeSnippet: {
      language: input.language.toLowerCase().includes('python') ? 'python' : 'typescript',
      filename: input.language.toLowerCase().includes('python') ? 'main.py' : 'index.ts',
      code: input.language.toLowerCase().includes('python')
        ? `# Demo Mode Starter — ${cleanTitle}\nfrom dataclasses import dataclass\n\n@dataclass\nclass ProjectConfig:\n    name: str = "${cleanTitle}"\n    domain: str = "${input.domain}"\n\ndef run_pipeline(payload: dict) -> dict:\n    if not payload:\n        raise ValueError("Payload cannot be empty")\n    return {"project": ProjectConfig.name, "status": "processed", "items": len(payload)}\n`
        : `// Demo Mode Starter — ${cleanTitle}\nexport interface PipelineResult {\n  project: string;\n  status: string;\n}\n\nexport function runPipeline(input: Record<string, unknown>): PipelineResult {\n  if (!Object.keys(input).length) {\n    throw new Error('Input payload cannot be empty');\n  }\n  return { project: '${cleanTitle}', status: 'processed' };\n}\n`,
    },
  };
}

export function buildDemoArchitecture(project: {
  title: string;
  domain: string;
  language: string;
}): SystemArchitecture {
  return {
    overview: `[Demo Mode Sample] Layered modular architecture for ${project.title}. The system separates input ingestion, ${project.domain} core processing in ${project.language}, data storage, and user-facing presentation to simplify debugging and academic demonstration.`,
    architecturePattern: 'Modular Three-Tier Pipeline',
    mainComponents: [
      { name: 'Client / Input Interface', role: 'Collects inputs and displays system outputs.', technology: 'Web UI / CLI / Sensor Input', interfaces: 'JSON / Serial' },
      { name: 'Application Gateway', role: 'Validates requests and orchestrates module calls.', technology: project.language, interfaces: 'REST / Internal API' },
      { name: 'Core Processing Module', role: `Executes ${project.domain} logic and scoring.`, technology: project.language, interfaces: 'Typed Service Interface' },
      { name: 'Persistence Layer', role: 'Stores state, logs, and configuration.', technology: 'SQLite / Local Store', interfaces: 'Repository Pattern' },
    ],
    dataFlow: [
      `1. User or sensor submits raw data into the ${project.title} Input Interface.`,
      '2. Application Gateway validates schema and forwards payload to Core Processing Module.',
      `3. Core Processing Module runs ${project.domain} transformations and computes output.`,
      '4. Persistence Layer records results and returns a formatted response to the UI.',
    ],
    moduleRelationships: [
      { source: 'Input Interface', target: 'Application Gateway', interaction: 'Validated request payload' },
      { source: 'Application Gateway', target: 'Core Processing Module', interaction: 'Normalized domain object' },
      { source: 'Core Processing Module', target: 'Persistence Layer', interaction: 'Structured result write' },
    ],
    mermaidDiagram: `flowchart TD
  IN["Input / Sensor Interface"] --> GW["Application Gateway"]
  GW --> CORE["Core ${project.domain.replace(/[^a-zA-Z0-9 ]/g, '')} Engine"]
  CORE --> DB[("Persistence Store")]
  CORE --> OUT["Analytics & Export View"]`,
  };
}

export function buildDemoCodeAssistant(req: {
  mode: CodeAssistantMode;
  language: string;
  input: string;
}): CodeAssistantResult {
  const lang = req.language || 'Python';
  return {
    sourceMode: 'demo',
    language: lang,
    summary: `[Demo Mode Sample — ${req.mode.toUpperCase()}] Sample ${lang} response generated offline for demonstration. Configure GEMINI_API_KEY on the server for live AI reasoning tailored to your exact code.`,
    code:
      req.mode === 'generate'
        ? `# Sample ${lang} implementation for: ${req.input.slice(0, 60)}\ndef process_engineering_data(records: list[float]) -> dict[str, float]:\n    if not records:\n        raise ValueError("Input dataset must contain at least one value.")\n    avg_val = sum(records) / len(records)\n    return {\n        "count": float(len(records)),\n        "average": round(avg_val, 4),\n        "peak": max(records),\n    }\n`
        : req.input,
    lineByLine: [
      { lines: 'Lines 1–2', explanation: 'Defines a typed function signature accepting numeric records and returning summary metrics.' },
      { lines: 'Lines 3–4', explanation: 'Guards against empty inputs to prevent ZeroDivisionError at runtime.' },
      { lines: 'Lines 5–10', explanation: 'Computes mean and peak values and returns a clean dictionary.' },
    ],
    findings:
      req.mode === 'debug' || req.mode === 'improve'
        ? [
            { severity: 'warning', title: 'Input Boundary Validation', detail: 'Always guard against empty collections or null payloads before division or indexing.' },
            { severity: 'suggestion', title: 'Explicit Type Annotations', detail: 'Adding return types improves maintainability and catches contract mismatches early.' },
          ]
        : [],
  };
}

export function buildDemoDocumentation(
  project: EngineeringProject,
  meta: { preparedBy: string; institution: string; guideName: string }
): ProjectDocumentation {
  return {
    titlePage: {
      title: project.title,
      subtitle: `[Demo Mode Sample] ${project.domain} Engineering Project Report`,
      domain: project.domain,
      difficulty: project.difficulty,
      language: project.language,
      duration: project.duration,
      preparedBy: meta.preparedBy || 'Engineering Student',
      institution: meta.institution || 'Department of Engineering',
      guideName: meta.guideName || 'Faculty Mentor',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    },
    abstract: project.plan.abstract,
    introduction: `This report documents the design, architecture, and implementation of ${project.title}, developed over ${project.duration} using ${project.language}.`,
    problemStatement: project.plan.problemStatement,
    objectives: project.plan.objectives,
    existingSystem: `Conventional approaches in ${project.domain} rely heavily on manual workflows with limited automation and delayed reporting.`,
    proposedSystem: project.plan.proposedSolution,
    systemArchitecture:
      project.architecture?.overview ||
      `The system employs a modular architecture dividing responsibilities across ${project.plan.systemModules.map((m) => m.name).join(', ')}.`,
    implementation: `Implemented in ${project.language} across ${project.plan.systemModules.length} core modules, validated against structured test cases.`,
    results: project.plan.expectedResults.join(' '),
    conclusion: `${project.title} successfully demonstrates a functional, maintainable ${project.domain} solution ready for academic evaluation.`,
    futureScope: 'Future enhancements include cloud autoscaling, automated CI/CD regression suites, and expanded telemetry dashboards.',
  };
}
