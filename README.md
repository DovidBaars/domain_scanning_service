# Services:

## Products Service (API Gateway):

### Responsibilities:
Handles incoming API requests related to domain scan requests.
Validates input data and performs initial processing.
Initiates scan, and cron requests by sending messages to the message queue.
Saves domain information in the database.

### Communication:
Receives API requests from external clients (e.g., web interface, other systems).
Publishes messages to the message queue to trigger scans.
Interacts with the database.

## Scanning Service (Worker):

### Responsibilities:
Consumes messages from the message queue indicating new scan requests.
Performs domain scans using external APIs or tools.
Analyzes scan results and extracts relevant information.
Stores scan results in the database.

### Communication:
Subscribes to the message queue to receive scan requests.
Interacts with the database to store scan results.

## Scheduling Service:

### Responsibilities:
Manages the scheduling of automatic domain scans (cron).
Triggers scan requests by publishing messages to the message queue.

### Communication:
Subscribes to the message queue to receive schedule creation requests.
Publishes messages to the message queue to initiate scheduled scans.

# Communication Channels:

## Message Queue (RabbitMQ):

Primary channel for asynchronous communication between services.
Used to decouple services and ensure reliable message delivery.
The domain-service publishes messages to request scans, and schedules, and the scanning-service, and schedule-service consume these messages to process them.

## REST API:

Used for external clients to interact with the domain-service and initiate domain management operations.

## Database:

### Responsibilities:
Provides a data access layer (ORM) for other services to interact with the database.
Acts as a shared data store for all services.
Provides a central repository for domain information, scan results, and other data.

### Communication:
Each service interacts with the database to store and retrieve data.

# Visual Representation:

+--------------+     (REST API)    +--------------+      (Message Queue)     +----------------+
|  Client      |  ------------>  | Products Service|  -------------------->  | Scanning Service |
+--------------+                  +--------------+                          +----------------+
|                                                 | (Message Queue)
|                                                 v
                                    *---------------------*
                                     | Scheduling Service |
                                    +---------------------+

All services (Products, Scanning, and Scheduling) interact with the Database directly.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

Either run entirely Dockerized, or just the rabbitmq server.
docker-compose -f docker-compose.dev.yml -f docker-compose.rabbitmq.yml up
with docker there is currently no hot reloading.

- next:
 -- add bad domain detection. Do not scan again, save etc if domain scans fail.