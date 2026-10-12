CREATE TABLE app_user (
    user_id              NUMBER GENERATED ALWAYS AS IDENTITY
                         CONSTRAINT pk_app_user PRIMARY KEY,

    username             VARCHAR2(50) NOT NULL,

    password             VARCHAR2(100) NOT NULL,

    role                 VARCHAR2(20) DEFAULT 'STAFF' NOT NULL,

    status               VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,

    created_date         DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT uq_app_user_username
        UNIQUE (username),

    CONSTRAINT ck_app_user_role
        CHECK (role IN ('ADMIN', 'STAFF')),

    CONSTRAINT ck_app_user_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

 CREATE TABLE vehicle (
    vehicle_id           NUMBER GENERATED ALWAYS AS IDENTITY
                         CONSTRAINT pk_vehicle PRIMARY KEY,

    registration_no      VARCHAR2(20) NOT NULL,

    vehicle_type         VARCHAR2(20) NOT NULL,

    brand                VARCHAR2(50),

    model                VARCHAR2(50),

    manufacture_year     NUMBER(4),

    seating_capacity     NUMBER(3) NOT NULL,

    status               VARCHAR2(20)
                         DEFAULT 'ACTIVE' NOT NULL,

    insurance_expiry     DATE,

    created_date         DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT uq_vehicle_reg
        UNIQUE (registration_no),

    CONSTRAINT ck_vehicle_type
        CHECK (vehicle_type IN
        ('BUS', 'VAN', 'MINI_BUS', 'CAR')),

    CONSTRAINT ck_vehicle_status
        CHECK (status IN
        ('ACTIVE', 'MAINTENANCE', 'INACTIVE')),

    CONSTRAINT ck_vehicle_capacity
        CHECK (seating_capacity > 0),

    CONSTRAINT ck_vehicle_year
        CHECK (manufacture_year BETWEEN 1900 AND 2100)
);

CREATE TABLE driver (
    driver_id            NUMBER GENERATED ALWAYS AS IDENTITY
                         CONSTRAINT pk_driver PRIMARY KEY,

    first_name           VARCHAR2(50) NOT NULL,

    last_name            VARCHAR2(50) NOT NULL,

    nic_number           VARCHAR2(20) NOT NULL,

    license_number       VARCHAR2(30) NOT NULL,

    license_expiry       DATE NOT NULL,

    phone                VARCHAR2(15),

    email                VARCHAR2(100),

    date_of_birth        DATE,

    hire_date            DATE DEFAULT SYSDATE NOT NULL,

    status               VARCHAR2(20)
                         DEFAULT 'ACTIVE' NOT NULL,

    CONSTRAINT uq_driver_nic
        UNIQUE (nic_number),

    CONSTRAINT uq_driver_license
        UNIQUE (license_number),

    CONSTRAINT ck_driver_status
        CHECK (status IN
        ('ACTIVE', 'ON_LEAVE', 'TERMINATED'))
);

CREATE TABLE route (
    route_id                    NUMBER GENERATED ALWAYS AS IDENTITY
                                CONSTRAINT pk_route PRIMARY KEY,

    route_name                  VARCHAR2(100) NOT NULL,

    source_location             VARCHAR2(100) NOT NULL,

    destination_location        VARCHAR2(100) NOT NULL,

    distance_km                 NUMBER(6,2),

    estimated_duration_min      NUMBER(5),

    base_fare                   NUMBER(8,2) NOT NULL,

    status                      VARCHAR2(20)
                                DEFAULT 'ACTIVE' NOT NULL,

    CONSTRAINT ck_route_status
        CHECK (status IN ('ACTIVE', 'SUSPENDED')),

    CONSTRAINT ck_route_distance
        CHECK (distance_km > 0),

    CONSTRAINT ck_route_duration
        CHECK (estimated_duration_min > 0),

    CONSTRAINT ck_route_fare
        CHECK (base_fare >= 0)
);

CREATE TABLE route_stop (
    stop_id                NUMBER GENERATED ALWAYS AS IDENTITY
                           CONSTRAINT pk_route_stop PRIMARY KEY,

    route_id               NUMBER NOT NULL,

    stop_name              VARCHAR2(100) NOT NULL,

    stop_sequence          NUMBER(3) NOT NULL,

    CONSTRAINT fk_stop_route
        FOREIGN KEY (route_id)
        REFERENCES route (route_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_route_stop_seq
        UNIQUE (route_id, stop_sequence),

    CONSTRAINT ck_stop_sequence
        CHECK (stop_sequence > 0)
);

CREATE TABLE passenger (
    passenger_id           NUMBER GENERATED ALWAYS AS IDENTITY
                           CONSTRAINT pk_passenger PRIMARY KEY,

    full_name              VARCHAR2(100) NOT NULL,

    email                  VARCHAR2(100) NOT NULL,

    phone                  VARCHAR2(15),

    password               VARCHAR2(100) NOT NULL,

    address                VARCHAR2(200),

    registration_date      DATE DEFAULT SYSDATE NOT NULL,

    status                 VARCHAR2(20)
                           DEFAULT 'ACTIVE' NOT NULL,

    CONSTRAINT uq_passenger_email
        UNIQUE (email),

    CONSTRAINT ck_passenger_status
        CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

CREATE TABLE trip (
    trip_id                 NUMBER GENERATED ALWAYS AS IDENTITY
                            CONSTRAINT pk_trip PRIMARY KEY,

    route_id                NUMBER NOT NULL,

    vehicle_id              NUMBER NOT NULL,

    driver_id               NUMBER NOT NULL,

    trip_date               DATE NOT NULL,

    departure_time          TIMESTAMP NOT NULL,

    arrival_time            TIMESTAMP,

    available_seats         NUMBER(3) NOT NULL,

    fare                    NUMBER(8,2) NOT NULL,

    trip_status             VARCHAR2(20)
                            DEFAULT 'SCHEDULED' NOT NULL,

    CONSTRAINT fk_trip_route
        FOREIGN KEY (route_id)
        REFERENCES route (route_id),

    CONSTRAINT fk_trip_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicle (vehicle_id),

    CONSTRAINT fk_trip_driver
        FOREIGN KEY (driver_id)
        REFERENCES driver (driver_id),

    CONSTRAINT ck_trip_status
        CHECK (trip_status IN
        ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED')),

    CONSTRAINT ck_trip_seats
        CHECK (available_seats >= 0),

    CONSTRAINT ck_trip_fare
        CHECK (fare >= 0),

    CONSTRAINT ck_trip_time
        CHECK (
            arrival_time IS NULL
            OR arrival_time > departure_time
        )
);

CREATE TABLE ticket (
    ticket_id              NUMBER GENERATED ALWAYS AS IDENTITY
                           CONSTRAINT pk_ticket PRIMARY KEY,

    trip_id                NUMBER NOT NULL,

    passenger_id           NUMBER NOT NULL,

    seat_number            VARCHAR2(10) NOT NULL,

    booking_date            DATE DEFAULT SYSDATE NOT NULL,

    ticket_price           NUMBER(8,2) NOT NULL,

    ticket_status          VARCHAR2(20)
                           DEFAULT 'BOOKED' NOT NULL,

    CONSTRAINT fk_ticket_trip
        FOREIGN KEY (trip_id)
        REFERENCES trip (trip_id),

    CONSTRAINT fk_ticket_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES passenger (passenger_id),

    CONSTRAINT uq_ticket_seat
        UNIQUE (trip_id, seat_number),

    CONSTRAINT ck_ticket_status
        CHECK (ticket_status IN
        ('BOOKED', 'CANCELLED', 'COMPLETED')),

    CONSTRAINT ck_ticket_price
        CHECK (ticket_price >= 0)
);

CREATE TABLE payment (
    payment_id              NUMBER GENERATED ALWAYS AS IDENTITY
                             CONSTRAINT pk_payment PRIMARY KEY,

    ticket_id               NUMBER NOT NULL,

    amount                  NUMBER(8,2) NOT NULL,

    payment_date            DATE DEFAULT SYSDATE NOT NULL,

    payment_method          VARCHAR2(20) NOT NULL,

    payment_status          VARCHAR2(20)
                            DEFAULT 'PENDING' NOT NULL,

    transaction_reference   VARCHAR2(100),

    CONSTRAINT fk_payment_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES ticket (ticket_id),

    CONSTRAINT uq_payment_ticket
        UNIQUE (ticket_id),

    CONSTRAINT uq_transaction_reference
        UNIQUE (transaction_reference),

    CONSTRAINT ck_payment_amount
        CHECK (amount > 0),

    CONSTRAINT ck_payment_method
        CHECK (payment_method IN
        ('CASH', 'CARD', 'ONLINE')),

    CONSTRAINT ck_payment_status
        CHECK (payment_status IN
        ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
);
   
CREATE TABLE maintenance (
    maintenance_id          NUMBER GENERATED ALWAYS AS IDENTITY
                             CONSTRAINT pk_maintenance PRIMARY KEY,

    vehicle_id              NUMBER NOT NULL,

    maintenance_date        DATE NOT NULL,

    maintenance_type        VARCHAR2(50) NOT NULL,

    description             VARCHAR2(500),

    cost                    NUMBER(10,2)
                            DEFAULT 0 NOT NULL,

    maintenance_status      VARCHAR2(20)
                            DEFAULT 'COMPLETED' NOT NULL,

    CONSTRAINT fk_maintenance_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicle (vehicle_id),

    CONSTRAINT ck_maintenance_cost
        CHECK (cost >= 0),

    CONSTRAINT ck_maintenance_status
        CHECK (maintenance_status IN
        ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE feedback (
    feedback_id             NUMBER GENERATED ALWAYS AS IDENTITY
                            CONSTRAINT pk_feedback PRIMARY KEY,

    passenger_id            NUMBER NOT NULL,

    trip_id                 NUMBER NOT NULL,

    rating                  NUMBER(1) NOT NULL,

    comment_text            VARCHAR2(1000),

    feedback_date           DATE DEFAULT SYSDATE NOT NULL,

    CONSTRAINT fk_feedback_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES passenger (passenger_id),

    CONSTRAINT fk_feedback_trip
        FOREIGN KEY (trip_id)
        REFERENCES trip (trip_id),

    CONSTRAINT ck_feedback_rating
        CHECK (rating BETWEEN 1 AND 5)
);

INSERT INTO app_user (username, password, role, status)
VALUES ('admin', 'admin123', 'ADMIN', 'ACTIVE');

INSERT INTO app_user (username, password, role, status)
VALUES ('chathuni', 'chathuni123', 'PASSENGER', 'ACTIVE');

INSERT INTO vehicle
(registration_no, vehicle_type, brand, model, manufacture_year,
 seating_capacity, status, insurance_expiry)
VALUES
('NB-1234', 'BUS', 'Ashok Leyland', 'Viking', 2022,
 50, 'ACTIVE', DATE '2027-06-30');

INSERT INTO vehicle
(registration_no, vehicle_type, brand, model, manufacture_year,
 seating_capacity, status, insurance_expiry)
VALUES
('NB-5678', 'VAN', 'Toyota', 'Hiace', 2023,
 15, 'ACTIVE', DATE '2027-09-15');

INSERT INTO driver
(first_name, last_name, nic_number, license_number,
 license_expiry, phone, email, date_of_birth, hire_date, status)
VALUES
('Kasun', 'Perera', '199501234567', 'B1234567',
 DATE '2028-05-31', '0771234567',
 'kasun@gmail.com', DATE '1995-04-12',
 DATE '2023-01-10', 'ACTIVE');

INSERT INTO driver
(first_name, last_name, nic_number, license_number,
 license_expiry, phone, email, date_of_birth, hire_date, status)
VALUES
('Nimal', 'Fernando', '199203456789', 'B7654321',
 DATE '2029-02-28', '0719876543',
 'nimal@gmail.com', DATE '1992-08-20',
 DATE '2022-06-15', 'ACTIVE');

INSERT INTO route
(route_name, source_location, destination_location,
 distance_km, estimated_duration_min, base_fare, status)
VALUES
('Colombo - Kandy', 'Colombo', 'Kandy',
 115, 210, 1500, 'ACTIVE');

INSERT INTO route
(route_name, source_location, destination_location,
 distance_km, estimated_duration_min, base_fare, status)
VALUES
('Kandy - Nuwara Eliya', 'Kandy', 'Nuwara Eliya',
 75, 150, 1000, 'ACTIVE');

SELECT route_id, route_name
FROM route;

INSERT INTO route_stop
(route_id, stop_name, stop_sequence)
VALUES
(1, 'Kadawatha', 1);

INSERT INTO route_stop
(route_id, stop_name, stop_sequence)
VALUES
(1, 'Kegalle', 2);

INSERT INTO route_stop
(route_id, stop_name, stop_sequence)
VALUES
(2, 'Peradeniya', 1);

INSERT INTO route_stop
(route_id, stop_name, stop_sequence)
VALUES
(2, 'Gampola', 2);

INSERT INTO passenger
(full_name, email, phone, password, address, status)
VALUES
('Chathuni Silva', 'chathuni@gmail.com',
 '0771112233', 'pass123',
 'Kandy, Sri Lanka', 'ACTIVE');

INSERT INTO passenger
(full_name, email, phone, password, address, status)
VALUES
('Amal Perera', 'amal@gmail.com',
 '0712223344', 'pass456',
 'Colombo, Sri Lanka', 'ACTIVE');

INSERT INTO driver
(
    first_name,
    last_name,
    nic_number,
    license_number,
    license_expiry,
    phone,
    email,
    date_of_birth,
    hire_date,
    status
)
VALUES
(
    'Kasun',
    'Perera',
    '199501234567',
    'B1234567',
    DATE '2028-05-31',
    '0771234567',
    'kasun@gmail.com',
    DATE '1995-04-12',
    DATE '2023-01-10',
    'ACTIVE'
);

INSERT INTO driver
(
    first_name,
    last_name,
    nic_number,
    license_number,
    license_expiry,
    phone,
    email,
    date_of_birth,
    hire_date,
    status
)
VALUES
(
    'Nimal',
    'Fernando',
    '199203456789',
    'B7654321',
    DATE '2029-02-28',
    '0719876543',
    'nimal@gmail.com',
    DATE '1992-08-20',
    DATE '2022-06-15',
    'ACTIVE'
);

COMMIT;

SELECT
    driver_id,
    first_name,
    last_name,
    license_number,
    status
FROM driver
ORDER BY driver_id;

SELECT route_id, route_name
FROM route
ORDER BY route_id;

SELECT vehicle_id, registration_no, seating_capacity
FROM vehicle
ORDER BY vehicle_id;

SELECT driver_id, first_name, last_name
FROM driver
ORDER BY driver_id;


INSERT INTO trip
(
    route_id,
    vehicle_id,
    driver_id,
    trip_date,
    departure_time,
    arrival_time,
    available_seats,
    fare,
    trip_status
)
VALUES
(
    1,
    1,
    1,
    DATE '2026-10-05',
    TIMESTAMP '2026-10-05 06:30:00',
    TIMESTAMP '2026-10-05 10:00:00',
    15,
    1500,
    'SCHEDULED'
);

INSERT INTO trip
(
    route_id,
    vehicle_id,
    driver_id,
    trip_date,
    departure_time,
    arrival_time,
    available_seats,
    fare,
    trip_status
)
VALUES
(
    2,
    1,
    2,
    DATE '2026-10-06',
    TIMESTAMP '2026-10-06 07:00:00',
    TIMESTAMP '2026-10-06 09:30:00',
    15,
    1000,
    'SCHEDULED'
);

COMMIT;

INSERT INTO trip
(
    route_id,
    vehicle_id,
    driver_id,
    trip_date,
    departure_time,
    arrival_time,
    available_seats,
    fare,
    trip_status
)
VALUES
(
    1,
    1,
    1,
    DATE '2026-10-05',
    TIMESTAMP '2026-10-05 06:30:00',
    TIMESTAMP '2026-10-05 10:00:00',
    15,
    1500,
    'SCHEDULED'
);

INSERT INTO trip
(
    route_id,
    vehicle_id,
    driver_id,
    trip_date,
    departure_time,
    arrival_time,
    available_seats,
    fare,
    trip_status
)
VALUES
(
    2,
    1,
    2,
    DATE '2026-10-06',
    TIMESTAMP '2026-10-06 07:00:00',
    TIMESTAMP '2026-10-06 09:30:00',
    15,
    1000,
    'SCHEDULED'
);

COMMIT;

INSERT INTO passenger
(
    full_name,
    email,
    phone,
    password,
    address,
    status
)
VALUES
(
    'Chathuni Silva',
    'chathuni@gmail.com',
    '0771112233',
    'pass123',
    'Kandy, Sri Lanka',
    'ACTIVE'
);

INSERT INTO passenger
(
    full_name,
    email,
    phone,
    password,
    address,
    status
)
VALUES
(
    'Amal Perera',
    'amal@gmail.com',
    '0712223344',
    'pass456',
    'Colombo, Sri Lanka',
    'ACTIVE'
);

COMMIT;

INSERT INTO ticket
(
    trip_id,
    passenger_id,
    seat_number,
    ticket_price,
    ticket_status
)
VALUES
(
    1,
    1,
    'A1',
    1500,
    'BOOKED'
);

INSERT INTO ticket
(
    trip_id,
    passenger_id,
    seat_number,
    ticket_price,
    ticket_status
)
VALUES
(
    2,
    2,
    'A2',
    1000,
    'BOOKED'
);

INSERT INTO payment
(
    ticket_id,
    amount,
    payment_method,
    payment_status,
    transaction_reference
)
VALUES
(
    1,
    1500,
    'CARD',
    'PAID',
    'TXN-10001'
);

INSERT INTO payment
(
    ticket_id,
    amount,
    payment_method,
    payment_status,
    transaction_reference
)
VALUES
(
    2,
    1000,
    'ONLINE',
    'PAID',
    'TXN-10002'
);

COMMIT;

INSERT INTO payment
(
    ticket_id,
    amount,
    payment_method,
    payment_status,
    transaction_reference
)
VALUES
(
    3,
    1500,
    'CARD',
    'PAID',
    'TXN-10001'
);

INSERT INTO payment
(
    ticket_id,
    amount,
    payment_method,
    payment_status,
    transaction_reference
)
VALUES
(
    4,
    1000,
    'ONLINE',
    'PAID',
    'TXN-10002'
);

COMMIT;


INSERT INTO maintenance
(
    vehicle_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    maintenance_status
)
VALUES
(
    1,
    DATE '2026-09-20',
    'SERVICE',
    'Engine oil and filter replacement',
    25000,
    'COMPLETED'
);

INSERT INTO maintenance
(
    vehicle_id,
    maintenance_date,
    maintenance_type,
    description,
    cost,
    maintenance_status
)
VALUES
(
    1,
    DATE '2026-09-22',
    'INSPECTION',
    'Brake and tyre inspection',
    12000,
    'COMPLETED'
);

COMMIT;

INSERT INTO feedback
(
    passenger_id,
    trip_id,
    rating,
    comment_text
)
VALUES
(
    1,
    1,
    5,
    'Very comfortable journey and friendly driver.'
);

INSERT INTO feedback
(
    passenger_id,
    trip_id,
    rating,
    comment_text
)
VALUES
(
    2,
    2,
    4,
    'Good service but the bus was slightly late.'
);

COMMIT;


SELECT * FROM app_user;

SELECT * FROM vehicle;

SELECT * FROM driver;

SELECT * FROM route;

SELECT * FROM route_stop;

SELECT * FROM passenger;

SELECT * FROM trip;

SELECT * FROM ticket;

SELECT * FROM payment;

SELECT * FROM maintenance;

SELECT * FROM feedback;






