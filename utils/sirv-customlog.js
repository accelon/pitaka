//modify sirv-cli/index.js line 77
/*
const contentlength=res._header.match(/Content-Length: (\d+)/)[1];
stdout.write(toCode(res.statusCode) + dash + contentlength.toString().padStart(7) + dash +toMS(dur) + dash + uri + '\n');
*/