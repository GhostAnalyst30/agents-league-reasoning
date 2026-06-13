# CertPilot — 5-Minute Pitch

> **Microsoft Agents League · Battle #2: Reasoning Agents**  
> Estimated duration: **~5 minutes** (~650 words per language at conversational pace)

---

## Timing Guide

| Section | Time | EN | ES |
|---------|------|----|----|
| Hook & problem | 0:00 – 1:00 | Opening | Apertura |
| Solution & demo | 1:00 – 2:30 | What CertPilot is | Qué es CertPilot |
| Architecture | 2:30 – 3:30 | How it works | Cómo funciona |
| Differentiators | 3:30 – 4:30 | Why it wins | Por qué destaca |
| Close | 4:30 – 5:00 | Call to action | Cierre |

---

# English Version

## Opening — The Problem (0:00 – 1:00)

**Imagine this:** Your company just spent $2 million on a cloud certification program. Six months later, completion rate? **23%.**

Sound familiar?

Every enterprise faces the same three failures:

1. **Generic study plans** that ignore the fact your engineer has 22 hours of meetings per week.
2. **No feedback loop** after practice exams — learners fail, feel alone, and quit.
3. **Managers flying blind** — zero visibility into who is actually exam-ready.

The result? Wasted budget, frustrated teams, and certifications that never translate into real capability.

**Today, I want to show you CertPilot — and why we believe it fixes all three at once.**

---

## The Solution — Meet CertPilot (1:00 – 2:00)

CertPilot is a **multi-agent reasoning system** that takes an employee from *"I want to get certified"* to **exam-ready** — with every recommendation grounded in approved knowledge, every plan validated against business rules, and every answer **gated by a critic before it ships**.

This is not a chatbot with a certification skin.

This is **six specialized AI agents** working as a team, sharing one grounded brain, orchestrated by the **Microsoft Agent Framework** and **Microsoft Foundry**.

When a learner asks for help, CertPilot does not guess. It **reasons**, **retrieves**, **plans**, **assesses**, and **verifies** — in a live pipeline you can watch in real time.

---

## Live Demo Narrative (2:00 – 2:30)

Picture learner **L-1001**: a Cloud Engineer targeting **AZ-204**, averaging 67% on practice exams, with only 4 hours of study capacity per week.

You select them in the web app. Six agents activate in sequence:

| Stage | Agent | What it does |
|-------|-------|--------------|
| 1 | **Learning Path Curator** | Maps skills → approved study sequence, cited from enterprise docs |
| 2 | **Study Plan Generator** | Builds a week-by-week plan that **never exceeds** computed capacity |
| 3 | **Engagement Agent** | Schedules reminders around real meeting load — not over busy windows |
| 4 | **Assessment Agent** | Delivers a readiness verdict using the 75% gate from official policy |
| 5 | **Manager Insights** | Shows team-level aggregates only — no individual score leaks |
| 6 | **Critic Agent** | Reviews the full transcript. Violations? Send it back. Clean? Approve. |

In our tests, the Critic caught a rule violation in round one — and approved only after revision in round two. **That is production-grade AI, not a demo trick.**

---

## How It Works — The Architecture (2:30 – 3:30)

Three layers make CertPilot enterprise-ready:

### 1. Foundry IQ — The Grounding Layer
Four synthetic enterprise documents — certification guide, assessment policy, quarterly learning report, workload insights — are ingested into a **Knowledge Base** on Azure AI Search. Agents retrieve through the native **MCP endpoint** and must preserve `[ref_id:N]` citations. An uncited claim gets **rejected**.

### 2. Semantic Layer — Business Rules That Stick
A certification ontology defines roles, skills, prerequisites, and five enforceable rules:

- **BR-001:** 75%/78% practice-score gates before booking exams  
- **BR-002/004:** Study plans capped by real weekly capacity  
- **BR-003:** No Expert cert without prerequisites  
- **BR-005:** Managers see aggregates only — privacy by design  

These are not prompts. They are **code-level constraints** agents must obey.

### 3. The Critic Gate — Trust Before Output
Every multi-agent run passes through a **Critic Agent** that returns a structured JSON verdict: approve or revise. This is our answer to the #1 enterprise question about AI: *"How do I know I can trust this?"*

We also ship a **self-evaluation harness** that scores groundedness, task adherence, rule compliance, and citation coverage — with auto-correction on failure.

---

## Why CertPilot Wins (3:30 – 4:30)

| What others do | What CertPilot does |
|----------------|---------------------|
| Single chatbot, one persona | **Six specialized reasoning agents** with clear responsibilities |
| Answers from model memory | **Foundry IQ retrieval** with mandatory citations |
| Soft policy in prompts | **Hard business rules** enforced in tools + Critic |
| Ship and hope | **Eval harness + Critic gate** before anything reaches the user |
| Manager dashboards with PII risk | **Aggregate-only insights** (BR-005) |

