import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export let responseTime = new Trend('custom_response_time');

export let options = {
    vus: 500,
    duration: '5m',
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export function handleSummary(data) {
    return {
        "report.html": htmlReport(data),
    };
}

export default function () {
    group('GET /posts', function () {
        let res = http.get(`${BASE_URL}/posts`);
        responseTime.add(res.timings.duration);
        check(res, {
            'status is 200': (r) => r.status === 200,
            'body is not empty': (r) => r.body && r.body.length > 0,
        });
    });

    group('POST /posts', function () {
        let payload = JSON.stringify({ title: "foo", body: "bar", userId: 1 });
        let params = { headers: { 'Content-Type': 'application/json' } };
        let res = http.post(`${BASE_URL}/posts`, payload, params);
        responseTime.add(res.timings.duration);
        check(res, {
            'status is 201': (r) => r.status === 201,
        });
    });

    group('PUT /posts/1', function () {
        let payload = JSON.stringify({ id: 1, title: "foo", body: "bar", userId: 1 });
        let params = { headers: { 'Content-Type': 'application/json' } };
        let res = http.put(`${BASE_URL}/posts/1`, payload, params);
        responseTime.add(res.timings.duration);
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
    });

    group('DELETE /posts/1', function () {
        let res = http.del(`${BASE_URL}/posts/1`);
        responseTime.add(res.timings.duration);
        check(res, {
            'status is 200': (r) => r.status === 200,
        });
    });

    sleep(1);
}