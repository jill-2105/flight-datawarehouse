# Flight Data Warehouse & Analytics System
**Advanced Database Course Project - Fall 2025**  
**Team:** Jill, Dipesh, Kamraan, Monisha

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
├── backend/                 # FastAPI backend application
│   ├── main.py             # Main API server with endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── App.js          # Main application component
│   │   ├── components/     # React components
│   │   │   ├── PredefinedQueries.js
│   │   │   ├── QueryEditor.js
│   │   │   ├── ResultsTable.js
│   │   │   └── StatsCards.js
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   └── utils/          # Utility functions
│   │       ├── csvExport.js
│   │       └── queryValidator.js
│   └── package.json
├── scripts/                # Database and ETL scripts
│   ├── Star_Schema.sql     # Data warehouse schema
│   ├── Table_Creation.sql  # Source database tables
│   ├── Primary_Key_Indexes.sql
│   ├── Data_Quality.sql    # Data quality framework
│   ├── flight_etl_pipeline.py  # ETL pipeline
│   └── IMPORT_CSV_FILES.py
├── datasets/               # Source data files
│   ├── 2024_Q1.csv
│   ├── 2024_Q2.csv
│   ├── 2024_Q3.csv
│   ├── 2024_Q4.csv
│   └── flight_data_2024.csv
└── README.md
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

The ETL pipeline (`scripts/flight_etl_pipeline.py`) performs:
- **Extract:** Reads data from normalized source database (`flight_analytics`)
- **Transform:** 
  - Data cleaning and validation
  - Handles invalid float values (infinity/NaN)
  - Maps carrier codes to airline names
  - Data quality checks with quarantine support
- **Load:** Batch loads data into warehouse fact and dimension tables

**Configuration:**
- Batch size: 25,000 records
- Minimum clean data percentage: 70%
- Supports 15 major US airlines

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

## Project Status

| Task | Description | Status |
|------|-------------|--------|
| Data Preparation | Split 7M dataset into Q1-Q4 CSVs | ✅ Completed |
| Source Databases | Create 4 quarterly MS SQL Server databases | ✅ Completed |
| Warehouse Design | Design star schema, create warehouse, populate dimensions | ✅ Completed |
| ETL Pipeline | Build extraction, transformation, loading modules | ✅ Completed |
| Backend API | FastAPI server with query execution endpoints | ✅ Completed |
| Frontend Application | React UI with query interface and comparison | ✅ Completed |
| Performance Comparison | Side-by-side database performance analysis | ✅ Completed |
| Optimization | Indexing, query optimization, data validation | ✅ Completed |

---

## Team Contributions

**Jill**
- Dataset splitting and preparation
- ETL pipeline development (extraction and loading modules)
- GitHub repository setup and data uploads
- Backend API development

**Dipesh**
- Dataset splitting and preparation support
- ETL pipeline development (transformation module)
- Data quality validation logic
- Frontend development

**Kamraan**
- Source database creation and schema design
- Star schema ERD design for warehouse
- Dimension table population
- Database optimization

**Monisha**
- Source database creation and data loading
- Warehouse database setup and schema implementation
- Dimension table population and data validation
- Testing and documentation

---

## Key Deliverables

- ✅ 4 quarterly database scripts and data import utilities
- ✅ Warehouse schema (Star_Schema.sql, Primary_Key_Indexes.sql)
- ✅ ETL pipeline (flight_etl_pipeline.py)
- ✅ Data quality framework (Data_Quality.sql)
- ✅ FastAPI backend with comprehensive query endpoints
- ✅ React frontend with interactive query interface
- ✅ Performance comparison system
- ✅ Star schema ERD and architecture documentation

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
For questions or issues, please contact the project team members.
