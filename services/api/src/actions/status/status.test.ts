import supertest from 'supertest';

describe('Status', () => {
  const request = supertest('http://localhost:4000');

  it('get /status returns OK', async () => {
    const res = await request.get('/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});
