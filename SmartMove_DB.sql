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
VALUES ('staff', 'staff123', 'STAFF', 'ACTIVE');

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
(first_name,last_name,nic_number,license_number,license_expiry,phone,email,date_of_birth,hire_date,status)
VALUES
('Kasun','Perera','199501234567','B1234567',DATE '2028-05-31','0771234567','kasun@gmail.com',DATE '1995-04-12',DATE '2023-01-10','ACTIVE');
INSERT INTO driver(first_name,last_name,nic_number,license_number,license_expiry,phone,email,date_of_birth,hire_date,status)
VALUES('Nimal','Fernando','199203456789','B7654321',DATE '2029-02-28','0719876543','nimal@gmail.com',DATE '1992-08-20',DATE '2022-06-15','ACTIVE');

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

--CREATE PROCEDURES

--ADD VEHICLES
CREATE OR REPLACE PROCEDURE ADD_VEHICLE (
    p_registration_no   IN VEHICLE.REGISTRATION_NO%TYPE,
    p_vehicle_type      IN VEHICLE.VEHICLE_TYPE%TYPE,
    p_brand             IN VEHICLE.BRAND%TYPE,
    p_model             IN VEHICLE.MODEL%TYPE,
    p_manufacture_year  IN VEHICLE.MANUFACTURE_YEAR%TYPE,
    p_seating_capacity  IN VEHICLE.SEATING_CAPACITY%TYPE,
    p_status            IN VEHICLE.STATUS%TYPE,
    p_insurance_expiry  IN VEHICLE.INSURANCE_EXPIRY%TYPE
)
IS
BEGIN

    INSERT INTO VEHICLE (
        REGISTRATION_NO,
        VEHICLE_TYPE,
        BRAND,
        MODEL,
        MANUFACTURE_YEAR,
        SEATING_CAPACITY,
        STATUS,
        INSURANCE_EXPIRY
    )
    VALUES (
        p_registration_no,
        p_vehicle_type,
        p_brand,
        p_model,
        p_manufacture_year,
        p_seating_capacity,
        p_status,
        p_insurance_expiry
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Vehicle added successfully.');

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error: Registration number already exists.'
        );

    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error adding vehicle: ' || SQLERRM
        );
END;
/
BEGIN
    ADD_VEHICLE(
        'NB-9999',
        'BUS',
        'Ashok Leyland',
        'Viking',
        2024,
        50,
        'ACTIVE',
        DATE '2028-12-31'
    );
END;
/

--ADD DRIVERS
CREATE OR REPLACE PROCEDURE ADD_DRIVER (
    p_first_name       IN DRIVER.FIRST_NAME%TYPE,
    p_last_name        IN DRIVER.LAST_NAME%TYPE,
    p_nic_number       IN DRIVER.NIC_NUMBER%TYPE,
    p_license_number   IN DRIVER.LICENSE_NUMBER%TYPE,
    p_license_expiry   IN DRIVER.LICENSE_EXPIRY%TYPE,
    p_phone            IN DRIVER.PHONE%TYPE,
    p_email            IN DRIVER.EMAIL%TYPE,
    p_date_of_birth    IN DRIVER.DATE_OF_BIRTH%TYPE,
    p_hire_date        IN DRIVER.HIRE_DATE%TYPE,
    p_status           IN DRIVER.STATUS%TYPE
)
IS
BEGIN

    INSERT INTO DRIVER (
        FIRST_NAME,
        LAST_NAME,
        NIC_NUMBER,
        LICENSE_NUMBER,
        LICENSE_EXPIRY,
        PHONE,
        EMAIL,
        DATE_OF_BIRTH,
        HIRE_DATE,
        STATUS
    )
    VALUES (
        p_first_name,
        p_last_name,
        p_nic_number,
        p_license_number,
        p_license_expiry,
        p_phone,
        p_email,
        p_date_of_birth,
        p_hire_date,
        p_status
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Driver added successfully.');

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error: NIC or license number already exists.'
        );

    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error adding driver: ' || SQLERRM
        );
END;
/
BEGIN
    ADD_DRIVER(
        'Kamal',
        'Perera',
        '199012345678',
        'B1234569',
        DATE '2028-06-30',
        '0712345678',
        'kamal@gmail.com',
        DATE '1990-05-15',
        DATE '2020-01-10',
        'ACTIVE'
    );
END;
/

--SHEDULE TRIP
CREATE OR REPLACE PROCEDURE SCHEDULE_TRIP (
    p_route_id          IN TRIP.ROUTE_ID%TYPE,
    p_vehicle_id        IN TRIP.VEHICLE_ID%TYPE,
    p_driver_id         IN TRIP.DRIVER_ID%TYPE,
    p_trip_date         IN TRIP.TRIP_DATE%TYPE,
    p_departure_time    IN TRIP.DEPARTURE_TIME%TYPE,
    p_arrival_time      IN TRIP.ARRIVAL_TIME%TYPE,
    p_fare              IN TRIP.FARE%TYPE,
    p_trip_status       IN TRIP.TRIP_STATUS%TYPE
)
IS
    v_seating_capacity VEHICLE.SEATING_CAPACITY%TYPE;
