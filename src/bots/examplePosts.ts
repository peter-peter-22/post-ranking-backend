import fs from "fs"; 

export const examplePosts = JSON.parse(fs.readFileSync('file', 'utf8'));

export const topics = Object.keys(examplePosts);