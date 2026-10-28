#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then python3 serve.py; else echo "Python 3 is needed. Install it from python.org, or put this folder online with app.netlify.com/drop (see README.txt)."; read -n 1; fi
