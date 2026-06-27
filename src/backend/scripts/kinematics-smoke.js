const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';

const prompt =
  'Một vật chuyển động thẳng biến đổi đều với vận tốc ban đầu v0 = 3 m/s và gia tốc a = 1 m/s^2. Hãy mô phỏng và tính quãng đường vật đi được sau 5 giây.';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const body = await response.text();
  const json = body ? JSON.parse(body) : undefined;

  if (!response.ok) {
    throw new Error(
      `${options.method ?? 'GET'} ${path} failed with ${response.status}: ${body}`,
    );
  }

  return json;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function seedLearningData() {
  const seedEndpoints = [
    '/learning/simulation-templates/seed',
    '/learning/theory-chunks/seed/default',
    '/learning/problem-patterns/seed/default',
  ];

  for (const endpoint of seedEndpoints) {
    await request(endpoint, { method: 'POST', body: '' });
    console.log(`seed ok: ${endpoint}`);
  }
}

async function runAnalyzeSmokeTest() {
  const response = await request('/ai/analyze', {
    method: 'POST',
    body: JSON.stringify({
      message: prompt,
      subject: 'physics',
      grade: 11,
    }),
  });
  const output = response?.data ?? response;

  console.log('AI analyze response:', JSON.stringify(output, null, 2));

  assert(output.subject === 'physics', 'subject is not physics');
  assert(output.simulation?.simulation_id === 'SIM-21', 'simulation_id is not SIM-21');
  
  console.log('kinematics analyze ok:', {
    intent: output.intent,
    subject: output.subject,
    topic: output.topic,
    simulation_id: output.simulation?.simulation_id,
  });
}

async function main() {
  console.log(`Kinematics AI smoke test baseUrl: ${baseUrl}`);
  await seedLearningData();
  await runAnalyzeSmokeTest();
  console.log('Kinematics AI smoke test passed successfully!');
}

main().catch((error) => {
  console.error('Kinematics AI smoke test failed');
  console.error(error);
  process.exit(1);
});
