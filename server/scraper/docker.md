docker run --name mysql_container -e MYSQL_ROOT_PASSWORD=Pass.Word! -e MYSQL_DATABASE=tides -e MYSQL_USER=admin -e MYSQL_PASSWORD=Pass.Word! -v mysql_data:/var/lib/mysql -p 3306:3306 -d mysql:latest

# 1. Connect to MySQL

mysql -u your_username -p

# 2. Once connected, select your database

USE your_database_name;

# 3. Create the table

CREATE TABLE tide_log (
date DATE,
basicTide JSON,
preciseTide JSON
);

# 4. Verify the table was created

SHOW TABLES;

# 5. View the table structure

DESCRIBE tideTable;

# 6. Exit MySQL CLI

EXIT;
