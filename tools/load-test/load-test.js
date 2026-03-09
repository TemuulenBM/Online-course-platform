/**
 * k6 Load Test — Онлайн сургалтын платформ
 *
 * Суулгах: brew install k6
 * Ажиллуулах:
 *   k6 run tools/load-test/load-test.js
 *   k6 run --vus 50 --duration 2m tools/load-test/load-test.js   # 50 хэрэглэгч, 2 минут
 *
 * Орчин тохируулах:
 *   BASE_URL=https://staging.example.com k6 run tools/load-test/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const courseListDuration = new Trend('course_list_duration');

// Тест тохиргоо — 3 шатны ачаалал (ramp-up → peak → ramp-down)
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Аажмаар 10 хэрэглэгч
    { duration: '1m', target: 30 }, // 30 хэрэглэгч хүртэл нэмэгдэх
    { duration: '30s', target: 50 }, // Оргил ачаалал: 50 хэрэглэгч
    { duration: '1m', target: 50 }, // 50 хэрэглэгчээр барих
    { duration: '30s', target: 0 }, // Аажмаар буурах
  ],
  thresholds: {
    // Амжилтын шалгуурууд
    http_req_duration: ['p(95)<2000'], // 95% хүсэлт 2 секундэд багтах
    http_req_failed: ['rate<0.05'], // 5%-аас бага алдаа
    errors: ['rate<0.1'], // 10%-аас бага custom алдаа
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001/api/v1';

// Тестийн хэрэглэгчдийн мэдээлэл
const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'loadtest@example.com',
  password: __ENV.TEST_PASSWORD || 'LoadTest123!',
};

/**
 * Шат 1: Health check — сервер амьд эсэхийг шалгах
 */
function healthCheck() {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}`);
    check(res, {
      'health status 200': (r) => r.status === 200,
      'health response ok': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data?.status === 'ok' || body.success === true;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });
}

/**
 * Шат 2: Нэвтрэх (login) — auth endpoint ачааллын тест
 */
function login() {
  let token = null;

  group('Auth - Login', () => {
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    loginDuration.add(loginRes.timings.duration);

    const success = check(loginRes, {
      'login status 200/201': (r) => r.status === 200 || r.status === 201,
      'login has token': (r) => {
        try {
          const body = JSON.parse(r.body);
          token = body.data?.accessToken || body.data?.tokens?.accessToken;
          return !!token;
        } catch {
          return false;
        }
      },
    });

    if (!success) errorRate.add(1);
  });

  return token;
}

/**
 * Шат 3: Нийтийн endpoint-ууд — JWT шаардахгүй
 */
function publicEndpoints() {
  group('Public - Course List', () => {
    const res = http.get(`${BASE_URL}/courses?page=1&limit=10`);
    courseListDuration.add(res.timings.duration);

    check(res, {
      'courses status 200': (r) => r.status === 200,
      'courses has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true && body.data !== undefined;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
  });

  group('Public - Categories', () => {
    const res = http.get(`${BASE_URL}/categories`);
    check(res, {
      'categories status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

/**
 * Шат 4: Хамгаалагдсан endpoint-ууд — JWT шаардана
 */
function authenticatedEndpoints(token) {
  if (!token) return;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  group('Auth - Profile', () => {
    const res = http.get(`${BASE_URL}/users/me/profile`, authHeaders);
    check(res, {
      'profile status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  group('Auth - My Enrollments', () => {
    const res = http.get(`${BASE_URL}/enrollments/my`, authHeaders);
    check(res, {
      'enrollments status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  group('Auth - Notifications Count', () => {
    const res = http.get(`${BASE_URL}/notifications/unread-count`, authHeaders);
    check(res, {
      'notifications status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

/**
 * Үндсэн тестийн урсгал — VU (virtual user) бүр энэ функцийг ажиллуулна
 */
export default function () {
  // 1. Health check
  healthCheck();
  sleep(1);

  // 2. Нийтийн endpoint
  publicEndpoints();
  sleep(1);

  // 3. Нэвтрэх + хамгаалагдсан endpoint
  const token = login();
  sleep(0.5);

  // 4. Хамгаалагдсан endpoint-ууд
  authenticatedEndpoints(token);
  sleep(1);
}

/**
 * Тест дууссаны дараа нэгтгэл хэвлэх
 */
export function handleSummary(data) {
  const summary = {
    // Хүсэлтийн статистик
    total_requests: data.metrics.http_reqs?.values?.count || 0,
    avg_duration_ms: Math.round(data.metrics.http_req_duration?.values?.avg || 0),
    p95_duration_ms: Math.round(data.metrics.http_req_duration?.values?.['p(95)'] || 0),
    p99_duration_ms: Math.round(data.metrics.http_req_duration?.values?.['p(99)'] || 0),
    error_rate: ((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2) + '%',
  };

  console.log('\n=== LOAD TEST НЭГТГЭЛ ===');
  console.log(`Нийт хүсэлт: ${summary.total_requests}`);
  console.log(`Дундаж хугацаа: ${summary.avg_duration_ms}ms`);
  console.log(`P95 хугацаа: ${summary.p95_duration_ms}ms`);
  console.log(`P99 хугацаа: ${summary.p99_duration_ms}ms`);
  console.log(`Алдааны хувь: ${summary.error_rate}`);
  console.log('========================\n');

  return {
    // JSON файлд хадгалах
    'tools/load-test/results.json': JSON.stringify(summary, null, 2),
    // stdout-д k6 default summary хэвлэх
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// k6 built-in text summary helper
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
