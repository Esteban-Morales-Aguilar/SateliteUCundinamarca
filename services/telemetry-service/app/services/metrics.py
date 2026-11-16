from prometheus_client import Counter, Gauge, Histogram

HTTP_REQS = Counter("http_requests_total", "Total de peticiones", ["method", "route", "status"])
HTTP_LAT = Histogram("http_request_duration_seconds", "Latencia", ["method", "route", "status"])
PACKETS = Counter("telemetry_packets_total", "Paquetes de telemetría recibidos")
ALT = Gauge("telemetry_altitude_meters", "Altitud (m)")
RSSI = Gauge("telemetry_rssi_dbm", "RSSI (dBm)")
SNR = Gauge("telemetry_snr_db", "SNR (dB)")
WS_CLIENTS = Gauge("telemetry_ws_clients", "Clientes WebSocket conectados")
