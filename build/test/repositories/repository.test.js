import { Repository } from '../../lib/repositories/repository.js';
import dotenv from 'dotenv';
import { expect, test, beforeEach, afterEach, beforeAll, afterAll, } from 'vitest';
dotenv.config();
const repository = new Repository(process.env.TEST_DATABASE_URL);
const schema = `
CREATE TABLE test (
  id SERIAL PRIMARY KEY,
  name TEXT
);
`;
async function clearDatabase() {
    await repository.queryDatabase('TRUNCATE TABLE answers, questions, categories RESTART IDENTITY CASCADE');
}
beforeAll(async () => {
    await repository.queryDatabase(schema);
});
beforeEach(async () => {
    await clearDatabase();
});
afterEach(async () => {
    await clearDatabase();
});
afterAll(async () => {
    await repository.queryDatabase('DROP TABLE test');
});
test('queryDatabase saves and retrieves data', async () => {
    const catName = 'qdbCatTest';
    const result = await repository.queryDatabase('INSERT INTO test (name) VALUES ($1) RETURNING id', [catName]);
    console.log('result:', result[0].id);
    const cat = await repository.queryDatabase('SELECT * FROM test WHERE id = $1', [result[0].id]);
    expect(cat[0].name).toBe(catName);
});
test('queryDatabase throws error on invalid query', async () => {
    try {
        await repository.queryDatabase('SELECT * FROM invalidTable');
    }
    catch (err) {
        expect(err).toBeDefined();
    }
});
test('transaction commits', async () => {
    const catName = 'Test2';
    const cat = await repository.transaction(async (client) => {
        const result = await client.query('INSERT INTO test (name) VALUES ($1) RETURNING id', [catName]);
        return client.query('SELECT * FROM test WHERE id = $1', [
            result.rows[0].id,
        ]);
    });
    expect(cat.rows[0].name).toBe(catName);
});
test('transaction rolls back on error', async () => {
    const catName = 'Test3';
    try {
        await repository.transaction(async (client) => {
            await client.query('INSERT INTO test (name) VALUES ($1) RETURNING id', [
                catName,
            ]);
            await client.query('INSERT INTO invalidTable DEFAULT VALUES');
        });
    }
    catch (err) {
        expect(err).toBeDefined();
    }
    const result = await repository.queryDatabase('SELECT * FROM test WHERE name = $1', [catName]);
    expect(result.length).toBe(0);
});
