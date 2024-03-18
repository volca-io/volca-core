import { useServer } from '../../test-utils/setup-server';

describe('/status', () => {
  const getRequest = useServer();

  it('returns OK', async () => {
    const res = await getRequest().get('/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ status: 'OK' });
  });
});
