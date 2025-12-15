r
# Flight Performance Analytics Data Warehouse

**A dimensional data warehouse achieving 3.2× performance improvement for large-scale flight analytics**

[![Python](https://img.shields.io/badge/Python-3.13.7-blue.svg)](https://www.python.org/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red.svg)](https://www.microsoft.com/sql-server)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)

## 📊 Project Overview

This project transforms 7 million flight records from a normalized 3NF schema into a star schema data warehouse, reducing analytical query execution from 10+ seconds to sub-4-second response times. Built for consumer and research flight analytics including on-time performance, delay analysis, and carrier comparisons.

**Key Metrics:**
- **7,079,081** flight operations processed (Jan-Dec 2024)
- **3.2× average speedup** across benchmark queries
- **98.62%** data quality maintained through automated validation
- **Sub-4-second** response times for complex analytical queries

---

## 🏗️ System Architecture

### Three-Layer Architecture

```
            ┌───────────────────────────────────────────────────┐
            │                   Source Layer                    │
            │          7M+ Raw Flight Records (CSV)             │
            └───────────────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────────────┐
            │                    ETL Layer                      │
            │       Python Pipeline (Extract → Validate →       │
            │           Transform → Quarantine → Load)          │
            └───────────────────────────────────────────────────┘
                                    ↓
            ┌───────────────────────────────────────────────────┐
            │                 Warehouse Layer                   │
            │    Star Schema (2 Fact Tables + 3 Dimensions)     │
            │                 SQL Server 2022                   │
            └───────────────────────────────────────────────────┘
```

### Star Schema Design

**Dimension Tables:**
- `Dim_Date` (366 rows): Temporal dimension with date attributes
- `Dim_Airline` (15 rows): Carrier dimension mapping IATA codes
- `Dim_Airport` (348 rows): Role-playing dimension for origin/destination

**Fact Tables:**
- `Fact_FlightPerformance` (6.98M rows): Operational metrics (times, distance, cancellations)
- `Fact_Delays` (6.98M rows): Delay-specific data with 5 categorized delay types

**Grain:** One row per non-cancelled flight operation

---

## 🚀 Performance Results

### Query Performance Comparison

| Query | Star Schema (ms) | 3NF (ms) | Speedup | Improvement |
|-------|------------------|----------|---------|-------------|
| **Q1: Route Performance** | 3,108 | 9,798 | **3.15×** | 68.3% |
| **Q2: Delay Causes** | 3,127 | 9,979 | **3.19×** | 68.7% |
| **Q3: Airport Rankings** | 2,945 | 9,547 | **3.24×** | 69.2% |
| **Q4: Carrier Scorecard** | 3,039 | 9,625 | **3.17×** | 68.4% |
| **Average** | **3,055** | **9,737** | **3.19×** | **68.6%** |

### Performance Analysis

**Why Star Schema Wins:**
1. **Join Reduction**: Pre-joined dimensions eliminate 3+ runtime joins
2. **Strategic Indexing**: 10+ non-clustered indexes enable O(log n) seeks vs O(n) scans
3. **Pre-Aggregation**: Derived columns computed once during ETL
4. **Query Optimizer**: SQL Server recognizes star patterns for optimized execution plans
5. **Data Locality**: Single fact table vs scattered quarterly partitions

**Q3 (Best Speedup - 3.24×):** Non-clustered index on `origin_airport_key` enables efficient grouping. Normalized schema lacks origin index, forcing full table scans.

---

## 🛠️ Technology Stack

### Backend
- **Database**: SQL Server 2022 with ODBC Driver 17
- **ETL Pipeline**: Python 3.13.7 (pyodbc, pandas, numpy)
- **API**: FastAPI 0.104.1 with Uvicorn ASGI server

### Frontend
- **Framework**: React 18.2.0
- **UI Library**: Material-UI 5.15.0
- **Features**: Interactive query builder, side-by-side comparison, real-time dashboard, CSV export

### Infrastructure
- **Hardware**: Intel i7-12650H, 8GB DDR4 RAM, SSD
- **OS**: Windows 11 Pro

---

## 📦 Installation & Setup

### Prerequisites
```bash
# Required Software
- SQL Server 2022
- Python 3.13+
- Node.js 18+
- Git
```

### 1. Clone Repository
```bash
git clone https://github.com/jill-2105/flight-datawarehouse.git
cd flight-datawarehouse
```

### 2. Database Setup
```bash
# Create databases
sqlcmd -S localhost -Q "CREATE DATABASE FlightWarehouse"
sqlcmd -S localhost -Q "CREATE DATABASE FlightNormalized"

# Run schema scripts
sqlcmd -S localhost -d FlightWarehouse -i sql/star_schema.sql
sqlcmd -S localhost -d FlightNormalized -i sql/normalized_schema.sql
```

### 3. Python Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. ETL Pipeline
```bash
# Download dataset from Kaggle
# https://www.kaggle.com/datasets/hrishitpatil/flight-data-2024

# Run ETL
python etl/extract_load.py
python etl/transform.py
python etl/validate_quality.py
```

### 5. Backend API
```bash
cd backend
uvicorn main:app --reload --port 8000
# API available at http://localhost:8000
```

### 6. Frontend
```bash
cd frontend
npm install
npm start
# Dashboard available at http://localhost:3000
```
---

### 🌐 Quick Links
- **[Live Demo](https://flight-datawarehouse.vercel.app/)** - Interactive dashboard
- **[GitHub Repository](https://github.com/jill-2105/flight-datawarehouse)** - Source code
- **[Dataset Source](https://www.kaggle.com/datasets/hrishitpatil/flight-data-2024)** - Kaggle


**Details:**
- **Time Period**: January 1 - December 31, 2024 (366 days)
- **Total Records**: 7,079,081 flights
- **Clean Records**: 6,981,227 (98.62%)
- **Quarantined**: 97,854 (1.38%)
- **Carriers**: 15 major US airlines
- **Airports**: 348 US airports

**Derived from**: BTS TranStats On-Time Performance monthly CSV files merged and cleaned

---

## 🔧 ETL Pipeline

### Five-Phase Workflow

**Phase 1 - Extract**
- Connect via pyodbc
- Read quarterly partitions with optimized batch sizes

**Phase 2 - Validate**
- 100% row-by-row validation
- Check mandatory fields, data types, duplicates
- 70% quality threshold enforced (achieved 98.62%)

**Phase 3 - Transform**
- NULL handling and type conversions
- Carrier code mapping (15 airlines)
- Delay categorization:
  - On-Time: ≤0 min
  - Minor: 1-60 min
  - Moderate: 61-180 min
  - Severe: >180 min
- Derive computed columns

**Phase 4 - Quarantine**
- Invalid records moved to quarantine table
- Detailed rejection reasons logged
- Critical bug fix: Handle airline code '9E' float parsing issue

**Phase 5 - Load**
- Dimensions loaded first
- Foreign key resolution
- Bulk insert in 25,000-record batches

### Critical Bug Fix
**Issue**: Initial ETL rejected 98% of records due to airline code '9E' (Endeavor Air) interpreted as float 9.0

**Solution**:
```python
dtype={'op_unique_carrier': 'str'}
# Post-read type enforcement
```
**Result**: Data quality improved from ~3% to 98.62%

---

## 📊 Indexing Strategy

### Dimension Tables
- **Clustered Index**: Surrogate key (PK)
- **Non-Clustered**: Natural keys (carrier_code, airport_code), commonly filtered columns

### Fact Tables
**Beyond clustered PK:**
- `(date_key, airline_key)` - Time series analysis
- `(origin_airport_key, dest_airport_key)` - Route analysis
- `(is_delayed)` - Fast filtering
- **Covering Index**: `(airline_key, arrival_delay, carrier_delay, weather_delay, nas_delay, is_delayed)` - Eliminates key lookups, reduces I/O by ~40%

**Trade-offs:**
- 15% storage increase
- 8% slower bulk inserts
- **Benefit**: 3.2× read performance gain with O(log n) seeks vs O(n) scans

---

## 📈 Benchmark Queries

### Q1: Best Carriers by Route
Analyzes on-time performance by route, aggregating across origin, destination, and carrier.

### Q2: Delay Cause Breakdown
Root cause analysis computing averages for 5 delay categories (carrier, weather, NAS, security, late aircraft).

### Q3: Airport Departure Delays
Ranks airports by departure delay frequency using conditional aggregations.

### Q4: Complete Carrier Scorecard
Most complex query with 10+ aggregations including total flights, delay rates, and average delays.

---

## ⚠️ Limitations & Future Work

### Current Limitations
1. **Static Batch Processing**: 15-20 minute full refresh, no real-time updates
2. **Single-Year Dataset**: Only 2024 data, prevents year-over-year analysis
3. **RAM Constraints**: 8GB requires careful batch sizing (25K records)
4. **Missing Features**: Geographic analysis, columnstore indexes, result pagination for 10K+ rows

### Planned Enhancements

**Immediate (Q1 2025):**
- Incremental ETL using SQL Server CDC (17 min → <2 min)
- Multi-year historical data integration (5 years ≈ 35M rows)
- Columnstore indexes (2-5× additional gain)

**Medium-term (Q2 2025):**
- Flight delay prediction using XGBoost on warehouse-aggregated features
- React Native mobile app with Redis caching (target: <500ms response)
- Monthly table partitioning with partition switching for 5-year retention

**Long-term (Q3 2025):**
- Performance comparison vs Snowflake/Redshift using TPC-DS workloads
- Real-time streaming ETL with Kafka + Spark
- Geographic dimension for regional analysis

---

## 🎯 Key Learnings

1. **Dimensional modeling delivers tangible benefits**: 3.2× speedup validates star schema for analytical workloads
2. **Data quality is critical**: 100% validation caught subtle bugs (float parsing) that would corrupt analysis
3. **Strategic indexing matters**: Covering indexes eliminated 40% I/O overhead
4. **Trade-offs are acceptable**: 15% storage + 8% insert overhead justified by 68.6% query time reduction
5. **Lessons applicable beyond aviation**: Architecture patterns transferable to any domain requiring historical data analysis

---

## 📚 References

- Kimball, R., & Ross, M. (2013). *The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling* (3rd ed.). Wiley.
- Transaction Processing Performance Council. (2023). *TPC-H Benchmark Specification*. http://www.tpc.org/tpch/
- Microsoft Corporation. (2022). *SQL Server 2022 Performance Tuning Guide*. https://docs.microsoft.com/en-us/sql/relational-databases/performance/

---

## 👥 Authors

**Jill Girishkumar Patel** - Lead Developer  
Computer Science, University of Windsor  
📧 patel7hb@uwindsor.ca  
🔗 [GitHub](https://github.com/jill-2105)

**Team Members:**
- Dipesh Raj Joshi (joshid@uwindsor.ca)
- Kamraan Ahmed (ahmed11@uwindsor.ca)
- Monisha Thandavamoorthy (thandav1@uwindsor.ca)

---

## 📄 License

This project is available for academic and educational use. For commercial use, please contact the authors.

---

## 🙏 Acknowledgments

- Dataset: [Hrishit Patil - Kaggle Flight Data 2024](https://www.kaggle.com/datasets/hrishitpatil/flight-data-2024)
- Data Source: Bureau of Transportation Statistics (BTS) TranStats
- Methodology: Kimball Dimensional Modeling Framework

---

**⭐ If this project helped your research or learning, please consider starring the repository!**