Built on **Microsoft Agent Framework**, **Foundry**, and **Azure AI Search** — not a wrapper around a generic API. Deployable locally, via web UI, or as a **hosted agent on Foundry Agent Service** with `azd up`.

All data is synthetic. No real employee data anywhere. Production patterns, zero privacy risk in the demo.

---

## Closing — The Ask (4:30 – 5:00)

Enterprises do not fail at certifications because people lack motivation.

They fail because **the system around the learner is broken** — generic, ungrounded, and unaccountable.

**CertPilot** replaces that broken system with specialized agents that share one grounded brain, enforce real business rules, and earn trust through a critic gate and measurable evals.

> *From "I want to get certified" to exam-ready — grounded, validated, and approved.*

**Thank you.** Happy to run a live pipeline or walk through the architecture.

---

### Speaker Notes (EN)

- **0:00** — Pause after "23%." Let the number land.
- **1:15** — Emphasize "six agents, not one chatbot."
- **2:15** — If demo available, switch to Pipeline view for L-1001.
- **3:00** — Show `[ref_id:N]` citation in Critic screenshot (`img/image2.png`).
- **4:00** — Mention `python run.py` for one-command launch.
- **4:45** — End with energy. Do not rush the closing line.

---

---

# Versión en Español

## Apertura — El Problema (0:00 – 1:00)

**Imaginen esto:** Su empresa acaba de invertir 2 millones de dólares en un programa de certificaciones cloud. ¿Tasa de finalización seis meses después? **23%.**

¿Les suena?

Toda empresa enfrenta los mismos tres fallos:

1. **Planes de estudio genéricos** que ignoran que su ingeniero tiene 22 horas de reuniones por semana.
2. **Sin retroalimentación** después de los exámenes de práctica — el empleado reprueba, se siente solo y abandona.
3. **Managers a ciegas** — cero visibilidad sobre quién está realmente listo para el examen.

¿El resultado? Presupuesto desperdiciado, equipos frustrados y certificaciones que nunca se traducen en capacidad real.

**Hoy quiero mostrarles CertPilot — y por qué creemos que resuelve los tres problemas a la vez.**

---

## La Solución — Conozcan CertPilot (1:00 – 2:00)

CertPilot es un **sistema multi-agente de razonamiento** que lleva a un empleado de *"quiero certificarme"* a **listo para el examen** — con cada recomendación fundamentada en conocimiento aprobado, cada plan validado contra reglas de negocio, y cada respuesta **filtrada por un crítico antes de llegar al usuario**.

Esto no es un chatbot con apariencia de certificación.

Son **seis agentes de IA especializados** trabajando en equipo, compartiendo un cerebro fundamentado, orquestados con **Microsoft Agent Framework** y **Microsoft Foundry**.

Cuando un learner pide ayuda, CertPilot no adivina. **Razona**, **recupera**, **planifica**, **evalúa** y **verifica** — en un pipeline en vivo que pueden observar en tiempo real.

---

## Narrativa de Demo en Vivo (2:00 – 2:30)

Tomen al learner **L-1001**: Cloud Engineer con objetivo **AZ-204**, promedio de 67% en práctica, y solo 4 horas de capacidad de estudio por semana.

Lo seleccionan en la web. Seis agentes se activan en secuencia:

| Etapa | Agente | Qué hace |
|-------|--------|----------|
| 1 | **Learning Path Curator** | Mapea habilidades → secuencia aprobada, citando documentos empresariales |
| 2 | **Study Plan Generator** | Plan semanal que **nunca excede** la capacidad calculada |
| 3 | **Engagement Agent** | Recordatorios alineados a la carga real de reuniones |
| 4 | **Assessment Agent** | Veredicto de readiness con el umbral del 75% de la política oficial |
| 5 | **Manager Insights** | Métricas agregadas del equipo — sin filtrar puntajes individuales |
| 6 | **Critic Agent** | Revisa todo el transcript. ¿Violaciones? Devuelve. ¿Limpio? Aprueba. |

En nuestras pruebas, el Critic detectó una violación en la ronda uno — y aprobó solo tras la revisión en la ronda dos. **Eso es IA de nivel producción, no un truco de demo.**

---

## Cómo Funciona — La Arquitectura (2:30 – 3:30)

Tres capas hacen a CertPilot listo para empresa:

