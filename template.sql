CREATE TABLE Categories(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE Entries(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  cat_id INTEGER NOT NULL,
  dt TEXT NOT NULL,
  description TEXT,
  value REAL NOT NULL,
  FOREIGN KEY (cat_id) REFERENCES Categories(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);