BEGIN

    SELECT SEATING_CAPACITY
    INTO v_seating_capacity
    FROM VEHICLE
    WHERE VEHICLE_ID = p_vehicle_id;

    INSERT INTO TRIP (
        ROUTE_ID,
        VEHICLE_ID,
        DRIVER_ID,
        TRIP_DATE,
        DEPARTURE_TIME,
        ARRIVAL_TIME,
        AVAILABLE_SEATS,
        FARE,
        TRIP_STATUS
    )
    VALUES (
        p_route_id,
        p_vehicle_id,
        p_driver_id,
        p_trip_date,
        p_departure_time,
        p_arrival_time,
        v_seating_capacity,
        p_fare,
        p_trip_status
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Trip scheduled successfully.');
    DBMS_OUTPUT.PUT_LINE(
        'Available seats: ' || v_seating_capacity
    );

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: Vehicle not found.');

    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error scheduling trip: ' || SQLERRM
        );
END;
/
BEGIN
    SCHEDULE_TRIP(
        1,
        1,
        1,
        DATE '2026-10-10',
        TIMESTAMP '2026-10-10 07:00:00',
        TIMESTAMP '2026-10-10 10:30:00',
        1500,
        'SCHEDULED'
    );
END;
/

--Book Ticket
CREATE OR REPLACE PROCEDURE BOOK_TICKET (
    p_trip_id       IN TICKET.TRIP_ID%TYPE,
    p_passenger_id  IN TICKET.PASSENGER_ID%TYPE,
    p_seat_number   IN TICKET.SEAT_NUMBER%TYPE,
    p_ticket_price  IN TICKET.TICKET_PRICE%TYPE
)
IS
    v_available_seats TRIP.AVAILABLE_SEATS%TYPE;
BEGIN

    SELECT AVAILABLE_SEATS
    INTO v_available_seats
    FROM TRIP
    WHERE TRIP_ID = p_trip_id
    FOR UPDATE;

    IF v_available_seats <= 0 THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'No available seats for this trip.'
        );
    END IF;

    INSERT INTO TICKET (
        TRIP_ID,
        PASSENGER_ID,
        SEAT_NUMBER,
        BOOKING_DATE,
        TICKET_PRICE,
        TICKET_STATUS
    )
    VALUES (
        p_trip_id,
        p_passenger_id,
        p_seat_number,
        SYSDATE,
        p_ticket_price,
        'BOOKED'
    );

    UPDATE TRIP
    SET AVAILABLE_SEATS = AVAILABLE_SEATS - 1
    WHERE TRIP_ID = p_trip_id;

    COMMIT;

    DBMS_OUTPUT.PUT_LINE(
        'Ticket booked successfully.'
    );

EXCEPTION

    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Error: Trip not found.'
        );

    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Booking failed: This seat is already booked.'
        );

    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Booking failed: ' || SQLERRM
        );
END;
/

--Record Payment
CREATE OR REPLACE PROCEDURE RECORD_PAYMENT (
    p_ticket_id              IN PAYMENT.TICKET_ID%TYPE,
    p_amount                 IN PAYMENT.AMOUNT%TYPE,
    p_payment_method         IN PAYMENT.PAYMENT_METHOD%TYPE,
    p_payment_status         IN PAYMENT.PAYMENT_STATUS%TYPE,
    p_transaction_reference  IN PAYMENT.TRANSACTION_REFERENCE%TYPE
)
IS
BEGIN

    INSERT INTO PAYMENT (
        TICKET_ID,
        AMOUNT,
        PAYMENT_DATE,
        PAYMENT_METHOD,
        PAYMENT_STATUS,
        TRANSACTION_REFERENCE
    )
    VALUES (
        p_ticket_id,
        p_amount,
        SYSDATE,
        p_payment_method,
        p_payment_status,
        p_transaction_reference
    );

    COMMIT;

    DBMS_OUTPUT.PUT_LINE(
        'Payment recorded successfully.'
    );

EXCEPTION

    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Payment failed: This ticket already has a payment or transaction reference already exists.'
        );

    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE(
            'Payment failed: ' || SQLERRM
        );

END;
/
BEGIN
    RECORD_PAYMENT(
        3,
        1500,
        'CARD',
        'PAID',
        'TXN-10003'
    );
END;
/

SELECT user_id, username, role, status
FROM app_user;

ALTER TABLE app_user
DROP CONSTRAINT ck_app_user_role;

ALTER TABLE app_user
ADD CONSTRAINT ck_app_user_role
CHECK (role IN ('ADMIN', 'PASSENGER'));

ALTER TABLE app_user
MODIFY role DEFAULT 'PASSENGER';

SELECT user_id, username, role, status
FROM app_user;

UPDATE app_user
SET role = 'PASSENGER'
WHERE role = 'STAFF';

COMMIT;

ALTER TABLE app_user
MODIFY role DEFAULT 'PASSENGER';

SELECT user_id, username, role, status
FROM app_user;

SELECT constraint_name, search_condition
FROM user_constraints
WHERE table_name = 'APP_USER'
AND constraint_name = 'CK_APP_USER_ROLE';

SELECT user_id, username, role, status
FROM app_user;

SELECT COUNT(*)
FROM app_user
WHERE role = 'STAFF';

SELECT constraint_name, search_condition
FROM user_constraints
WHERE table_name = 'APP_USER'
AND constraint_name = 'CK_APP_USER_ROLE';

UPDATE app_user
SET password = 'admin123'
WHERE username = 'admin';

COMMIT;

SELECT username, password
FROM app_user
WHERE username = 'admin';

SELECT * FROM maintenance