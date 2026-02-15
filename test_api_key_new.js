const userKey = 'AIzaSyAm8F9UiPf4OWkgK5UuKv08q7ioKz-7FNg';

async function test(model, version) {
    const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${userKey}`;
    console.log(`\nTesting ${model} on ${version}...`);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (data.error) {
            console.error("Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Success!");
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

async function run() {
    await test('gemini-1.5-flash', 'v1beta');
    await test('gemini-2.0-flash', 'v1');
}

run();
