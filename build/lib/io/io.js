/**
 * @file io.ts
 * @description I/O utility functions for reading and writing files.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date January 26, 2025
 * @dependencies node:fs/promises, node:path
 */
import fs from 'node:fs/promises';
import path from 'node:path';
/**
 * Reads a file from the specified path.
 *
 * @param {string} filePath - The path to the file to read.
 * @returns {Promise<string | undefined>} The contents of the file.
 */
export async function readFile(filePath) {
    let contents;
    try {
        contents = await fs.readFile(path.resolve(filePath), 'utf-8');
    }
    catch (err) {
        console.error('Error reading file:', err);
    }
    return contents;
}
/**
 * Reads all the file names from the specified directory.
 *
 * @param {*} dirPath - The path to the directory to read.
 * @returns {Promise<string[] | undefined>} The names of all the files in the directory.
 */
export async function getAllFileNames(dirPath) {
    let fileNames;
    try {
        fileNames = await fs.readdir(path.resolve(dirPath));
    }
    catch (err) {
        console.error('Error reading directory:', err);
    }
    return fileNames;
}
/**
 * Writes to a file at the specified path.
 *
 * @param {string} filePath - The path to the file to write.
 * @param {string} data  - The data to write to the file.
 * @returns {Promise<void>} Resolves when the file has been written to.
 */
export async function writeFile(filePath, data) {
    try {
        await fs.writeFile(path.resolve(filePath), data);
    }
    catch (err) {
        console.error('Error writing file:', err);
    }
}
