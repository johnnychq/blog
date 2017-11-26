
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const argv = process.argv;
const blogUrl = argv[2];
const assert = require('assert');

assert(blogUrl, '请输入github blog地址');

async function run() {
    const response = await axios(blogUrl + '/issues');
    const articles = response.data;

    let updateTime = {};

    articles.forEach(async (blog) => {


        let { labels } = blog;
        let post = '';
        let metas = ['---'];
        let tags = [];
        let cats = [];
        let blogName = null;

        labels = labels.filter((label) => {
            if (/^blog-(.*)/.test(label.name)) {
                blogName = label.name.slice(5);
                return false;
            } else if (/^cat-/.test(label.name)) {
                cats.push('- ' + label.name.slice(4));
                return true;
            } else {
                tags.push('- ' + label.name);
                return true;
            }
        });

        if (!blogName) {
            console.info('Not a blog issue, skip, issue id:', blog.number);
            return;
        }

        metas.push(`title: ${blog.title}`)
        // console.log(blog);
        metas.push('date: ' + blog.created_at);
        updateTime[blog.number] = blog.updated_at;


        if (cats.length) {
            metas.push('categories:');
            metas = metas.concat(cats);
        }
        if (tags.length) {
            metas.push('tags:');
            metas = metas.concat(tags);
        }

        metas.push('---');

        post = metas.join('\n') + '\n\n' + blog.body;

        fs.writeFileSync(path.join(__dirname, `./source/_posts/${blogName}.md`), post);


    });
}


run();