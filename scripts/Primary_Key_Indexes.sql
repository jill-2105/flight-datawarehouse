USE flight_analytics;
GO

-- Step 1: Add Primary Key columns to each quarterly table
-- Add flight_id as surrogate key to Q1
ALTER TABLE Q1
ADD flight_id INT IDENTITY(1,1) NOT NULL;
GO

ALTER TABLE Q1
ADD CONSTRAINT PK_Q1 PRIMARY KEY CLUSTERED (flight_id);
GO

-- Add flight_id as surrogate key to Q2
ALTER TABLE Q2
ADD flight_id INT IDENTITY(1,1) NOT NULL;
GO

ALTER TABLE Q2
ADD CONSTRAINT PK_Q2 PRIMARY KEY CLUSTERED (flight_id);
GO

-- Add flight_id as surrogate key to Q3
ALTER TABLE Q3
ADD flight_id INT IDENTITY(1,1) NOT NULL;
GO

ALTER TABLE Q3
ADD CONSTRAINT PK_Q3 PRIMARY KEY CLUSTERED (flight_id);
GO

-- Add flight_id as surrogate key to Q4
ALTER TABLE Q4
ADD flight_id INT IDENTITY(1,1) NOT NULL;
GO

ALTER TABLE Q4
ADD CONSTRAINT PK_Q4 PRIMARY KEY CLUSTERED (flight_id);
GO

-- Step 2: Create Non-Clustered Indexes for Query Performance
-- These indexes will help with JOIN operations in benchmark queries

-- Indexes on Q1
CREATE NONCLUSTERED INDEX IX_Q1_FlightDate ON Q1(fl_date);
CREATE NONCLUSTERED INDEX IX_Q1_Origin ON Q1(origin);
CREATE NONCLUSTERED INDEX IX_Q1_Dest ON Q1(dest);
CREATE NONCLUSTERED INDEX IX_Q1_Carrier ON Q1(op_unique_carrier);
CREATE NONCLUSTERED INDEX IX_Q1_Origin_Dest ON Q1(origin, dest);
GO

-- Indexes on Q2
CREATE NONCLUSTERED INDEX IX_Q2_FlightDate ON Q2(fl_date);
CREATE NONCLUSTERED INDEX IX_Q2_Origin ON Q2(origin);
CREATE NONCLUSTERED INDEX IX_Q2_Dest ON Q2(dest);
CREATE NONCLUSTERED INDEX IX_Q2_Carrier ON Q2(op_unique_carrier);
CREATE NONCLUSTERED INDEX IX_Q2_Origin_Dest ON Q2(origin, dest);
GO

-- Indexes on Q3
CREATE NONCLUSTERED INDEX IX_Q3_FlightDate ON Q3(fl_date);
CREATE NONCLUSTERED INDEX IX_Q3_Origin ON Q3(origin);
CREATE NONCLUSTERED INDEX IX_Q3_Dest ON Q3(dest);
CREATE NONCLUSTERED INDEX IX_Q3_Carrier ON Q3(op_unique_carrier);
CREATE NONCLUSTERED INDEX IX_Q3_Origin_Dest ON Q3(origin, dest);
GO

-- Indexes on Q4
CREATE NONCLUSTERED INDEX IX_Q4_FlightDate ON Q4(fl_date);
CREATE NONCLUSTERED INDEX IX_Q4_Origin ON Q4(origin);
CREATE NONCLUSTERED INDEX IX_Q4_Dest ON Q4(dest);
CREATE NONCLUSTERED INDEX IX_Q4_Carrier ON Q4(op_unique_carrier);
CREATE NONCLUSTERED INDEX IX_Q4_Origin_Dest ON Q4(origin, dest);
GO

PRINT 'Normalized database setup complete with PKs and Indexes!';
GO
