# Services:

## Domain Service (API Gateway):

### Responsibilities:
Handles incoming API requests related to domain management (e.g., adding, updating, deleting domains).
Validates input data and performs initial processing.
Initiates scan requests by sending messages to the message queue.

### Communication:
Receives API requests from external clients (e.g., web interface, other systems).
Publishes messages to the message queue to trigger scans.
May interact with the database to store domain information and scan results (if not delegated to another service).

## Scanning Service (Worker):

### Responsibilities:
Consumes messages from the message queue indicating new scan requests.
Performs domain scans using external APIs or tools.
Analyzes scan results and extracts relevant information.
Stores scan results in the database.
(Optional) Emits events or sends notifications upon completion of scans.

### Communication:
Subscribes to the message queue to receive scan requests.
Interacts with the database to store scan results.
(Optional) Publishes events or notifications to inform other services or clients.

## Database Service (Data Store):

### Responsibilities:
Manages the storage of domain information, scan results, and other relevant data.
Provides a data access layer (e.g., using an ORM or repository pattern) for other services to interact with the database.

### Communication:
Receives requests for data storage or retrieval from other services.
(Optional) Emits events to notify other services of data changes.

## Scheduling Service:

### Responsibilities:
Manages the scheduling of automatic domain scans (e.g., using cron-like functionality).
Triggers scan requests by publishing messages to the message queue.

### Communication:
Publishes messages to the message queue to initiate scheduled scans.

# Communication Channels:

## Message Queue (e.g., RabbitMQ):

Primary channel for asynchronous communication between services.
Used to decouple services and ensure reliable message delivery.
The domain-service publishes messages to request scans, and the scanning-service consumes these messages to process them.

## REST API:

Used for external clients to interact with the domain-service and initiate domain management operations.
Can also be used for direct communication between services if the volume of requests is not very high.

## Database:

Acts as a shared data store for all services.
Provides a central repository for domain information, scan results, and other data.
(Optional) Can be used to emit events to notify other services of data changes.

# Visual Representation:

+--------------+     (REST API)    +--------------+      (Message Queue)     +----------------+
|  Client      |  ------------>  | Domain Service|  -------------------->  | Scanning Service |
+--------------+                  +--------------+                          +----------------+
^                                                 |
|                                                 | (Database)
|                                                 v
| (Message Queue)                            +------------+
+------------+  -------------------->          | Database    |
| Scheduling  |                                +------------+
| Service     |
+------------+

docker run -it --name dss_mq -p 5672:5672 -p 15672:15672  -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password rabbitmq:3.13-management