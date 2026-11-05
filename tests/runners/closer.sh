#!/bin/bash
while true; do curl -s -X POST http://127.0.0.1:5005 -d '{"method":"ledger_accept","params":[{}]}' >/dev/null; sleep ${CLOSE:-2}; done