### 1. Foundry IQ — La Capa de Grounding
Cuatro documentos empresariales sintéticos — guía de certificación, política de evaluación, reporte trimestral, insights de carga de trabajo — se ingieren en una **Knowledge Base** en Azure AI Search. Los agentes recuperan vía **MCP** y deben preservar citas `[ref_id:N]`. Una afirmación sin cita es **rechazada**.

### 2. Capa Semántica — Reglas de Negocio Reales
Una ontología define roles, habilidades, prerrequisitos y cinco reglas ejecutables:

- **BR-001:** Umbrales 75%/78% antes de reservar exámenes  
- **BR-002/004:** Planes limitados por capacidad semanal real  
- **BR-003:** Sin certificación Expert sin prerrequisitos  
- **BR-005:** Managers ven solo agregados — privacidad por diseño  

No son prompts. Son **restricciones a nivel código** que los agentes deben cumplir.

### 3. La Puerta del Crítico — Confianza Antes del Output
Cada ejecución multi-agente pasa por un **Critic Agent** que devuelve un veredicto JSON: aprobar o revisar. Es nuestra respuesta a la pregunta #1 de las empresas sobre IA: *"¿Cómo sé que puedo confiar en esto?"*

También incluimos un **harness de auto-evaluación** que puntúa groundedness, adherencia a la tarea, cumplimiento de reglas y cobertura de citas — con auto-corrección si falla.

---

## Por Qué CertPilot Destaca (3:30 – 4:30)

| Lo que otros hacen | Lo que hace CertPilot |
|--------------------|------------------------|
| Un solo chatbot | **Seis agentes de razonamiento** con responsabilidades claras |
| Respuestas de memoria del modelo | **Retrieval con Foundry IQ** y citas obligatorias |
| Políticas blandas en prompts | **Reglas de negocio duras** en herramientas + Critic |
| Publicar y cruzar los dedos | **Evals + Critic gate** antes de llegar al usuario |
| Dashboards con riesgo de PII | **Insights solo agregados** (BR-005) |

Construido sobre **Microsoft Agent Framework**, **Foundry** y **Azure AI Search** — no un wrapper de API genérica. Desplegable localmente, vía web UI, o como **agente hospedado en Foundry Agent Service** con `azd up`.

Todos los datos son sintéticos. Cero datos reales de empleados. Patrones de producción, cero riesgo de privacidad en la demo.

---

## Cierre — El Mensaje Final (4:30 – 5:00)

Las empresas no fallan en certificaciones porque la gente no tenga motivación.

Fallan porque **el sistema alrededor del learner está roto** — genérico, sin fundamento y sin rendición de cuentas.

**CertPilot** reemplaza ese sistema con agentes especializados que comparten un cerebro fundamentado, aplican reglas de negocio reales y ganan confianza mediante un critic gate y evals medibles.

> *De "quiero certificarme" a listo para el examen — fundamentado, validado y aprobado.*

**Gracias.** Con gusto ejecuto un pipeline en vivo o recorro la arquitectura con ustedes.

---

### Notas para el Presentador (ES)

- **0:00** — Pausa después del "23%." Deja que el número impacte.
- **1:15** — Enfatiza "seis agentes, no un chatbot."
- **2:15** — Si hay demo, cambia a la vista Pipeline con L-1001.
- **3:00** — Muestra una cita `[ref_id:N]` en la captura del Critic (`img/image2.png`).
- **4:00** — Menciona `python run.py` para arrancar todo con un comando.
- **4:45** — Cierra con energía. No apresures la frase final.

---

---

# Quick Reference — Key Numbers & Facts

| Fact | Value |
|------|-------|
| Agents | 6 (Curator, Planner, Engagement, Assessor, Manager Insights, Critic) |
| Business rules | BR-001 through BR-005 |
| Knowledge docs | 4 synthetic enterprise documents |
| Synthetic learners | 8 profiles with work signals |
| Practice pass gate | 75% (Associate) / 78% (Expert) |
| Launch command | `python run.py` |
| Web URL | http://127.0.0.1:8000 |
| League | Microsoft Agents League — Battle #2: Reasoning Agents |

---

# Optional Slides Outline (10 slides)

1. **Title** — CertPilot: Reasoning Agents for Enterprise Certification  
2. **The Problem** — $2M spent, 23% completion, three failure modes  
3. **The Vision** — From intent to exam-ready, grounded and governed  
4. **Six Agents** — Pipeline diagram (use `img/image1.png`)  
5. **Foundry IQ** — Knowledge base + MCP + citations  
6. **Business Rules** — BR-001..BR-005 table  
7. **Critic Gate** — Revision loop screenshot (`img/image2.png`)  
8. **Self-Evals** — Dashboard screenshot (`img/image3.png`)  
9. **Privacy** — Team aggregates only (`img/image4.png`)  
10. **Close** — Tagline + repo + live demo invite  
