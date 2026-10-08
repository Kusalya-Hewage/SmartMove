BEGIN

    ADD_VEHICLE(
        'NB-5678',
        'BUS',
        'Ashok Leyland',
        'Viking',
        2022,
        50,
        'ACTIVE',
        DATE '2027-12-31'
    );

END;
/

SELECT *
FROM VEHICLE
WHERE REGISTRATION_NO = 'NB-5678';


DESC ROUTE;
DESC TRIP;
DESC TICKET;
DESC PAYMENT;
DESC PASSENGER;
DESC VEHICLE;
DESC MAINTENANCE;
DESC DRIVER;
DESC FEEDBACK;

select * from trip;

select * from payment;

INSERT INTO app_user (username, password, role, status)
VALUES ('passenger', 'passenger123', 'PASSENGER', 'ACTIVE');

