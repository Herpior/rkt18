SQL commands used to create and populate the tables

CREATE TABLE locations(
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) not null,
  comment TEXT,
  position POINT not null
);

CREATE TABLE temperatures(
  id SERIAL PRIMARY KEY,
  time TIMESTAMP not null,
  location INTEGER REFERENCES locations(id) ON DELETE CASCADE,
  temperature FLOAT(24) not null
  --suspicion FLOAT(24) --for use with validation that compares the temperature and the speed at which it has changed from the last measurement
  CONSTRAINT temperatures_temperature_check CHECK (temperature >= -100 AND temperature <= 100) --theoretical maximum possible ground temperature according to wikipedia is between 90 and 100 celsius
);

INSERT INTO locations values(1, 'Tokio', '', POINT(35.6584421,139.7328635));
INSERT INTO locations values(2, 'Helsinki', '', POINT(60.1697530,24.9490830));
INSERT INTO locations values(3, 'New York', '', POINT(40.7406905,-73.9938438));
INSERT INTO locations values(4, 'Amsterdam', '', POINT(52.3650691,4.9040238));
INSERT INTO locations values(5, 'Dubai', '', POINT(25.092535,55.1562243));


INSERT INTO temperatures values(DEFAULT, '2018-01-07 04:05:06', 1, 9.1);
INSERT INTO temperatures values(DEFAULT, '2018-01-07 04:05:06', 2, 10.1);
INSERT INTO temperatures values(DEFAULT, '2018-01-07 04:05:06', 3, 14.1);
INSERT INTO temperatures values(DEFAULT, '2018-01-07 04:05:06', 4, 1.1);
INSERT INTO temperatures values(DEFAULT, '2018-01-07 04:05:06', 5, 10.563);
INSERT INTO temperatures values(DEFAULT, NOW(), 1, 13.1);
INSERT INTO temperatures values(DEFAULT, NOW(), 2, 14.1);
INSERT INTO temperatures values(DEFAULT, NOW(), 3, 17.1);
INSERT INTO temperatures values(DEFAULT, NOW(), 4, 12.1);
INSERT INTO temperatures values(DEFAULT, NOW(), 5, 18.1);
