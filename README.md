# Flight Data Warehouse & Analytics System
**Advanced Database Course Project - Fall 2025**  
**Team:** Jill, Dipesh, Kamraan, Monisha

---

## Project Overview
Building a data warehouse to analyze 7 million flight records from 2024 using MS SQL Server and a Python ETL pipeline. The system consolidates data from four quarterly source databases into a star schema warehouse for flight performance and delay analytics.

---

## Technology Stack
- **Database:** Microsoft SQL Server
- **ETL Development:** Python 3.x (pyodbc, pandas)
- **Data Source:** Kaggle Flight Dataset (7M records)

---

## Repository Structure
```
/src/database        # MS SQL Server scripts
/src/etl             # Python ETL pipeline modules
/src/utils           # Data processing utilities
/data                # Quarterly CSV datasets
/docs                # Architecture diagrams, ERD
```

---

## Database Schema
**Source Databases:** 4 quarterly databases (flights_q1_db - flights_q4_db) containing airlines, airports, and flights tables

**Data Warehouse (Star Schema):**
- **Fact Table:** fact_flights
- **Dimensions:** dim_date, dim_time, dim_airline, dim_airport, dim_route

---

## Getting Started

### Setup Steps
1. **Prepare datasets**
```bash
   python src/utils/split_dataset.py
```

2. **Create source databases**
```sql
   -- Run in SQL Server
   :r src/database/create_q1_db.sql
   :r src/database/create_q2_db.sql
   :r src/database/create_q3_db.sql
   :r src/database/create_q4_db.sql
```

3. **Create warehouse**
```sql
   :r src/database/warehouse_schema.sql
```

4. **Run ETL pipeline**
```bash
   python src/etl/etl_pipeline.py
```

---

## ETL Pipeline
- **extract.py** - Connects to quarterly databases and extracts data
- **transform.py** - Cleans, validates, and transforms data
- **load.py** - Batch loads data into warehouse
- **etl_pipeline.py** - Main orchestrator

---
