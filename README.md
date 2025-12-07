# Flight Data Warehouse & Analytics System
**Advanced Database Course Project - Fall 2025**

---

## Project Overview
A comprehensive data warehouse system to analyze 7 million flight records from 2024 using MS SQL Server. The system consolidates data from four quarterly source databases into a star schema warehouse for flight performance and delay analytics. The project includes a full-stack web application with a FastAPI backend and React frontend that enables query execution and performance comparison between the data warehouse (star schema) and normalized database (3NF).

---

## Technology Stack

### Backend
- **API Framework:** FastAPI 0.104.1
- **Server:** Uvicorn
- **Database:** Microsoft SQL Server
- **Database Driver:** pyodbc 5.0.1
- **Data Validation:** Pydantic 2.5.0

### Frontend
- **Framework:** React 18.2.0
- **UI Library:** Material-UI (MUI) 5.15.0
- **HTTP Client:** Axios 1.6.0
- **Build Tool:** Create React App

### ETL & Data Processing
- **Language:** Python 3.x
- **Libraries:** pyodbc, pandas, numpy
- **Data Source:** Kaggle Flight Dataset (7M records)

---

## Repository Structure
```
Project/
├── .gitignore              # Git ignore rules (node_modules, *.csv, *.log)
├── README.md               # Project documentation
│
├── backend/                # FastAPI/Flask backend application
│   ├── main.py             # Main API server with database connection
│   └── requirements.txt    # Python dependencies
│
├── datasets/               # Data preprocessing utilities
│   ├── split.py            # Script to split dataset into 4 quarters
│   └── test.py             # Validation script to verify quarter splits
│
├── frontend/               # React frontend application
│   ├── package.json        # Node.js dependencies
│   ├── package-lock.json   # Locked dependency versions
│   ├── public/
│   │   └── index.html      # HTML entry point
│   └── src/
│       ├── App.js          # Main application component
│       ├── index.js        # React entry point
│       ├── theme.js        # UI theme configuration
│       ├── components/     # React UI components
│       │   ├── PredefinedQueries.js
│       │   ├── QueryEditor.js
│       │   ├── ResultsTable.js
│       │   └── StatsCards.js
│       ├── services/       # API service layer
│       │   └── api.js      # Backend API calls
│       └── utils/          # Utility functions
│           ├── csvExport.js
│           └── queryValidator.js
│
└── scripts/                # Database and ETL scripts
    ├── Star_Schema.sql     # Data warehouse star schema (fact & dimension tables)
    ├── Table_Creation.sql  # Source database table definitions
    ├── Data_Quality.sql    # Data quality checks and validation rules
    ├── Query.sql           # Ad-hoc analysis queries
    ├── flight_etl_pipeline.py  # Main ETL pipeline orchestration
    └── IMPORT_CSV_FILES.py     # Bulk CSV import utility

```

---

## Database Schema

### Source Databases
4 quarterly databases (`flights_q1_db` - `flights_q4_db`) containing:
- `airlines` table
- `airports` table
- `flights` table (Q1, Q2, Q3, Q4)

### Data Warehouse (Star Schema) - `FlightDataWarehouse`
**Fact Tables:**
- `Fact_FlightPerformance` - Main operational metrics
- `Fact_Delays` - Delay analysis and root causes

**Dimension Tables:**
- `Dim_Date` - Time dimension for date-based analysis
- `Dim_Airline` - Carrier dimension
- `Dim_Airport` - Airport dimension (origin and destination)

### Normalized Database (3NF) - `flight_analytics`
- Tables: `Q1`, `Q2`, `Q3`, `Q4` (quarterly flight data)
- Normalized structure for comparison purposes

---

## Features

### Web Application
- **Database Statistics Dashboard:** Real-time metrics showing total flights, airports, and average delays
- **Predefined Queries:** 4 pre-built analytical queries:
  1. Best Carriers by Route (On-Time Performance)
  2. Delay Cause Breakdown by Carrier
  3. Airports with Most Departure Delays
  4. Complete Carrier Performance Scorecard
- **Custom SQL Query Editor:** Execute custom queries on both databases
- **Performance Comparison:** Side-by-side comparison of query execution times between warehouse and normalized databases
- **Results Visualization:** Interactive data tables with export capabilities
- **Dark Mode:** Toggle between light and dark themes

### API Endpoints

#### Query Execution
- `POST /api/query/warehouse` - Execute query on data warehouse only
- `POST /api/query/normalized` - Execute query on normalized database only
- `POST /api/query/compare` - Execute query on both databases and compare performance

#### Metadata
- `GET /api/query/predefined` - Get all predefined queries
- `GET /api/metrics/database` - Get database statistics
- `GET /` - API health check

---

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Microsoft SQL Server (with SQL Server Express supported)
- ODBC Driver 17 for SQL Server

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure database connection:**
   - Set `SQL_SERVER` environment variable (default: `localhost\SQLEXPRESS`)
   - Ensure databases `FlightDataWarehouse` and `flight_analytics` exist

