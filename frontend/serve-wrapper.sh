#!/bin/bash
# Wrapper for serve — always add -s flag for SPA fallback
exec npx serve -s "$@"
