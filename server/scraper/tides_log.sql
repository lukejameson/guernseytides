CREATE TABLE tide_log
(
    date DATE,
    weather JSON,
    basicTide JSON,
    preciseTide JSON,
    poolsExposed JSON
);

ALTER TABLE tide_log
ADD CONSTRAINT unique_date_constraint UNIQUE (date);
