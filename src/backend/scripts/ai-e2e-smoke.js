const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000/api';

const prompt =
  'Một vật dao động điều hòa theo phương trình x = 5cos(4πt + π/3) cm. Hãy tính chu kì và mô phỏng chuyển động.';

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

function getData(response) {
  return response?.data ?? response;
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
  const output = getData(response);

  assert(output.intent === 'solve_and_simulate', 'intent is not solve_and_simulate');
  assert(
    output.topic === 'simple_harmonic_motion',
    'topic is not simple_harmonic_motion',
  );
  assert(
    output.analysis?.pattern_id === 'SHM_FIND_PERIOD_FROM_EQUATION',
    'pattern_id is not SHM_FIND_PERIOD_FROM_EQUATION',
  );
  assert(
    output.analysis?.target?.includes('T'),
    'target does not include T',
  );
  assert(
    output.answer?.short_answer?.includes('0,5 s'),
    'short answer does not include 0,5 s',
  );
  assert(
    output.simulation?.simulation_id === 'SIM_SHM_BASIC',
    'simulation_id is not SIM_SHM_BASIC',
  );
  assert(
    output.simulation?.parameters?.some(
      (parameter) => parameter.key === 'omega' && parameter.value === 12.566,
    ),
    'simulation omega numeric parameter is missing',
  );
  assert(
    output.references?.length > 0,
    'RAG references are empty',
  );

  console.log('analyze ok:', {
    intent: output.intent,
    topic: output.topic,
    pattern_id: output.analysis.pattern_id,
    answer: output.answer.short_answer,
    simulation_id: output.simulation.simulation_id,
    references: output.references.map((reference) => reference.id),
  });
}

async function main() {
  console.log(`AI e2e smoke test baseUrl: ${baseUrl}`);
  await seedLearningData();
  await runAnalyzeSmokeTest();
  console.log('AI e2e smoke test passed');
}

main().catch((error) => {
  console.error('AI e2e smoke test failed');
  console.error(error);
  process.exit(1);
});
