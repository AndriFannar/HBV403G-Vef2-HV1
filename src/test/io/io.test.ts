import { expect, test, beforeAll, afterAll } from 'vitest';
import * as io from '../../lib/io/io.js';
import fs from 'node:fs/promises';

const tempDir = 'io-test-temp';

beforeAll(async () => {
  await fs.mkdir(tempDir, { recursive: true });
});

afterAll(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('Write data and read back', async () => {
  const filePath = `${tempDir}//test.txt`;
  const data = 'Hello, world!';

  // Write the file
  await io.writeFile(filePath, data);

  // Read the file using your function
  const content = await io.readFile(filePath);
  expect(content).toBe(data);
});

test('Undefined if file does not exist', async () => {
  const nonExistentFile = `${tempDir}//nonexistent.txt`;
  const content = await io.readFile(nonExistentFile);
  expect(content).toBeUndefined();
});

test('Get all file names in a directory', async () => {
  const fileNames = ['foo.txt', 'bar.txt'];
  await Promise.all(
    fileNames.map(fileName =>
      fs.writeFile(`${tempDir}//${fileName}`, 'sample data')
    )
  );

  const returnedFileNames = await io.getAllFileNames(tempDir);

  fileNames.forEach(fileName => {
    expect(returnedFileNames).toContain(fileName);
  });
});

test('Error if directory does not exist', async () => {
  const nonExistentDir = `${tempDir}//nonexistent`;
  const fileNames = await io.getAllFileNames(nonExistentDir);
  expect(fileNames).toBeUndefined();
});
