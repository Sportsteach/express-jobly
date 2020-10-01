CREATE TABLE companies
(
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees INTEGER,
  description text,
  logo_url text
);
CREATE TABLE jobs
(
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE,
  salary float,
  equity float Check(equity <= 1.0),
  company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP DEFAULT current_timestamp
);
CREATE TABLE users
(
  username text PRIMARY KEY,
  password text NOT NULL,
  first_name text,
  last_name text,
  email text,
  photo_url text,
  is_admin BOOLEAN NOT NULL default FALSE
);

