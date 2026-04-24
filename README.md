# 🌍 OpenLocate Platform

OpenLocate is a modular, open-source platform designed to support **authorized investigations of missing persons**, with a primary humanitarian focus on **missing children and anti-trafficking efforts**.

This repository contains the **frontend application (Case Management Interface)** and integrated AI-oriented backend components for research and analysis.

---

## ⚠️ Important Notice

This project:

* ❌ is NOT a surveillance system
* ❌ does NOT perform automatic identification
* ❌ does NOT provide facial search against public databases
* ❌ does NOT store biometric databases for tracking

✔ It is a **controlled, research-oriented and investigation-support platform**
✔ All analysis requires **human validation and legal authorization**

---

## 🎯 Mission

Millions of children go missing every year worldwide.

OpenLocate was created to:

* Support **authorized investigations**
* Assist in **missing children cases**
* Contribute to **anti-trafficking initiatives**
* Provide **transparent biometric comparison tools**
* Promote **ethical and privacy-conscious AI usage**

---

## 🧠 System Architecture

OpenLocate is structured into two main layers:

### 🖥 Frontend (this repository)

* Case management system
* Investigation workflows
* Image comparison interface
* Audit logs and analysis tracking
* Secure authentication (UI layer)

### 🤖 AI / Backend Engine (Python)

Located in:

```bash
backend/face-recognition-system/
```

Responsible for:

* Face detection
* Face embeddings (ArcFace / InsightFace)
* Similarity calculation
* Multi-image comparison
* Anti-spoofing (liveness)
* Experimental pipelines

---

## 🔄 Data Flow

```text
User → Frontend → API → AI Engine → Response → Frontend
```

1. Investigator uploads images
2. Frontend sends request to backend
3. AI engine processes images
4. Returns similarity score
5. Result is displayed with ethical warning

---

## 🧩 Core Features

### 📁 Case Management

* Create and manage investigation cases
* Add notes, updates, and images
* Track case status

### 🧬 Image Comparison

* Manual upload of two images
* AI-powered similarity scoring
* Multi-image comparison support

### 🧠 AI Processing

* Face detection and alignment
* Embedding generation
* Cosine similarity scoring
* Anti-spoofing validation

### 📊 Audit Logging

* Tracks who performed analysis
* Logs timestamps and case linkage

---

## 🔒 Ethical & Legal Principles

* Privacy by Design
* No biometric database storage
* No automated decision-making
* Human review is mandatory
* Compliance with regulations such as LGPD and GDPR

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/joaohvittor/openlocate.git
cd openlocate
```

---

### 2. Install frontend dependencies

```bash
npm install
```

---

### 3. Run frontend

```bash
npm run dev
```

---

### 4. Run AI backend (separately)

```bash
cd backend/face-recognition-system
pip install -r requirements.txt
python api/main.py
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:8000
```

---

## 📁 Project Structure

```bash
openlocate/
│
├── src/                        # Frontend (React + Vite)
├── components/               # UI components
├── pages/                    # Application pages
├── entities/                 # Domain models
│
├── backend/
│   └── face-recognition-system/   # AI Engine (Python)
│
├── package.json
└── README.md
```

---

## 🧪 Research Disclaimer

This platform provides **probabilistic similarity analysis**.

> Results must NEVER be used as the sole basis for identification.

All outputs require:

* human validation
* contextual investigation
* legal authorization

---

## 🛡 Future Roadmap

* Multi-model fusion (ArcFace + InsightFace)
* Behavioral analysis modules
* Video frame analysis
* External data ingestion (news, public safety)
* Controlled DNA comparison module
* Deployment-ready API Gateway

---

## 🤝 Contributing

Contributions are welcome, especially in:

* AI/ML improvements
* Computer vision
* Ethical AI governance
* Security and compliance

---

## 📜 License

This project is intended for **research and humanitarian purposes**.

Use responsibly and in compliance with all applicable laws.

---

## 🌍 Final Note

OpenLocate exists to support **real-world humanitarian efforts**.

Technology alone does not solve cases —
but **responsible technology can help save lives**.


# 🌍 Plataforma OpenLocate

OpenLocate é uma plataforma modular open-source desenvolvida para apoiar **investigações autorizadas de pessoas desaparecidas**, com foco humanitário prioritário em **crianças desaparecidas e combate ao tráfico infantil**.

Este repositório contém a **aplicação frontend (Interface de Gestão de Casos)** e componentes de backend orientados à IA para pesquisa e análise.

---

## ⚠️ Aviso Importante

Este projeto:

* ❌ NÃO é um sistema de vigilância  
* ❌ NÃO realiza identificação automática  
* ❌ NÃO fornece busca facial em bases públicas  
* ❌ NÃO armazena bancos de dados biométricos para rastreamento  

✔ É uma **plataforma controlada, voltada para pesquisa e apoio investigativo**  
✔ Toda análise exige **validação humana e autorização legal**

---

## 🎯 Missão

Milhões de crianças desaparecem todos os anos em todo o mundo.

O OpenLocate foi criado para:

* Apoiar **investigações autorizadas**  
* Auxiliar em **casos de crianças desaparecidas**  
* Contribuir com iniciativas de **combate ao tráfico humano**  
* Fornecer ferramentas de **comparação biométrica transparentes**  
* Promover o uso de IA de forma **ética e consciente em relação à privacidade**

---

## 🧠 Arquitetura do Sistema

O OpenLocate é estruturado em duas camadas principais:

### 🖥 Frontend (este repositório)

* Sistema de gestão de casos  
* Fluxos de investigação  
* Interface de comparação de imagens  
* Logs de auditoria e rastreamento de análises  
* Autenticação segura (camada de interface)

---

### 🤖 Motor de IA / Backend (Python)

Localizado em:

```bash
backend/face-recognition-system/
