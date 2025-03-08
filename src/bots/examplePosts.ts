import fs from "fs"; 

export const examplePosts:{ [key: string]: string[]} = JSON.parse(fs.readFileSync('./src/bots/posts.json', 'utf8'));

export const topics = Object.keys(examplePosts);