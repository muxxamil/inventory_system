# nu3 - Inventory System

## ❯ Prerequisites

- Node preferably **>=8.0.0**, For Development to be exact I used: **10.19.0**

Steps to run application:

- Download the codebase
- Please rename .env.text to .env and replace all the values with postfix **_placeholder** and WEBHOOK_URL as well (just create a database with that name, everything else will be filled by executing next command).
- Execute following command (It will create database tables and install all required packages):
```bash
npm run setup
```
- To run application execute following command and it will be served on localhost:8000 by default. You can change the PORT in .env
```bash
npm run dev
```