4. **Start the FastAPI server:**
```bash
python main.py
```
   Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The application will open at `http://localhost:3000`

### Database Setup

1. **Create source databases and load data:**
   - Run `scripts/Table_Creation.sql` to create source database structure
   - Use `scripts/IMPORT_CSV_FILES.py` to import quarterly CSV files

2. **Create data warehouse:**
   - Run `scripts/Star_Schema.sql` to create the warehouse schema
   - Run `scripts/Primary_Key_Indexes.sql` to create indexes

3. **Run ETL pipeline:**
```bash
python scripts/flight_etl_pipeline.py
```

4. **Set up data quality framework:**
   - Run `scripts/Data_Quality.sql` for quarantine tables and metrics

---

## ETL Pipeline
The ETL pipeline (`scripts/flight_etl_pipeline.py`) is a production-grade data integration system with comprehensive data quality controls:

### Extract Phase
- Connects to `flight_analytics` normalized database (3NF)
- Extracts 25 optimized columns from quarterly tables (Q1-Q4)
- Processes data in configurable batches for memory efficiency

### Transform Phase
- **100% Data Validation**: Every record validated against mandatory field requirements (fl_date, origin, dest, carrier, dep_time, arr_time)
- **Data Cleaning**: Handles NULL values, infinity values, and NaN in numeric fields
- **Duplicate Detection**: Identifies duplicates using composite keys (flight date + carrier + flight number + route)
- **Carrier Mapping**: Maps 15 major US airline codes to full names
  - American Airlines (AA), Delta (DL), United (UA), Southwest (WN), JetBlue (B6), Alaska (AS), Spirit (NK), Frontier (F9), and 7 regional carriers
- **Custom Delay Categorization**:
  - On-Time (≤0 min)
  - Minor (1-60 min)
  - Moderate (61-180 min)
  - Severe (>180 min)
- **Quarantine System**: Invalid records isolated with rejection reasons for data quality review
- **Quality Threshold**: Enforces minimum 70% clean data requirement per quarter

### Load Phase
- Batch insert operations (25,000 records per batch) with retry logic
- Populates dimension tables (Date, Airline, Airport)
- Loads fact tables (Flight Performance, Delays)
- Foreign key resolution and integrity validation
- Excludes cancelled flights from performance metrics

### Data Quality Features
- Real-time progress logging with ETA calculations
- Comprehensive metrics tracking (DQ_Metrics table)
- Quarantine audit trail (FlightData_Quarantine table)
- Automatic rollback on quality threshold violations
- Detailed error logging to `etl_pipeline.log`

**Configuration:**
- Batch size: 25,000 records
- Minimum clean data percentage: 70%
- Supports 15 major US airlines
- Processes 25 columns per record
- Handles 7M+ records with robust error handling

---

## API Usage Examples

### Execute Predefined Query
```bash
curl -X POST "http://localhost:8000/api/query/warehouse" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT TOP 10 * FROM Fact_Delays"}'
```

### Compare Database Performance
```bash
curl -X POST "http://localhost:8000/api/query/compare" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT carrier_code, COUNT(*) FROM Fact_Delays GROUP BY carrier_code"}'
```

### Get Database Metrics
```bash
curl "http://localhost:8000/api/metrics/database"
```

---

### Key Contributions

- **Data Preparation & Management**: Processed and split 7M+ record dataset into quarterly CSV files (Q1-Q4), ensuring data integrity and proper formatting for database import
- **Database Architecture**: Designed and implemented 4 quarterly MS SQL Server source databases with normalized schemas, plus star schema data warehouse with fact and dimension tables
- **ETL Pipeline Development**: Built comprehensive Python-based ETL system with modular extraction, transformation, and loading components for automated data warehouse population
- **Star Schema Design**: Created dimensional model with fact tables and slowly changing dimensions, developed ERD documentation, and implemented dimension table population logic
- **Backend Development**: Developed FastAPI server with RESTful endpoints for query execution, database connections, and performance metrics collection
- **Frontend Development**: Built React-based user interface with interactive query builder, real-time results display, and side-by-side performance comparison features
- **Performance Analysis**: Implemented comprehensive performance comparison system to analyze query execution times between source databases and data warehouse
- **Optimization & Quality Assurance**: Applied indexing strategies, query optimization techniques, data quality validation rules, and comprehensive testing procedures
- **DevOps & Documentation**: Managed GitHub repository, version control, data uploads, SQL scripts, and technical documentation for all project components

---

## Performance Features

The system enables direct performance comparison between:
- **Data Warehouse (Star Schema):** Optimized for analytical queries with denormalized structure
- **Normalized Database (3NF):** Traditional normalized structure

The comparison feature shows:
- Execution time for each database
- Speedup factor (how many times faster)
- Improvement percentage
- Time saved in milliseconds

---

## License
This project is developed for educational purposes as part of the Advanced Database Technologies course.

---

## Contact
For questions or issues, please contact Jill Patel - patel7hb@uwindsor.ca
