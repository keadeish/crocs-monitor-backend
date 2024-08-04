# Crocs Stock Checker

## Overview

A Node.js script to scrape the Crocs website for item availability and stock status. This script searches for specific items on the Crocs UK website and notifies you if they come in stock. It uses Puppeteer for web scraping and Discord Webhooks for notifications.

## Features

- **Web Scraping:** Automatically scrapes the Crocs UK website for item availability.
- **Custom Search:** Search for specific items using query parameters.
- **Notification:** Sends notifications to a Discord channel when items are found in stock.
- **Timer Delay:** Configurable delay between search attempts to avoid rate limiting.
