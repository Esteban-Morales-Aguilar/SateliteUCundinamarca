CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(), end_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS telemetry (
  time TIMESTAMPTZ NOT NULL, mission_id TEXT NOT NULL,
  altitude DOUBLE PRECISION, temperature DOUBLE PRECISION, pressure DOUBLE PRECISION, humidity DOUBLE PRECISION,
  latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, rssi DOUBLE PRECISION, snr DOUBLE PRECISION, pdr DOUBLE PRECISION,
  source TEXT, cpu_temp DOUBLE PRECISION, wifi_rssi DOUBLE PRECISION, cpu_usage DOUBLE PRECISION, memory_usage DOUBLE PRECISION);
SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_telemetry_mission_time ON telemetry (mission_id, time DESC);
ALTER TABLE telemetry SET (timescaledb.compress, timescaledb.compress_segmentby = 'mission_id');
SELECT add_compression_policy('telemetry', INTERVAL '7 days', if_not_exists => TRUE);
SELECT add_retention_policy('telemetry', INTERVAL '90 days', if_not_exists => TRUE);
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_5min WITH (timescaledb.continuous) AS
SELECT time_bucket('5 minutes', time) AS bucket, mission_id,
  avg(altitude) AS altitude, avg(temperature) AS temperature, avg(pressure) AS pressure,
  avg(humidity) AS humidity, avg(rssi) AS rssi, avg(snr) AS snr, avg(pdr) AS pdr
FROM telemetry GROUP BY bucket, mission_id WITH NO DATA;
SELECT add_continuous_aggregate_policy('telemetry_5min', start_offset => INTERVAL '1 day',
  end_offset => INTERVAL '5 minutes', schedule_interval => INTERVAL '5 minutes', if_not_exists => TRUE);
INSERT INTO missions (id, name, description, status)
VALUES ('ESTRATOSAT-TELCO-01', 'ESTRATOSAT-TELCO', 'Misión educativa HAB - Universidad de Cundinamarca', 'active')
ON CONFLICT DO NOTHING;
INSERT INTO missions (id, name, description, status)
VALUES ('ESTRATOSAT-SIM-01', 'ESTRATOSAT-TELCO', 'Misión educativa HAB - Universidad de Cundinamarca (simulada)', 'active')
ON CONFLICT DO NOTHING;
