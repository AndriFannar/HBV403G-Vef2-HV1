export const schema = `CREATE TABLE IF NOT EXISTS Categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    question VARCHAR(500) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE IF NOT EXISTS Answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(id)
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON Answers(question_id);`;
