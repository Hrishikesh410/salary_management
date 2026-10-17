# Employee Salary Management — Product Requirements Document (PRD)

**Target User:** Global HR Manager managing compensation across distributed international teams  
**Dataset Scale:** 10,000 employees distributed across multiple countries and departments  
**Stack:** React + TypeScript (Vite), Node.js + Express + TypeScript, PostgreSQL + Prisma ORM  

---

## 1. Problem Statement & Target User
Managing compensation across 10,000 international employees via spreadsheets causes slow lookups, concurrency errors, and financial inaccuracies—specifically invalid cross-currency aggregations. The **Global HR Manager** requires a centralized, high-performance web dashboard to search, filter, sort, and update salaries, while reviewing accurate compensation summaries by country and department without currency distortion.

---

## 2. Product Goals & Measurable Acceptance Criteria
* **G1: Sub-Second Data Exploration (10k Scale):** HR Manager can search, filter, sort, and paginate through 10,000 records without perceptible UI lag.
  * *Acceptance Criteria:* API P95 response time < 200ms on indexed columns; UI table render/transition < 300ms.
* **G2: Monetary Precision & Integrity:** Salary updates validate strictly with zero floating-point rounding drift.
  * *Acceptance Criteria:* Stored as `DECIMAL(12,2)`; inputs strictly positive (`0.01` to `999,999,999.99`); currency code is immutable during salary updates.
* **G3: Strict Currency-Isolated Analytics:** Aggregations never mix disparate currencies.
  * *Acceptance Criteria:* Summaries aggregate strictly by `(Country, Currency)` and `(Department, Currency)`. Totals and averages across different currencies without conversion are strictly prohibited.
* **G4: Reproducible Assessment Verification:**
  * *Acceptance Criteria:* An automated Prisma seed script deterministically populates 10,000 realistic employee records across ≥ 5 countries and departments for instant evaluation.

---

## 3. Prioritized Functional Requirements

### P0 (MVP — Core Workflows)
* **FR-1: Search, Filter, Sort & Server-Side Pagination**
  * **Search:** Case-insensitive search on employee name and email (debounced at 300ms on frontend).
  * **Filter:** Dropdowns for Country, Department, and Currency (supports single or combined filtering).
  * **Sorting:** Server-side sorting by Name, Department, Country, or Salary (Ascending / Descending).
  * **Pagination:** Server-side pagination (default: 25; selectable: 50, 100); returns `data`, `totalCount`, `page`, `totalPages`.
* **FR-2: Salary Inspection & Inline/Modal Updating**
  * **View Details:** Name, Job Title, Department, Country, Base Salary, Currency (ISO 4217), and Last Updated.
  * **Edit Salary:** HR can update salary amount. Validation: `0.01 <= amount <= 999,999,999.99` with max 2 decimal places.
  * **Currency Immutability:** Currency code is strictly read-only during salary edit to prevent contract distortion.
  * **Feedback:** Instant feedback with success toast and immediate UI update; explicit error messaging on failed validation.
* **FR-3: Multi-Currency Salary Summaries (Database-Aggregated)**
  * Aggregated views broken down strictly by `Country + Currency` and `Department + Currency`.
  * Metrics computed at DB level (SQL `GROUP BY`): Headcount, Total Spend, Average Salary, Min Salary, Max Salary.
  * Display: Clear badge/label indicator for each currency bucket (e.g., `Germany — EUR`, `Germany — USD`).
* **FR-4: Deterministic 10,000-Record Seeding**
  * CLI/Prisma seed command generating 10,000 realistic records across ≥ 5 countries (e.g., US, DE, UK, IN, JP) and currencies (USD, EUR, GBP, INR, JPY).

### P1 (Post-MVP Enhancements)
* Audit log tracking historical salary changes (`employeeId`, `previousSalary`, `newSalary`, `changedAt`).
* CSV export of filtered employee listings and summary tables.

### P2 (Future Roadmap)
* Centralized FX conversion table to toggle optional "Normalized USD Equivalent" global spend overview.
* Batch salary adjustments (e.g., departmental merit increases).

---

## 4. Non-Functional Requirements & Verification

| Requirement | Metric / Standard | Verification Method |
| :--- | :--- | :--- |
| **Query Performance** | DB execution < 50ms on 10k indexed records; API P95 < 200ms. | Database indexing (`country`, `department`, `name`); Supertest/k6 benchmark. |
| **Data Precision** | Exact decimal arithmetic; no IEEE-754 floating-point drift. | PostgreSQL `DECIMAL(12,2)` / Prisma `Decimal`; unit tests with fractional cents. |
| **Frontend Performance** | Zero jank; clean layout under 300ms; Lighthouse > 90. | Debounced search input; server-side pagination; component tests with Vitest. |
| **Code Craft & Testing** | Strict TypeScript; automated unit & integration coverage. | TypeScript strict mode; automated test suite covering API endpoints and aggregation edge cases. |

---

## 5. Assumptions & Decisions Requiring Approval

### Explicit Assumptions
1. **Single Contract Currency:** Each employee has exactly one primary compensation currency matching their employment contract.
2. **No Dynamic FX in MVP:** Without an authoritative live FX feed, summaries group by `(Dimension, Currency)`.
3. **Single HR Persona (No Auth in MVP):** Assessment context assumes an internal administrative network session.
4. **Immediate Effect:** Salary changes take effect immediately upon submission.

### Decisions Requiring Approval
1. **Multi-Currency UI Display:** Confirm grouped rows/cards by `(Country, Currency)` and `(Department, Currency)` are preferred over introducing a hardcoded reference exchange rate.
2. **Audit Logging in MVP:** Confirm whether updating `updatedAt` on `Employee` is sufficient for MVP, or if a dedicated `SalaryAuditLog` table should be included.
3. **Pagination Default:** Confirm default page size of 25 items (with 50/100 options).

---

## 6. Explicitly Excluded Features & Scope Trade-offs

* **Authentication & RBAC:** Omitted to focus on performance, data modeling, and currency integrity. *Trade-off:* API is unauthenticated; suited for assessment / VPN-internal deployment.
* **Payroll Processing & Tax Withholdings:** Omitted. Application is a compensation directory and budgeting tool, not a payroll execution system.
* **Employee Self-Service:** Omitted. Exclusively built for the HR Manager workflow.
* **Automated Cross-Currency Sums:** Omitted. Summing or averaging disparate currencies without verified rates violates financial compliance.

---

## 7. Risks & MVP Limitations

* **Currency Fragmentation:** Departments with employees in diverse countries/currencies will display multiple summary rows rather than a single unified spend figure.
* **Concurrent Edits:** In MVP without optimistic concurrency checks (`version` lock), simultaneous edits follow last-write-wins.
* **Network Latency on 10k Scale:** Mitigated by mandatory server-side pagination, indexed queries, and debounced search.
