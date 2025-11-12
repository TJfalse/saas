
Print Service
=============

This is a stub of the print microservice. In production the print-service:
- Exposes an HTTP API to receive print jobs (JSON).
- Forwards print jobs to local print agents on restaurant LAN (via HTTP or MQTT).
- Supports ESC/POS formatting, retries, and status callbacks.

This folder contains a minimal stub and an example Dockerfile to extend.
